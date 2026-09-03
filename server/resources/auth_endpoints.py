from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt, create_access_token, create_refresh_token
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
        data = request.get_json() or {}

        user_type, error = resolve_user_type(data)
        if error:
            return error

        email = (data.get('email') or '').strip().lower()
        password = data.get('password')
        model = USER_TYPE_MODELS[user_type]
        account = model.query.filter(db.func.lower(model.email) == email).first()

        if account and account.authenticate(password):
            claims = {
                "user_type": user_type,
                "role": getattr(account, "role", "passenger"),
            }
            access_token = create_access_token(identity=str(account.id), additional_claims=claims)
            refresh_token = create_refresh_token(identity=str(account.id), additional_claims=claims)
            return {'access_token': access_token, 'refresh_token': refresh_token}, 200

        return {'error': 'Invalid credentials'}, 401


class RegisterResource(Resource):
    def post(self):
        data = request.get_json() or {}

        user_type, error = resolve_user_type(data)
        if error:
            return error

        email = (data.get('email') or '').strip().lower()
        password = data.get('password')
        model = USER_TYPE_MODELS[user_type]

        if model.query.filter(db.func.lower(model.email) == email).first():
            return {'error': 'Email already exists'}, 400

        if user_type == "passenger":
            new_account = Passenger(
                email=email,
                phone_number=data.get('phone_number')
            )
        else:
            name, role, sacco_id = data.get('name'), data.get('role'), data.get('sacco_id')
            new_account = User(name=name, email=email, role=role, sacco_id=sacco_id)

        new_account.set_password(password)
        db.session.add(new_account)
        db.session.commit()

        claims = {
            "user_type": user_type,
            "role": getattr(new_account, "role", "passenger"),
        }
        access_token = create_access_token(identity=str(new_account.id), additional_claims=claims)
        refresh_token = create_refresh_token(identity=str(new_account.id), additional_claims=claims)
        return {'access_token': access_token, 'refresh_token': refresh_token}, 201


class MeResource(Resource):
    @jwt_required()
    def get(self):
        user_type = request.args.get('user_type')

        if user_type not in VALID_USER_TYPES:
            return {
                "error": f"user_type query param is required and must be one of: {', '.join(VALID_USER_TYPES)}."
            }, 400

        jwt_claims = get_jwt()
        token_user_type = jwt_claims.get("user_type")
        if token_user_type and token_user_type != user_type:
            return {
                "error": f"Token is for a {token_user_type}, but requested {user_type} profile."
            }, 403

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


class RefreshTokenResource(Resource):
    @jwt_required(refresh=True)
    def post(self):
        current_identity = get_jwt_identity()
        claims = get_jwt()
        user_type = claims.get("user_type")
        role = claims.get("role")
        new_claims = {}
        if user_type:
            new_claims["user_type"] = user_type
        if role:
            new_claims["role"] = role

        new_access_token = create_access_token(identity=str(current_identity), additional_claims=new_claims)
        return {'access_token': new_access_token}, 200