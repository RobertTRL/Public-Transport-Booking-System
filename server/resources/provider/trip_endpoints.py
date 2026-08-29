from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from config import db
from models import Route, RouteStop, Trip, Vehicle
from .helpers import get_current_provider_user, parse_datetime, trip_response

ALLOWED_TRIP_STATUSES = {"scheduled", "in_progress", "completed", "cancelled"}


class ProviderRouteTripsResource(Resource):
    """/api/v1/provider/routes/<int:route_id>/trips"""

    @jwt_required()
    def get(self, route_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        route = db.session.get(Route, route_id)
        if route is None:
            return {"error": "Route not found"}, 404

        from_value = request.args.get("from")
        to_value = request.args.get("to")

        from_date = parse_datetime(from_value)
        to_date = parse_datetime(to_value)

        if from_value and from_date is None:
            return {"error": "Invalid 'from' datetime. Use ISO 8601 format."}, 400

        if to_value and to_date is None:
            return {"error": "Invalid 'to' datetime. Use ISO 8601 format."}, 400

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 5, type=int)

        route_stop_ids = [route_stop.id for route_stop in route.route_stops]

        if not route_stop_ids:
            # Same envelope shape as the populated case below, instead of
            # a bare list — keeps the response consistent for callers that
            # always expect an 'items' key.
            return {
                'page': page,
                'per_page': per_page,
                'total': 0,
                'total_pages': 0,
                'items': []
            }, 200

        query = Trip.query.filter(
            Trip.origin_routestop_id.in_(route_stop_ids),
            Trip.destination_routestop_id.in_(route_stop_ids)
        )

        if from_date:
            query = query.filter(Trip.start_time >= from_date)

        if to_date:
            query = query.filter(Trip.start_time <= to_date)

        pagination = query.order_by(Trip.start_time.asc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        trips = pagination.items

        return {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'total_pages': pagination.pages,
            'items': [trip_response(trip) for trip in trips]
        }, 200

    @jwt_required()
    def post(self, route_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        route = db.session.get(Route, route_id)
        if route is None:
            return {"error": "Route not found"}, 404

        data = request.get_json(silent=True)
        if not data:
            return {"error": "Request body is required"}, 400

        required_fields = ["origin_routestop_id", "destination_routestop_id", "vehicle_id"]
        missing = [field for field in required_fields if data.get(field) is None]
        if missing:
            return {"error": "Missing required fields", "fields": missing}, 400

        origin_id = data["origin_routestop_id"]
        destination_id = data["destination_routestop_id"]
        vehicle_id = data["vehicle_id"]

        if origin_id == destination_id:
            return {
                "error": "destination_routestop_id must be different from origin_routestop_id"
            }, 400

        origin_stop = db.session.get(RouteStop, origin_id)
        destination_stop = db.session.get(RouteStop, destination_id)
        vehicle = db.session.get(Vehicle, vehicle_id)

        if origin_stop is None:
            return {"error": "Origin route stop not found"}, 404

        if destination_stop is None:
            return {"error": "Destination route stop not found"}, 404

        if vehicle is None:
            return {"error": "Vehicle not found"}, 404

        if origin_stop.route_id != route_id:
            return {"error": "Origin route stop does not belong to this route"}, 400

        if destination_stop.route_id != route_id:
            return {"error": "Destination route stop does not belong to this route"}, 400

        # Origin must actually precede destination along the route,
        # otherwise the trip would run backwards.
        if origin_stop.sequence >= destination_stop.sequence:
            return {
                "error": "origin_routestop_id must come before destination_routestop_id on this route"
            }, 400

        if not vehicle.is_active:
            return {"error": "Vehicle is inactive"}, 400

        # A provider can only schedule their own SACCO's vehicles.
        if vehicle.sacco_id != user.sacco_id:
            return {"error": "You are not authorized to schedule this vehicle."}, 403

        start_time = parse_datetime(data.get("start_time"))
        stop_time = parse_datetime(data.get("stop_time"))

        if data.get("start_time") and start_time is None:
            return {"error": "Invalid start_time. Use ISO 8601 format."}, 400

        if data.get("stop_time") and stop_time is None:
            return {"error": "Invalid stop_time. Use ISO 8601 format."}, 400

        if start_time is None:
            return {"error": "start_time is required"}, 400

        if stop_time and stop_time <= start_time:
            return {"error": "stop_time must be later than start_time"}, 400

        status = data.get("status", "scheduled")
        if status not in ALLOWED_TRIP_STATUSES:
            return {"error": "Invalid trip status", "allowed": sorted(ALLOWED_TRIP_STATUSES)}, 400

        trip = Trip(
            origin_routestop_id=origin_id,
            destination_routestop_id=destination_id,
            vehicle_id=vehicle_id,
            start_time=start_time,
            stop_time=stop_time,
            status=status
        )

        db.session.add(trip)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {"error": "Could not create trip"}, 400

        return trip_response(trip), 201


class ProviderTripResource(Resource):
    """/api/v1/provider/trips/<int:trip_id>"""

    @jwt_required()
    def patch(self, trip_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        trip = db.session.get(Trip, trip_id)
        if trip is None:
            return {"error": "Trip not found"}, 404

        # Fail closed: if the trip's current vehicle is missing (e.g. it
        # was deleted, or vehicle_id is a dangling reference), treat that
        # as unauthorized rather than silently letting the check pass.
        current_vehicle = db.session.get(Vehicle, trip.vehicle_id)
        if not current_vehicle or current_vehicle.sacco_id != user.sacco_id:
            return {"error": "You are not authorized to modify this trip."}, 403

        data = request.get_json(silent=True)
        if not data:
            return {"error": "Request body is required"}, 400

        if "vehicle_id" in data:
            vehicle = db.session.get(Vehicle, data["vehicle_id"])

            if vehicle is None:
                return {"error": "Vehicle not found"}, 404

            if not vehicle.is_active:
                return {"error": "Vehicle is inactive"}, 400

            if vehicle.sacco_id != user.sacco_id:
                return {"error": "You are not authorized to schedule this vehicle."}, 403

            trip.vehicle_id = data["vehicle_id"]

        if "origin_routestop_id" in data:
            origin = db.session.get(RouteStop, data["origin_routestop_id"])
            if origin is None:
                return {"error": "Origin route stop not found"}, 404
            trip.origin_routestop_id = origin.id

        if "destination_routestop_id" in data:
            destination = db.session.get(RouteStop, data["destination_routestop_id"])
            if destination is None:
                return {"error": "Destination route stop not found"}, 404
            trip.destination_routestop_id = destination.id

        if trip.origin_routestop_id == trip.destination_routestop_id:
            return {
                "error": "destination_routestop_id must be different from origin_routestop_id"
            }, 400

        # Re-validate that origin and destination still belong to the same
        # route and are still in the right order — either field may have
        # just been changed independently above. Guard against either one
        # pointing at a route stop that no longer exists.
        origin_stop = db.session.get(RouteStop, trip.origin_routestop_id)
        destination_stop = db.session.get(RouteStop, trip.destination_routestop_id)

        if origin_stop is None or destination_stop is None:
            return {"error": "Trip references a route stop that no longer exists"}, 400

        if origin_stop.route_id != destination_stop.route_id:
            return {"error": "Origin and destination route stops must belong to the same route"}, 400

        if origin_stop.sequence >= destination_stop.sequence:
            return {
                "error": "origin_routestop_id must come before destination_routestop_id on this route"
            }, 400

        if "start_time" in data:
            start_time = parse_datetime(data["start_time"])
            if start_time is None:
                return {"error": "Invalid start_time. Use ISO 8601 format."}, 400
            trip.start_time = start_time

        if "stop_time" in data:
            if data["stop_time"] is None:
                trip.stop_time = None
            else:
                stop_time = parse_datetime(data["stop_time"])
                if stop_time is None:
                    return {"error": "Invalid stop_time. Use ISO 8601 format."}, 400
                trip.stop_time = stop_time

        if trip.stop_time and trip.stop_time <= trip.start_time:
            return {"error": "stop_time must be later than start_time"}, 400

        if "status" in data:
            if data["status"] not in ALLOWED_TRIP_STATUSES:
                return {"error": "Invalid trip status", "allowed": sorted(ALLOWED_TRIP_STATUSES)}, 400
            trip.status = data["status"]

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {"error": "Could not update trip"}, 400

        return trip_response(trip), 200


class CancelTripResource(Resource):
    """/api/v1/provider/trips/<int:trip_id>/cancel"""

    @jwt_required()
    def patch(self, trip_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        trip = db.session.get(Trip, trip_id)
        if trip is None:
            return {"error": "Trip not found"}, 404

        # Same fail-closed fix as ProviderTripResource.patch above.
        vehicle = db.session.get(Vehicle, trip.vehicle_id)
        if not vehicle or vehicle.sacco_id != user.sacco_id:
            return {"error": "You are not authorized to cancel this trip."}, 403

        if trip.status == "completed":
            return {"error": "Completed trips cannot be cancelled"}, 400

        if trip.status == "cancelled":
            return {"error": "Trip is already cancelled"}, 400

        trip.status = "cancelled"

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {"error": "Could not cancel trip"}, 400

        return trip_response(trip), 200