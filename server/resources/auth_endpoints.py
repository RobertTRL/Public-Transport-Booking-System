from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from flask_restful import Resource
from config import db
from models import User, Passenger
from schemas import UserSchema, PassengerSchema


user_schema = UserSchema()
passenger_schema = PassengerSchema()

VALID_USER_TYPES = ("passenger", "user")

class PassengerLoginResource(Resource):
    def post(self):
        data = request.get_json()
        email, password = data.get('email'), data.get('password')
        passenger = Passenger.query.filter_by(email=email).first()

        if passenger and passenger.authenticate(password):
            access_token = create_access_token(identity=str(passenger.id))
            return {'access_token': access_token}, 200

        return {'error': 'Invalid credentials'}, 401

class ProviderLoginResource(Resource):
    def post(self):
        data = request.get_json()
        email, password = data.get('email'), data.get('password')
        user = User.query.filter_by(email=email).first()

        if user and user.authenticate(password):
            access_token = create_access_token(identity=str(user.id))
            return {'access_token': access_token}, 200

        return {'error': 'Invalid credentials'}, 401

class PassengerRegisterResource(Resource):
    def post(self):
        data = request.get_json()
        email, password = data.get('email'), data.get('password')

        if Passenger.query.filter_by(email=email).first():
            return {'error': 'Email already exists'}, 400

        new_passenger = Passenger(email=email)
        new_passenger.set_password(password)
        db.session.add(new_passenger)
        db.session.commit()

        access_token = create_access_token(identity=str(new_passenger.id))
        return {'access_token': access_token}, 201

class ProviderRegisterResource(Resource):
    def post(self):
        data = request.get_json()
        name, email, password, role, sacco_id = data.get('name'), data.get('email'), data.get('password'), data.get('role'), data.get('sacco_id')

        if User.query.filter_by(email=email).first():
            return {'error': 'Email already exists'}, 400

        new_user = User(name=name, email=email, role=role, sacco_id=sacco_id)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        access_token = create_access_token(identity=str(new_user.id))
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