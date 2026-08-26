from datetime import datetime

from flask import Blueprint, request
from sqlalchemy import func

from config import db
from models import (
    Booking,
    Route,
    RouteStop,
    Trip,
    Vehicle,
)


provider_bp = Blueprint("provider", __name__)


# ============================================================
# Helpers
# ============================================================

def vehicle_response(vehicle):
    return {
        "id": vehicle.id,
        "sacco_id": vehicle.sacco_id,
        "number_plate": vehicle.number_plate,
        "capacity": vehicle.capacity,
        "is_active": vehicle.is_active,
    }


def trip_response(trip):
    return {
        "id": trip.id,
        "origin_routestop_id": trip.origin_routestop_id,
        "destination_routestop_id": trip.destination_routestop_id,
        "start_time": (
            trip.start_time.isoformat()
            if trip.start_time else None
        ),
        "stop_time": (
            trip.stop_time.isoformat()
            if trip.stop_time else None
        ),
        "vehicle_id": trip.vehicle_id,
        "status": trip.status,
    }


def booking_response(booking):
    return {
        "id": booking.id,
        "user_id": booking.user_id,
        "trip_id": booking.trip_id,
        "origin_routestop_id": booking.origin_routestop_id,
        "destination_routestop_id": booking.destination_routestop_id,
        "made_at": (
            booking.made_at.isoformat()
            if booking.made_at else None
        ),
    }


def parse_datetime(value):
    if not value:
        return None

    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


# ============================================================
# VEHICLES
# ============================================================

# GET /api/v1/provider/vehicles/<vehicle_id>
@provider_bp.route(
    "/api/v1/provider/vehicles/<int:vehicle_id>",
    methods=["GET"],
)
def get_vehicle(vehicle_id):
    vehicle = db.session.get(Vehicle, vehicle_id)

    if vehicle is None:
        return {"error": "Vehicle not found"}, 404

    return vehicle_response(vehicle), 200


# PATCH /api/v1/provider/vehicles/<vehicle_id>
@provider_bp.route(
    "/api/v1/provider/vehicles/<int:vehicle_id>",
    methods=["PATCH"],
)
def update_vehicle(vehicle_id):
    vehicle = db.session.get(Vehicle, vehicle_id)

    if vehicle is None:
        return {"error": "Vehicle not found"}, 404

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


# DELETE /api/v1/provider/vehicles/<vehicle_id>
@provider_bp.route(
    "/api/v1/provider/vehicles/<int:vehicle_id>",
    methods=["DELETE"],
)
def delete_vehicle(vehicle_id):
    vehicle = db.session.get(Vehicle, vehicle_id)

    if vehicle is None:
        return {"error": "Vehicle not found"}, 404

    try:
        db.session.delete(vehicle)
        db.session.commit()
    except Exception:
        db.session.rollback()
        return {
            "error": "Vehicle cannot be deleted because it is in use"
        }, 409

    return {
        "message": "Vehicle deleted successfully",
    }, 200


# ============================================================
# TRIPS
# ============================================================

# GET
# /api/v1/provider/routes/<route_id>/trips?from=&to=
@provider_bp.route(
    "/api/v1/provider/routes/<int:route_id>/trips",
    methods=["GET"],
)
def get_route_trips(route_id):
    route = db.session.get(Route, route_id)

    if route is None:
        return {"error": "Route not found"}, 404

    from_value = request.args.get("from")
    to_value = request.args.get("to")

    from_date = parse_datetime(from_value)
    to_date = parse_datetime(to_value)

    if from_value and from_date is None:
        return {
            "error": "Invalid 'from' datetime. Use ISO 8601 format."
        }, 400

    if to_value and to_date is None:
        return {
            "error": "Invalid 'to' datetime. Use ISO 8601 format."
        }, 400

    route_stop_ids = [
        route_stop.id
        for route_stop in route.route_stops
    ]

    if not route_stop_ids:
        return [], 200

    query = Trip.query.filter(
        Trip.origin_routestop_id.in_(route_stop_ids),
        Trip.destination_routestop_id.in_(route_stop_ids),
    )

    if from_date:
        query = query.filter(Trip.start_time >= from_date)

    if to_date:
        query = query.filter(Trip.start_time <= to_date)

    trips = query.order_by(Trip.start_time.asc()).all()

    return [trip_response(trip) for trip in trips], 200


