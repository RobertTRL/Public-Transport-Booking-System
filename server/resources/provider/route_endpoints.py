from flask import request
from flask_restful import Resource
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity
from config import db
from models import Route
from schemas import RouteSchema


route_schema = RouteSchema()
routes_schema = RouteSchema(many=True)


class ListCreateRouteResource(Resource):
    @jwt_required()
    def get(self):
        routes = Route.query.all()
        return routes_schema.dump(routes), 200

    @jwt_required()
    def post(self):
        data = request.get_json()

        if not data:
            return {
                "error": "Request body is required."
            }, 400

        try:
            validated_data = route_schema.load(data)
        except ValidationError as err:
            return {
                "errors": err.messages
            }, 400

        route = Route(**validated_data)
        db.session.add(route)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {
                "error": "Unable to create route. Color may already be in use."
            }, 400

        return route_schema.dump(route), 201


class UpdateRouteResource(Resource):
    """/api/v1/provider/routes/<int:route_id>"""
    @jwt_required()
    def patch(self, route_id):
        route = Route.query.get(route_id)

        if not route:
            return {
                "error": "Route not found."
            }, 404

        data = request.get_json()

        if not data:
            return {
                "error": "Request body is required."
            }, 400

        try:
            validated_data = route_schema.load(data, partial=True)
        except ValidationError as err:
            return {
                "errors": err.messages
            }, 400

        for key, value in validated_data.items():
            setattr(route, key, value)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {
                "error": "Unable to update route."
            }, 400

        return route_schema.dump(route), 200

class DeleteRouteResource(Resource):
    """/api/v1/provider/routes/<int:route_id>"""
    @jwt_required()
    def delete(self, route_id):
        route = Route.query.get(route_id)

        if not route:
            return {
                "error": "Route not found."
            }, 404

        try:
            db.session.delete(route)
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {
                "error": "Unable to delete route."
            }, 400

        return {
            "message": "Route deleted successfully."
        }, 200