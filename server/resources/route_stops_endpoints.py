from flask import request
from flask_restful import Resource
from marshmallow import ValidationError

from config import db
from models import RouteStop
from schemas import RouteStopDetailSchema, RouteStopUpdateSchema


route_stop_detail_schema = RouteStopDetailSchema()
route_stop_update_schema = RouteStopUpdateSchema()


class UpdateRouteStopResource(Resource):
    """/api/v1/provider/routes/<int:route_id>/stops/<int:stop_id>"""
    def patch(self, route_id, stop_id):
        route_stop = RouteStop.query.filter_by(
            route_id=route_id,
            stop_id=stop_id
        ).first()

        if not route_stop:
            return {
                "error": "Route stop not found."
            }, 404

        data = request.get_json()

        if not data:
            return {
                "error": "Request body is required."
            }, 400

        try:
            validated_data = route_stop_update_schema.load(data)
        except ValidationError as err:
            return {
                "errors": err.messages
            }, 400

        route_stop.sequence = validated_data["sequence"]

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {
                "error": "Unable to update route stop."
            }, 400

        return route_stop_detail_schema.dump(route_stop), 200

class DeleteRouteStopResource(Resource):
    """/api/v1/provider/routes/<int:route_id>/stops/<int:stop_id>"""
    def delete(self, route_id, stop_id):
        route_stop = RouteStop.query.filter_by(
            route_id=route_id,
            stop_id=stop_id
        ).first()

        if not route_stop:
            return {
                "error": "Route stop not found."
            }, 404

        try:
            db.session.delete(route_stop)
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {
                "error": "Unable to delete route stop."
            }, 400

        return {
            "message": "Route stop deleted successfully."
        }, 200