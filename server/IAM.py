from flask import request, jsonify, make_response
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User, passenger
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
        pass

class ProviderLoginResource(Resource):
    def post(self):
        pass

class PassengerRegisterResource(Resource):
    def post(self):
        pass

class ProviderRegisterResource(Resource):
    def post(self):
        pass

api.add_resource(PassengerLoginResource, '/api/v1/auth/passenger/login')
api.add_resource(ProviderLoginResource, '/api/v1/auth/provider/login')
api.add_resource(PassengerRegisterResource, '/api/v1/auth/passenger/register')
api.add_resource(ProviderRegisterResource, '/api/v1/auth/provider/register')