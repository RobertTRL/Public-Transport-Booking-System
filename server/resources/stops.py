from flask import request
from flask_restful import Resource
from marshmallow import ValidationError

from config import db
from models import Stop
from schemas import StopSchema


stop_schema = StopSchema()
stops_schema = StopSchema(many=True)


class CreateStopResource(Resource):
    def post(self):
        data = request.get_json()

        if not data:
            return {
                "error": "Request body is required."
            }, 400

        try:
            validated_data = stop_schema.load(data)
        except ValidationError as err:
            return {
                "errors": err.messages
            }, 400

        stop = Stop(**validated_data)
        db.session.add(stop)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {
                "error": "Unable to create stop."
            }, 400

        return stop_schema.dump(stop), 201


class UpdateStopResource(Resource):
    def patch(self, stop_id):
        stop = Stop.query.get(stop_id)

        if not stop:
            return {
                "error": "Stop not found."
            }, 404

        data = request.get_json()

        if not data:
            return {
                "error": "Request body is required."
            }, 400

        try:
            validated_data = stop_schema.load(data, partial=True)
        except ValidationError as err:
            return {
                "errors": err.messages
            }, 400

        for key, value in validated_data.items():
            setattr(stop, key, value)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {
                "error": "Unable to update stop."
            }, 400

        return stop_schema.dump(stop), 200


class DeleteStopResource(Resource):
    def delete(self, stop_id):
        stop = Stop.query.get(stop_id)

        if not stop:
            return {
                "error": "Stop not found."
            }, 404

        try:
            db.session.delete(stop)
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {
                "error": "Unable to delete stop. It may be referenced by a route."
            }, 400

        return {
            "message": "Stop deleted successfully."
        }, 200