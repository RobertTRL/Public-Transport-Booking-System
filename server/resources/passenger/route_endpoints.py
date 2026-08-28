from flask import request
from flask_restful import Resource
from sqlalchemy.orm import aliased

from config import db
from models import Route, RouteStop, Stop
from schemas import RouteSchema


# =========================================================
# Route resources
# =========================================================

class RouteSearchResource(Resource):
    """Search for routes connecting two stops."""

    def get(self):
        origin_stop_id = request.args.get(
            "origin_stop_id",
            type=int,
        )
        destination_stop_id = request.args.get(
            "destination_stop_id",
            type=int,
        )

        # NOTE: use explicit `is None` checks rather than truthiness, so a
        # (hypothetical) valid id of 0 isn't rejected as "missing".
        if origin_stop_id is None or destination_stop_id is None:
            return {
                "error": (
                    "origin_stop_id and destination_stop_id "
                    "are required."
                )
            }, 400

        if origin_stop_id == destination_stop_id:
            return {
                "error": "Origin and destination stops must be different."
            }, 400

        origin_stop = db.session.get(Stop, origin_stop_id)
        destination_stop = db.session.get(Stop, destination_stop_id)

        if not origin_stop or not destination_stop:
            return {
                "error": "One or both stops could not be found."
            }, 404

        origin_route_stop = aliased(RouteStop)
        destination_route_stop = aliased(RouteStop)

        routes = (
            Route.query
            .join(
                origin_route_stop,
                Route.id == origin_route_stop.route_id,
            )
            .join(
                destination_route_stop,
                Route.id == destination_route_stop.route_id,
            )
            .filter(
                origin_route_stop.stop_id == origin_stop_id,
                destination_route_stop.stop_id == destination_stop_id,
                origin_route_stop.sequence
                < destination_route_stop.sequence,
            )
            .distinct()
            .order_by(Route.name.asc())
            .all()
        )

        return RouteSchema(many=True).dump(routes), 200


class RouteResource(Resource):
    """Return details for a single route."""

    def get(self, route_id):
        route = db.session.get(Route, route_id)

        if not route:
            return {
                "error": "Route not found."
            }, 404

        return RouteSchema().dump(route), 200