# POST
# /api/v1/provider/routes/<route_id>/trips
@provider_bp.route(
    "/api/v1/provider/routes/<int:route_id>/trips",
    methods=["POST"],
)
def create_trip(route_id):
    route = db.session.get(Route, route_id)

    if route is None:
        return {"error": "Route not found"}, 404

    data = request.get_json(silent=True)

    if not data:
        return {"error": "Request body is required"}, 400

    required_fields = [
        "origin_routestop_id",
        "destination_routestop_id",
        "vehicle_id",
    ]

    missing = [
        field
        for field in required_fields
        if field not in data
    ]

    if missing:
        return {
            "error": "Missing required fields",
            "fields": missing,
        }, 400

    origin_id = data["origin_routestop_id"]
    destination_id = data["destination_routestop_id"]
    vehicle_id = data["vehicle_id"]

    if origin_id == destination_id:
        return {
            "error": (
                "destination_routestop_id must be different "
                "from origin_routestop_id"
            )
        }, 400

    origin_stop = db.session.get(RouteStop, origin_id)
    destination_stop = db.session.get(RouteStop, destination_id)
    vehicle = db.session.get(Vehicle, vehicle_id)

    if origin_stop is None:
        return {
            "error": "Origin route stop not found"
        }, 404

    if destination_stop is None:
        return {
            "error": "Destination route stop not found"
        }, 404

    if vehicle is None:
        return {
            "error": "Vehicle not found"
        }, 404

    if origin_stop.route_id != route_id:
        return {
            "error": "Origin route stop does not belong to this route"
        }, 400

    if destination_stop.route_id != route_id:
        return {
            "error": (
                "Destination route stop does not belong "
                "to this route"
            )
        }, 400

    if not vehicle.is_active:
        return {
            "error": "Vehicle is inactive"
        }, 400

    start_time = parse_datetime(
        data.get("start_time")
    )

    stop_time = parse_datetime(
        data.get("stop_time")
    )

    if data.get("start_time") and start_time is None:
        return {
            "error": (
                "Invalid start_time. "
                "Use ISO 8601 format."
            )
        }, 400

    if data.get("stop_time") and stop_time is None:
        return {
            "error": (
                "Invalid stop_time. "
                "Use ISO 8601 format."
            )
        }, 400

    if start_time is None:
        return {
            "error": "start_time is required"
        }, 400

    if stop_time and stop_time <= start_time:
        return {
            "error": "stop_time must be later than start_time"
        }, 400

    status = data.get("status", "scheduled")

    allowed_statuses = {
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
    }

    if status not in allowed_statuses:
        return {
            "error": "Invalid trip status",
            "allowed": sorted(allowed_statuses),
        }, 400

    trip = Trip(
        origin_routestop_id=origin_id,
        destination_routestop_id=destination_id,
        vehicle_id=vehicle_id,
        start_time=start_time,
        stop_time=stop_time,
        status=status,
    )

    db.session.add(trip)

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return {
            "error": "Could not create trip"
        }, 400

    return trip_response(trip), 201


# PATCH /api/v1/provider/trips/<trip_id>
@provider_bp.route(
    "/api/v1/provider/trips/<int:trip_id>",
    methods=["PATCH"],
)
def update_trip(trip_id):
    trip = db.session.get(Trip, trip_id)

    if trip is None:
        return {"error": "Trip not found"}, 404

    data = request.get_json(silent=True)

    if not data:
        return {"error": "Request body is required"}, 400

    if "vehicle_id" in data:
        vehicle = db.session.get(
            Vehicle,
            data["vehicle_id"],
        )

        if vehicle is None:
            return {"error": "Vehicle not found"}, 404

        if not vehicle.is_active:
            return {"error": "Vehicle is inactive"}, 400

        trip.vehicle_id = data["vehicle_id"]

    if "origin_routestop_id" in data:
        origin = db.session.get(
            RouteStop,
            data["origin_routestop_id"],
        )

        if origin is None:
            return {
                "error": "Origin route stop not found"
            }, 404

        trip.origin_routestop_id = origin.id

    if "destination_routestop_id" in data:
        destination = db.session.get(
            RouteStop,
            data["destination_routestop_id"],
        )

        if destination is None:
            return {
                "error": "Destination route stop not found"
            }, 404

        trip.destination_routestop_id = destination.id

    if (
        trip.origin_routestop_id
        == trip.destination_routestop_id
    ):
        return {
            "error": (
                "destination_routestop_id must be different "
                "from origin_routestop_id"
            )
        }, 400

    if "start_time" in data:
        start_time = parse_datetime(
            data["start_time"]
        )

        if start_time is None:
            return {
                "error": (
                    "Invalid start_time. "
                    "Use ISO 8601 format."
                )
            }, 400

        trip.start_time = start_time

    if "stop_time" in data:
        if data["stop_time"] is None:
            trip.stop_time = None
        else:
            stop_time = parse_datetime(
                data["stop_time"]
            )

            if stop_time is None:
                return {
                    "error": (
                        "Invalid stop_time. "
                        "Use ISO 8601 format."
                    )
                }, 400

            trip.stop_time = stop_time

    if (
        trip.stop_time
        and trip.stop_time <= trip.start_time
    ):
        return {
            "error": "stop_time must be later than start_time"
        }, 400

    if "status" in data:
        allowed_statuses = {
            "scheduled",
            "in_progress",
            "completed",
            "cancelled",
        }

        if data["status"] not in allowed_statuses:
            return {
                "error": "Invalid trip status",
                "allowed": sorted(allowed_statuses),
            }, 400

        trip.status = data["status"]

    db.session.commit()

    return trip_response(trip), 200


