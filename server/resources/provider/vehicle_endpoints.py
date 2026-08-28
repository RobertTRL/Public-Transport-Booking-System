from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from marshmallow import ValidationError
from sqlalchemy.orm import aliased

from config import api, db
from models import RouteStop, Trip, Vehicle
from schemas import VehicleSchema
from provider.helpers import get_current_provider_user, vehicle_response

vehicle_schema = VehicleSchema()
vehicles_schema = VehicleSchema(many=True)


class ListVehiclesResource(Resource):
    """/api/v1/provider/vehicles"""

    @jwt_required()
    def get(self):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        route_id = request.args.get('route_id', type=int)
        q = request.args.get('q', type=str)

        # Scoped to the requesting provider's own SACCO, matching
        # ProviderDashboardResource — a provider should only see (and
        # manage) vehicles that belong to their own SACCO.
        query = Vehicle.query.filter_by(sacco_id=user.sacco_id)

        if route_id:
            origin_stop = aliased(RouteStop)
            destination_stop = aliased(RouteStop)

            query = (
                query
                .join(Trip, Trip.vehicle_id == Vehicle.id)
                .join(origin_stop, Trip.origin_routestop_id == origin_stop.id)
                .join(destination_stop, Trip.destination_routestop_id == destination_stop.id)
                .filter(
                    db.or_(
                        origin_stop.route_id == route_id,
                        destination_stop.route_id == route_id
                    )
                )
                .distinct()
            )

        if q:
            query = query.filter(Vehicle.number_plate.ilike(f"%{q}%"))

        vehicles = query.all()
        return vehicles_schema.dump(vehicles), 200


class CreateVehicleResource(Resource):
    """/api/v1/provider/vehicles"""

    @jwt_required()
    def post(self):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        data = request.get_json()
        if not data:
            return {'error': 'Request body is required.'}, 400

        try:
            validated_data = vehicle_schema.load(data)
        except ValidationError as err:
            return {'errors': err.messages}, 400

        # Always tie a new vehicle to the creating provider's own SACCO,
        # regardless of what the client sends — prevents a provider from
        # registering a vehicle under a different SACCO.
        validated_data['sacco_id'] = user.sacco_id

        vehicle = Vehicle(**validated_data)
        db.session.add(vehicle)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {'error': 'Unable to create vehicle. Number plate may already be in use.'}, 400

        return vehicle_schema.dump(vehicle), 201


class ProviderVehicleResource(Resource):
    """/api/v1/provider/vehicles/<int:vehicle_id>"""

    @jwt_required()
    def get(self, vehicle_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        vehicle = db.session.get(Vehicle, vehicle_id)
        if vehicle is None:
            return {"error": "Vehicle not found"}, 404

        if vehicle.sacco_id != user.sacco_id:
            return {"error": "You are not authorized to view this vehicle."}, 403

        return vehicle_response(vehicle), 200

    @jwt_required()
    def patch(self, vehicle_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        vehicle = db.session.get(Vehicle, vehicle_id)
        if vehicle is None:
            return {"error": "Vehicle not found"}, 404

        if vehicle.sacco_id != user.sacco_id:
            return {"error": "You are not authorized to modify this vehicle."}, 403

        data = request.get_json(silent=True)
        if not data:
            return {"error": "Request body is required"}, 400

        if "number_plate" in data:
            if not isinstance(data["number_plate"], str):
                return {"error": "number_plate must be a string"}, 400
            vehicle.number_plate = data["number_plate"]

        if "capacity" in data:
            if not isinstance(data["capacity"], int):
                return {"error": "capacity must be an integer"}, 400
            if data["capacity"] < 1:
                return {"error": "capacity must be at least 1"}, 400
            vehicle.capacity = data["capacity"]

        if "is_active" in data:
            if not isinstance(data["is_active"], bool):
                return {"error": "is_active must be a boolean"}, 400
            vehicle.is_active = data["is_active"]

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {"error": "Could not update vehicle"}, 400

        return vehicle_response(vehicle), 200

    @jwt_required()
    def delete(self, vehicle_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        vehicle = db.session.get(Vehicle, vehicle_id)
        if vehicle is None:
            return {"error": "Vehicle not found"}, 404

        if vehicle.sacco_id != user.sacco_id:
            return {"error": "You are not authorized to delete this vehicle."}, 403

        try:
            db.session.delete(vehicle)
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {"error": "Vehicle cannot be deleted because it is in use"}, 409

        return {"message": "Vehicle deleted successfully"}, 200