"""Shared helper functions used across passenger-side resources."""

from flask_jwt_extended import get_jwt_identity

from config import db
from models import Passenger


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
