from flask import request
from flask_restful import Resource

from config import db
from models import Vehicle
from schemas import VehicleSchema


vehicle_schema = VehicleSchema()
vehicles_schema = VehicleSchema(many=True)


class ListVehiclesResource(Resource):
    def get(self):
        vehicles = Vehicle.query.all()
        return vehicles_schema.dump(vehicles), 200