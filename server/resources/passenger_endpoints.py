from datetime import date

from flask import request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restful import Resource
from sqlalchemy.orm import aliased

from config import api, db
from models import (
    Booking,
    Passenger,
    Route,
    RouteStop,
    Stop,
    Trip,
)
from schemas import (
    BookingDetailSchema,
    BookingSchema,
    RouteSchema,
    StopSchema,
    TripDetailSchema,
)


# =========================================================
# Passenger helpers
# =========================================================

def get_current_passenger():
    """Return the passenger associated with the current JWT."""
    passenger_id = get_jwt_identity()

    try:
        passenger_id = int(passenger_id)
    except (TypeError, ValueError):
        return None

    return db.session.get(Passenger, passenger_id)


# =========================================================
# Route and trip helpers
# =========================================================

def get_route_stop_pair(origin_id, destination_id):
    """Return the origin and destination RouteStop records."""
    origin = db.session.get(RouteStop, origin_id)
    destination = db.session.get(RouteStop, destination_id)

    return origin, destination


def valid_route_segment(origin, destination):
    """Check that origin precedes destination on the same route."""
    if not origin or not destination:
        return False

    return (
        origin.route_id == destination.route_id
        and origin.sequence < destination.sequence
    )


def trip_contains_segment(trip, origin, destination):
    """Check whether a requested segment fits within a trip."""
    if not trip or not valid_route_segment(origin, destination):
        return False

    trip_origin = trip.origin_routestop
    trip_destination = trip.destination_routestop

    if not trip_origin or not trip_destination:
        return False

    return (
        trip_origin.route_id == origin.route_id
        and trip_destination.route_id == origin.route_id
        and trip_origin.sequence <= origin.sequence
        and destination.sequence <= trip_destination.sequence
    )


# =========================================================
# Booking and availability helpers
# =========================================================

def count_booked_seats(trip, origin, destination):
    """
    Count active bookings that overlap a requested route segment.

    Each active booking represents one passenger because the current
    Booking model does not contain a seat-number field.
    """
    booked = 0

    for booking in trip.bookings:
        if booking.trip_id is None:
            continue

        booking_origin = booking.origin_routestop
        booking_destination = booking.destination_routestop

        if not booking_origin or not booking_destination:
            continue

        overlaps = (
            booking_origin.route_id == origin.route_id
            and booking_destination.route_id == destination.route_id
            and booking_origin.sequence < destination.sequence
            and booking_destination.sequence > origin.sequence
        )

        if overlaps:
            booked += 1

    return booked


def get_trip_availability(trip, origin, destination):
    """Return capacity, booked seats and remaining seats."""
    capacity = trip.vehicle.capacity
    booked = count_booked_seats(trip, origin, destination)

    return {
        "trip_id": trip.id,
        "capacity": capacity,
        "booked_seats": booked,
        "available_seats": max(capacity - booked, 0),
    }


def passenger_has_overlapping_booking(
    passenger,
    trip,
    origin,
    destination,
):
    """Check whether a passenger already booked an overlapping segment."""
    bookings = Booking.query.filter_by(
        user_id=passenger.id,
        trip_id=trip.id,
    ).all()

    for booking in bookings:
        booking_origin = booking.origin_routestop
        booking_destination = booking.destination_routestop

        if not booking_origin or not booking_destination:
            continue

        if (
            booking_origin.route_id == origin.route_id
            and booking_destination.route_id == destination.route_id
            and booking_origin.sequence < destination.sequence
            and booking_destination.sequence > origin.sequence
        ):
            return True

    return False


def create_booking(passenger, trip, origin, destination):
    """Create and persist a booking for a passenger."""
    booking = Booking(
        user_id=passenger.id,
        trip_id=trip.id,
        origin_routestop_id=origin.id,
        destination_routestop_id=destination.id,
    )

    db.session.add(booking)
    db.session.commit()

    return booking


# =========================================================
# Stop resources
# =========================================================

class StopsResource(Resource):
    """List all available passenger boarding stops."""

    def get(self):
        stops = Stop.query.order_by(Stop.name.asc()).all()

        return StopSchema(many=True).dump(stops), 200


# =========================================================
# Route resources
# =========================================================

