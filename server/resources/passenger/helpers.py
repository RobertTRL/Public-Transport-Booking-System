"""Shared helper functions used across passenger-side resources."""

from flask_jwt_extended import get_jwt_identity

from config import db
from models import Passenger, RouteStop


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
        if booking.status != "active":
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
