from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from marshmallow import ValidationError

from config import db
from models import Stop
from schemas import StopSchema
from .helpers import get_current_provider_user

stop_schema = StopSchema()
stops_schema = StopSchema(many=True)


class ProviderStopsResource(Resource):
    """/api/v1/provider/stops"""

    @jwt_required()
    def get(self):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        stops = Stop.query.all()
        return stops_schema.dump(stops), 200

    @jwt_required()
    def post(self):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        data = request.get_json()
        if not data:
            return {'error': 'Request body is required.'}, 400

        try:
            validated_data = stop_schema.load(data)
        except ValidationError as err:
            return {'errors': err.messages}, 400

        stop = Stop(**validated_data)
        db.session.add(stop)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {'error': 'Unable to create stop.'}, 400

        return stop_schema.dump(stop), 201


class ProviderStopResource(Resource):
    """/api/v1/provider/stops/<int:stop_id>"""

    @jwt_required()
    def patch(self, stop_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        stop = db.session.get(Stop, stop_id)
        if not stop:
            return {'error': 'Stop not found.'}, 404

        data = request.get_json()
        if not data:
            return {'error': 'Request body is required.'}, 400

        try:
            validated_data = stop_schema.load(data, partial=True)
        except ValidationError as err:
            return {'errors': err.messages}, 400

        for key, value in validated_data.items():
            setattr(stop, key, value)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {'error': 'Unable to update stop.'}, 400

        return stop_schema.dump(stop), 200

    @jwt_required()
    def delete(self, stop_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        stop = db.session.get(Stop, stop_id)
        if not stop:
            return {'error': 'Stop not found.'}, 404

        try:
            db.session.delete(stop)
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {'error': 'Unable to delete stop. It may be referenced by a route.'}, 400

        return {'message': 'Stop deleted successfully.'}, 200