# PATCH /api/v1/provider/trips/<trip_id>/cancel
@provider_bp.route(
    "/api/v1/provider/trips/<int:trip_id>/cancel",
    methods=["PATCH"],
)
def cancel_trip(trip_id):
    trip = db.session.get(Trip, trip_id)

    if trip is None:
        return {"error": "Trip not found"}, 404

    if trip.status == "completed":
        return {
            "error": "Completed trips cannot be cancelled"
        }, 400

    if trip.status == "cancelled":
        return {
            "error": "Trip is already cancelled"
        }, 400

    trip.status = "cancelled"

    db.session.commit()

    return trip_response(trip), 200


# ============================================================
# BOOKINGS
# ============================================================

# GET
# /api/v1/provider/bookings
# ?route_id=&trip_id=&from=&to=&status=
@provider_bp.route(
    "/api/v1/provider/bookings",
    methods=["GET"],
)
def get_provider_bookings():
    route_id = request.args.get("route_id", type=int)
    trip_id = request.args.get("trip_id", type=int)
    from_value = request.args.get("from")
    to_value = request.args.get("to")
    status = request.args.get("status")

    from_date = parse_datetime(from_value)
    to_date = parse_datetime(to_value)

    if from_value and from_date is None:
        return {
            "error": "Invalid 'from' datetime"
        }, 400

    if to_value and to_date is None:
        return {
            "error": "Invalid 'to' datetime"
        }, 400

    query = Booking.query.join(
        Trip,
        Booking.trip_id == Trip.id,
        isouter=True,
    )

    if trip_id is not None:
        query = query.filter(
            Booking.trip_id == trip_id
        )

    if route_id is not None:
        route_stop_ids = db.session.query(
            RouteStop.id
        ).filter(
            RouteStop.route_id == route_id
        ).subquery()

        query = query.filter(
            Booking.origin_routestop_id.in_(
                route_stop_ids
            )
        )

    if from_date:
        query = query.filter(
            Booking.made_at >= from_date
        )

    if to_date:
        query = query.filter(
            Booking.made_at <= to_date
        )

    # Booking currently has no status column.
    if status:
        return {
            "error": (
                "Booking status filtering is unavailable "
                "because Booking has no status field."
            )
        }, 400

    bookings = query.order_by(
        Booking.made_at.desc()
    ).all()

    return [
        booking_response(booking)
        for booking in bookings
    ], 200


# GET /api/v1/provider/booking-statistics
# ?from=&to=&group_by=day
@provider_bp.route(
    "/api/v1/provider/booking-statistics",
    methods=["GET"],
)
def booking_statistics():
    from_value = request.args.get("from")
    to_value = request.args.get("to")
    group_by = request.args.get(
        "group_by",
        "day",
    )

    if group_by != "day":
        return {
            "error": "Only group_by=day is currently supported"
        }, 400

    from_date = parse_datetime(from_value)
    to_date = parse_datetime(to_value)

    if from_value and from_date is None:
        return {
            "error": "Invalid 'from' datetime"
        }, 400

    if to_value and to_date is None:
        return {
            "error": "Invalid 'to' datetime"
        }, 400

    query = db.session.query(
        func.date(Booking.made_at).label("date"),
        func.count(Booking.id).label("bookings"),
    )

    if from_date:
        query = query.filter(
            Booking.made_at >= from_date
        )

    if to_date:
        query = query.filter(
            Booking.made_at <= to_date
        )

    rows = query.group_by(
        func.date(Booking.made_at)
    ).order_by(
        func.date(Booking.made_at)
    ).all()

    return [
        {
            "date": str(row.date),
            "bookings": row.bookings,
        }
        for row in rows
    ], 200


# GET /api/v1/provider/trips/<trip_id>/bookings
@provider_bp.route(
    "/api/v1/provider/trips/<int:trip_id>/bookings",
    methods=["GET"],
)
def get_trip_bookings(trip_id):
    trip = db.session.get(Trip, trip_id)

    if trip is None:
        return {"error": "Trip not found"}, 404

    bookings = Booking.query.filter_by(
        trip_id=trip_id
    ).order_by(
        Booking.made_at.desc()
    ).all()

    return [
        booking_response(booking)
        for booking in bookings
    ], 200