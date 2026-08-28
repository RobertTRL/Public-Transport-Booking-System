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
