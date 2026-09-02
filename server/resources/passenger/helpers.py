from flask_jwt_extended import get_jwt_identity, get_jwt

from config import db
from models import Booking, Passenger, RouteStop, Trip


# =========================================================
# Passenger helpers
# =========================================================

def get_current_passenger():
    """Return the passenger associated with the current JWT.
    
    Rejects tokens that explicitly declare a non-passenger user_type.
    """
    claims = get_jwt()
    if claims.get("user_type") and claims.get("user_type") != "passenger":
        return None

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
        status="active",
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
