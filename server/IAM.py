from flask import request, jsonify, make_response
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User, Passenger
from flask_restful import Resource
from config import db, api

"""
POST	            /api/v1/auth/passenger/register	                                                        register_passenger() ✓
POST	            /api/v1/auth/provider/register	                                                        register_provider() ✓
POST	            /api/v1/auth/passenger/login	                                                        login_passenger() ✓
POST	            /api/v1/auth/provider/login
"""

class PassengerLoginResource(Resource):
    def post(self):
        data = request.get_json()
        email, password = data.get('email'), data.get('password')
        passenger = Passenger.query.filter_by(email=email).first()

        if passenger and passenger.authenticate(password):
            access_token = create_access_token(identity=passenger.id)
            return {'access_token': access_token}, 200

        return {'error': 'Invalid credentials'}, 401

class ProviderLoginResource(Resource):
    def post(self):
        data = request.get_json()
        email, password = data.get('email'), data.get('password')
        user = User.query.filter_by(email=email).first()

        if user and user.authenticate(password):
            access_token = create_access_token(identity=user.id)
            return {'access_token': access_token}, 200

        return {'error': 'Invalid credentials'}, 401

class PassengerRegisterResource(Resource):
    def post(self):
        data = request.get_json()
        name, email, password = data.get('name'), data.get('email'), data.get('password')

        if Passenger.query.filter_by(email=email).first():
            return {'error': 'Email already exists'}, 400

        new_passenger = Passenger(name=name, email=email)
        new_passenger.set_password(password)
        db.session.add(new_passenger)
        db.session.commit()

        access_token = create_access_token(identity=new_passenger.id)
        return {'access_token': access_token}, 201

class ProviderRegisterResource(Resource):
    def post(self):
        pass

api.add_resource(PassengerLoginResource, '/api/v1/auth/passenger/login')
api.add_resource(ProviderLoginResource, '/api/v1/auth/provider/login')
api.add_resource(PassengerRegisterResource, '/api/v1/auth/passenger/register')
api.add_resource(ProviderRegisterResource, '/api/v1/auth/provider/register')