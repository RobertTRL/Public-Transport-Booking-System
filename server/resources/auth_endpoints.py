from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, create_refresh_token
from flask_restful import Resource
from config import db
from models import User, Passenger
from schemas import UserSchema, PassengerSchema


user_schema = UserSchema()
passenger_schema = PassengerSchema()

VALID_USER_TYPES = ("passenger", "user")

USER_TYPE_MODELS = {
    "passenger": Passenger,
    "user": User,
}


def resolve_user_type(data):
    """Validate user_type from the request body. Returns (user_type, None)
    on success, or (None, (body, status)) on failure — mirrors the
    validation MeResource does for the query param."""
    user_type = data.get("user_type")

    if user_type not in VALID_USER_TYPES:
        return None, ({
            "error": f"user_type is required and must be one of: {', '.join(VALID_USER_TYPES)}."
        }, 400)

    return user_type, None


class LoginResource(Resource):
    def post(self):
        data = request.get_json()

        user_type, error = resolve_user_type(data)
        if error:
            return error

        email, password = data.get('email'), data.get('password')
        model = USER_TYPE_MODELS[user_type]
        account = model.query.filter_by(email=email).first()

        if account and account.authenticate(password):
            access_token = create_access_token(identity=str(account.id))
            return {'access_token': access_token}, 200

        return {'error': 'Invalid credentials'}, 401


class RegisterResource(Resource):
    def post(self):
        data = request.get_json()

        user_type, error = resolve_user_type(data)
        if error:
            return error

        email, password = data.get('email'), data.get('password')
        model = USER_TYPE_MODELS[user_type]

        if model.query.filter_by(email=email).first():
            return {'error': 'Email already exists'}, 400

        if user_type == "passenger":
            new_account = Passenger(email=email)
        else:
            name, role, sacco_id = data.get('name'), data.get('role'), data.get('sacco_id')
            new_account = User(name=name, email=email, role=role, sacco_id=sacco_id)

        new_account.set_password(password)
        db.session.add(new_account)
        db.session.commit()

        access_token = create_access_token(identity=str(new_account.id))
        return {'access_token': access_token}, 201


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