class RouteSearchResource(Resource):
    """Search for routes connecting two stops."""

    def get(self):
        origin_stop_id = request.args.get(
            "origin_stop_id",
            type=int,
        )
        destination_stop_id = request.args.get(
            "destination_stop_id",
            type=int,
        )

        if not origin_stop_id or not destination_stop_id:
            return {
                "error": (
                    "origin_stop_id and destination_stop_id "
                    "are required."
                )
            }, 400

        if origin_stop_id == destination_stop_id:
            return {
                "error": "Origin and destination stops must be different."
            }, 400

        origin_stop = db.session.get(Stop, origin_stop_id)
        destination_stop = db.session.get(Stop, destination_stop_id)

        if not origin_stop or not destination_stop:
            return {
                "error": "One or both stops could not be found."
            }, 404

        origin_route_stop = aliased(RouteStop)
        destination_route_stop = aliased(RouteStop)

        routes = (
            Route.query
            .join(
                origin_route_stop,
                Route.id == origin_route_stop.route_id,
            )
            .join(
                destination_route_stop,
                Route.id == destination_route_stop.route_id,
            )
            .filter(
                origin_route_stop.stop_id == origin_stop_id,
                destination_route_stop.stop_id == destination_stop_id,
                origin_route_stop.sequence
                < destination_route_stop.sequence,
            )
            .distinct()
            .order_by(Route.name.asc())
            .all()
        )

        return RouteSchema(many=True).dump(routes), 200


class RouteResource(Resource):
    """Return details for a single route."""

    def get(self, route_id):
        route = db.session.get(Route, route_id)

        if not route:
            return {
                "error": "Route not found."
            }, 404

        return RouteSchema().dump(route), 200


# =========================================================
# Trip resources
# =========================================================

class AvailableTripsResource(Resource):
    """Return trips available for a requested route segment and date."""

    def get(self):
        origin_routestop_id = request.args.get(
            "origin_routestop_id",
            type=int,
        )
        destination_routestop_id = request.args.get(
            "destination_routestop_id",
            type=int,
        )
        trip_date = request.args.get("date")

        if not origin_routestop_id or not destination_routestop_id:
            return {
                "error": (
                    "origin_routestop_id and destination_routestop_id "
                    "are required."
                )
            }, 400

        if not trip_date:
            return {
                "error": "date is required."
            }, 400

        try:
            requested_date = date.fromisoformat(trip_date)
        except ValueError:
            return {
                "error": "date must use YYYY-MM-DD format."
            }, 400

        origin, destination = get_route_stop_pair(
            origin_routestop_id,
            destination_routestop_id,
        )

        if not origin or not destination:
            return {
                "error": "One or both route stops could not be found."
            }, 404

        if not valid_route_segment(origin, destination):
            return {
                "error": (
                    "Origin and destination must belong to the same "
                    "route, with origin before destination."
                )
            }, 400

        trips = (
            Trip.query
            .filter(
                Trip.origin_routestop_id == origin_routestop_id,
                Trip.destination_routestop_id == destination_routestop_id,
                Trip.status != "cancelled",
            )
            .order_by(Trip.start_time.asc())
            .all()
        )

        trips = [
            trip
            for trip in trips
            if trip.start_time.date() == requested_date
        ]

        return TripDetailSchema(many=True).dump(trips), 200


class TripResource(Resource):
    """Return details for a single trip."""

    def get(self, trip_id):
        trip = db.session.get(Trip, trip_id)

        if not trip:
            return {
                "error": "Trip not found."
            }, 404

        return TripDetailSchema().dump(trip), 200


class TripAvailabilityResource(Resource):
    """Return seat availability for a trip segment."""

    def get(self, trip_id):
        origin_routestop_id = request.args.get(
            "origin_routestop_id",
            type=int,
        )
        destination_routestop_id = request.args.get(
            "destination_routestop_id",
            type=int,
        )

        if not origin_routestop_id or not destination_routestop_id:
            return {
                "error": (
                    "origin_routestop_id and destination_routestop_id "
                    "are required."
                )
            }, 400

        trip = db.session.get(Trip, trip_id)

        if not trip:
            return {
                "error": "Trip not found."
            }, 404

        origin, destination = get_route_stop_pair(
            origin_routestop_id,
            destination_routestop_id,
        )

        if not origin or not destination:
            return {
                "error": "One or both route stops could not be found."
            }, 404

        if not trip_contains_segment(trip, origin, destination):
            return {
                "error": (
                    "The requested segment is not valid for this trip."
                )
            }, 400

        return get_trip_availability(
            trip,
            origin,
            destination,
        ), 200


# =========================================================
# Booking resources
# =========================================================

