from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource

from models import User, Passenger
from schemas import UserSchema, PassengerSchema


user_schema = UserSchema()
passenger_schema = PassengerSchema()

VALID_USER_TYPES = ("passenger", "user")


class MeResource(Resource):
    @jwt_required()
    def get(self):
        user_type = request.args.get('user_type')

        if user_type not in VALID_USER_TYPES:
            return {
                "error": f"user_type query param is required and must be one of: {', '.join(VALID_USER_TYPES)}."
            }, 400

        current_id = get_jwt_identity()

        if user_type == "passenger":
            passenger = Passenger.query.get(current_id)
            if not passenger:
                return {"error": "Passenger not found."}, 404
            return passenger_schema.dump(passenger), 200

        user = User.query.get(current_id)
        if not user:
            return {"error": "User not found."}, 404
        return user_schema.dump(user), 200