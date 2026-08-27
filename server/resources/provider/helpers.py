"""Shared helper functions used across provider-side resources."""

from datetime import datetime

from flask_jwt_extended import get_jwt_identity

from config import db
from models import User


def get_current_provider_user():
    """Return the User (provider) associated with the current JWT.

    Mirrors get_current_passenger() on the passenger side: casts the
    JWT identity to int and looks the row up with db.session.get, so a
    malformed identity fails closed (returns None) instead of raising.
    """
    identity = get_jwt_identity()

    try:
        identity = int(identity)
    except (TypeError, ValueError):
        return None

    return db.session.get(User, identity)


def parse_datetime(value):
    """Parse an ISO 8601 datetime string. Returns None if empty or invalid."""
    if not value:
        return None

    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


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
        "start_time": trip.start_time.isoformat() if trip.start_time else None,
        "stop_time": trip.stop_time.isoformat() if trip.stop_time else None,
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
        "made_at": booking.made_at.isoformat() if booking.made_at else None,
    }