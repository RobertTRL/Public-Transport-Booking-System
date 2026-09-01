from flask import request
from flask_restful import Resource
from sqlalchemy.orm import aliased, joinedload

from config import db
from models import Route, RouteStop, Stop
from schemas import RouteSchema


class GeneralRouteInfoResource(Resource):
    """GET /api/v1/routes/generalinfo - Return all routes with id, name, and color only (no stops)."""
    
    def get(self):
        routes = Route.query.order_by(Route.name.asc()).all()
        
        return {
            'items': [
                {
                    'id': route.id,
                    'name': route.name,
                    'color': route.color
                }
                for route in routes
            ]
        }, 200


class RouteSearchResource(Resource):
    def get(self):
        origin_stop_id = request.args.get("origin_stop_id", type=int)
        destination_stop_id = request.args.get(
            "destination_stop_id",
            type=int,
        )

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

        matching_route_ids = (
            db.session.query(Route.id)
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
        )

        routes = (
            Route.query
            .filter(Route.id.in_(matching_route_ids))
            .options(
                joinedload(Route.route_stops).joinedload(RouteStop.stop)
            )
            .order_by(Route.name.asc())
            .all()
        )

        return RouteSchema(many=True).dump(routes), 200


class PassengerRouteStopsResource(Resource):
    """GET /api/v1/routes/<int:route_id>/stops - Return route stops with stop info (no latitude/longitude)."""
    
    def get(self, route_id):
        route = db.session.get(Route, route_id)
        if not route:
            return {'error': 'Route not found'}, 404

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 5, type=int)

        pagination = (
            RouteStop.query
            .filter_by(route_id=route_id)
            .order_by(RouteStop.sequence.asc())
            .paginate(
                page=page,
                per_page=per_page,
                error_out=False
            )
        )

        route_stops = pagination.items

        return {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'total_pages': pagination.pages,
            'items': [
                {
                    'id': rs.id,
                    'stop_id': rs.stop_id,
                    'sequence': rs.sequence,
                    'name': rs.stop.name if rs.stop else None
                }
                for rs in route_stops
            ]
        }, 200


class RouteResource(Resource):
    def get(self, route_id):
        route = (
            Route.query
            .options(
                joinedload(Route.route_stops).joinedload(RouteStop.stop)
            )
            .filter_by(id=route_id)
            .first()
        )

        if not route:
            return {
                "error": "Route not found."
            }, 404

        return RouteSchema().dump(route), 200