class BookingResource(Resource):
    """Create a booking for the authenticated passenger."""

    @jwt_required()
    def post(self):
        passenger = get_current_passenger()

        if not passenger:
            return {
                "error": "Passenger account not found."
            }, 404

        data = request.get_json(silent=True) or {}

        trip_id = data.get("trip_id")
        origin_routestop_id = data.get("origin_routestop_id")
        destination_routestop_id = data.get("destination_routestop_id")

        if not all(
            [
                trip_id,
                origin_routestop_id,
                destination_routestop_id,
            ]
        ):
            return {
                "error": (
                    "trip_id, origin_routestop_id and "
                    "destination_routestop_id are required."
                )
            }, 400

        try:
            booking_data = BookingSchema().load(
                {
                    "user_id": passenger.id,
                    "trip_id": trip_id,
                    "origin_routestop_id": origin_routestop_id,
                    "destination_routestop_id": destination_routestop_id,
                }
            )
        except Exception as error:
            return {
                "error": str(error)
            }, 400

        trip = db.session.get(Trip, booking_data["trip_id"])

        if not trip:
            return {
                "error": "Trip not found."
            }, 404

        if trip.status != "scheduled":
            return {
                "error": "Only scheduled trips can be booked."
            }, 409

        if not trip.vehicle or not trip.vehicle.is_active:
            return {
                "error": "The vehicle assigned to this trip is not active."
            }, 409

        origin, destination = get_route_stop_pair(
            booking_data["origin_routestop_id"],
            booking_data["destination_routestop_id"],
        )

        if not origin or not destination:
            return {
                "error": "One or both route stops could not be found."
            }, 404

        if not trip_contains_segment(trip, origin, destination):
            return {
                "error": (
                    "The requested booking segment is not valid "
                    "for this trip."
                )
            }, 400

        availability = get_trip_availability(
            trip,
            origin,
            destination,
        )

        if availability["available_seats"] <= 0:
            return {
                "error": "No seats are available for this trip segment."
            }, 409

        if passenger_has_overlapping_booking(
            passenger,
            trip,
            origin,
            destination,
        ):
            return {
                "error": (
                    "You already have an active booking that "
                    "overlaps this trip segment."
                )
            }, 409

        booking = create_booking(
            passenger,
            trip,
            origin,
            destination,
        )

        return BookingDetailSchema().dump(booking), 201


class MyBookingsResource(Resource):
    """Return all bookings belonging to the authenticated passenger."""

    @jwt_required()
    def get(self):
        passenger = get_current_passenger()

        if not passenger:
            return {
                "error": "Passenger account not found."
            }, 404

        bookings = (
            Booking.query
            .filter_by(user_id=passenger.id)
            .order_by(Booking.made_at.desc())
            .all()
        )

        return BookingDetailSchema(many=True).dump(bookings), 200


class BookingDetailResource(Resource):
    """Return a specific booking belonging to the passenger."""

    @jwt_required()
    def get(self, booking_id):
        passenger = get_current_passenger()

        if not passenger:
            return {
                "error": "Passenger account not found."
            }, 404

        booking = db.session.get(Booking, booking_id)

        if not booking:
            return {
                "error": "Booking not found."
            }, 404

        if booking.user_id != passenger.id:
            return {
                "error": "You are not authorized to view this booking."
            }, 403

        return BookingDetailSchema().dump(booking), 200


class CancelBookingResource(Resource):
    """Cancel an existing booking belonging to the passenger."""

    @jwt_required()
    def patch(self, booking_id):
        passenger = get_current_passenger()

        if not passenger:
            return {
                "error": "Passenger account not found."
            }, 404

        booking = db.session.get(Booking, booking_id)

        if not booking:
            return {
                "error": "Booking not found."
            }, 404

        if booking.user_id != passenger.id:
            return {
                "error": "You are not authorized to cancel this booking."
            }, 403

        if booking.trip_id is None:
            return {
                "error": "Booking has already been cancelled."
            }, 409

        booking.trip_id = None

        db.session.commit()

        return {
            "message": "Booking cancelled successfully.",
            "booking": BookingDetailSchema().dump(booking),
        }, 200


# =========================================================
# Route registration
# =========================================================

api.add_resource(
    StopsResource,
    "/api/v1/stops",
)

api.add_resource(
    RouteSearchResource,
    "/api/v1/routes/search",
)

api.add_resource(
    RouteResource,
    "/api/v1/routes/<int:route_id>",
)

api.add_resource(
    AvailableTripsResource,
    "/api/v1/trips",
)

api.add_resource(
    TripResource,
    "/api/v1/trips/<int:trip_id>",
)

api.add_resource(
    TripAvailabilityResource,
    "/api/v1/trips/<int:trip_id>/availability",
)

api.add_resource(
    BookingResource,
    "/api/v1/bookings",
)

api.add_resource(
    MyBookingsResource,
    "/api/v1/me/bookings",
)

api.add_resource(
    BookingDetailResource,
    "/api/v1/bookings/<int:booking_id>",
)

api.add_resource(
    CancelBookingResource,
    "/api/v1/bookings/<int:booking_id>/cancel",
)