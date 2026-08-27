from flask import request
from flask_restful import Resource

from config import db
from models import Vehicle, Trip, RouteStop
from schemas import VehicleSchema


vehicle_schema = VehicleSchema()
vehicles_schema = VehicleSchema(many=True)


class ListVehiclesResource(Resource):
    def get(self):
        route_id = request.args.get('route_id', type=int)
        q = request.args.get('q', type=str)

        query = Vehicle.query

        if route_id:
            origin_stop = db.aliased(RouteStop)
            destination_stop = db.aliased(RouteStop)

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

       def post(self):
        data = request.get_json()

        if not data:
            return {
                "error": "Request body is required."
            }, 400

        try:
            validated_data = vehicle_schema.load(data)
        except ValidationError as err:
            return {
                "errors": err.messages
            }, 400

        vehicle = Vehicle(**validated_data)
        db.session.add(vehicle)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {
                "error": "Unable to create vehicle. Number plate may already be in use."
            }, 400

        return vehicle_schema.dump(vehicle), 201