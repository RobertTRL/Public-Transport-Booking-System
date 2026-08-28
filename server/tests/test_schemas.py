"""
Tests for the current transport booking Marshmallow schemas.
"""

from unittest.mock import MagicMock, patch

from config import app
from schemas import (
    BookingDetailSchema,
    BookingSchema,
    PassengerSchema,
    RouteSchema,
    RouteStopSchema,
    SaccoSchema,
    StopSchema,
    TripSchema,
    UserSchema,
    VehicleSchema,
)

# ---------------------------------------------------------------------------
# PassengerSchema
# ---------------------------------------------------------------------------

def test_passenger_schema_accepts_valid_data():
    data = {
        "email": "rider@example.com",
        "password": "supersecret1",
        "phone_number": "0712345678",
    }

    loaded = PassengerSchema().load(data)

    assert loaded["email"] == "rider@example.com"
    assert loaded["password"] == "supersecret1"


def test_passenger_schema_requires_email_and_password():
    errors = PassengerSchema().validate({})

    assert "email" in errors
    assert "password" in errors


def test_passenger_schema_rejects_invalid_email():
    errors = PassengerSchema().validate({
        "email": "not-an-email",
        "password": "supersecret1",
    })

    assert "email" in errors


def test_passenger_schema_rejects_short_password():
    errors = PassengerSchema().validate({
        "email": "rider@example.com",
        "password": "abc",
    })

    assert "password" in errors


def test_passenger_schema_never_dumps_password():
    dumped = PassengerSchema().dump({
        "id": 1,
        "email": "rider@example.com",
        "password": "supersecret1",
        "password_hash": "secret-hash",
        "phone_number": None,
    })

    assert "password" not in dumped
    assert "password_hash" not in dumped
    assert dumped["email"] == "rider@example.com"


# ---------------------------------------------------------------------------
# UserSchema
# ---------------------------------------------------------------------------

def test_user_schema_accepts_valid_data():
    data = {
        "name": "Jane Manager",
        "email": "manager@example.com",
        "password": "supersecret1",
        "phone_number": "0712345678",
        "role": "manager",
        "sacco_id": 1,
    }

    loaded = UserSchema().load(data)

    assert loaded["name"] == "Jane Manager"
    assert loaded["email"] == "manager@example.com"
    assert loaded["role"] == "manager"


def test_user_schema_requires_required_fields():
    errors = UserSchema().validate({})

    assert "name" in errors
    assert "email" in errors
    assert "password" in errors
    assert "role" in errors


def test_user_schema_never_dumps_password():
    dumped = UserSchema().dump({
        "id": 1,
        "name": "Jane Manager",
        "email": "manager@example.com",
        "password": "supersecret1",
        "password_hash": "secret-hash",
        "role": "manager",
        "sacco_id": 1,
        "phone_number": None,
    })

    assert "password" not in dumped
    assert "password_hash" not in dumped


# ---------------------------------------------------------------------------
# SaccoSchema
# ---------------------------------------------------------------------------

def test_sacco_schema_accepts_valid_data():
    errors = SaccoSchema().validate({
        "name": "Test Sacco",
        "contact": "0712345678",
        "address": "Nairobi",
    })

    assert errors == {}


def test_sacco_schema_requires_name_and_contact():
    errors = SaccoSchema().validate({
        "address": "Nairobi",
    })

    assert "name" in errors
    assert "contact" in errors


# ---------------------------------------------------------------------------
# VehicleSchema
# ---------------------------------------------------------------------------

def test_vehicle_schema_accepts_valid_data():
    errors = VehicleSchema().validate({
        "sacco_id": 1,
        "number_plate": "KDA123A",
        "capacity": 33,
        "is_active": True,
    })

    assert errors == {}


def test_vehicle_schema_rejects_invalid_capacity():
    errors = VehicleSchema().validate({
        "sacco_id": 1,
        "number_plate": "KDA123A",
        "capacity": 0,
    })

    assert "capacity" in errors


# ---------------------------------------------------------------------------
# StopSchema
# ---------------------------------------------------------------------------

def test_stop_schema_accepts_valid_data():
    errors = StopSchema().validate({
        "name": "CBD",
        "longitude": 36.8219,
        "latitude": -1.2921,
    })

    assert errors == {}


def test_stop_schema_rejects_invalid_longitude():
    errors = StopSchema().validate({
        "name": "CBD",
        "longitude": 200,
        "latitude": -1.2921,
    })

    assert "longitude" in errors


def test_stop_schema_rejects_invalid_latitude():
    errors = StopSchema().validate({
        "name": "CBD",
        "longitude": 36.8219,
        "latitude": -100,
    })

    assert "latitude" in errors


# ---------------------------------------------------------------------------
# RouteStopSchema
# ---------------------------------------------------------------------------

def test_route_stop_schema_accepts_valid_data():
    errors = RouteStopSchema().validate({
        "route_id": 1,
        "stop_id": 2,
        "sequence": 1,
    })

    assert errors == {}


def test_route_stop_schema_requires_foreign_keys():
    errors = RouteStopSchema().validate({
        "sequence": 1,
    })

    assert "route_id" in errors
    assert "stop_id" in errors


def test_route_stop_schema_rejects_negative_sequence():
    errors = RouteStopSchema().validate({
        "route_id": 1,
        "stop_id": 2,
        "sequence": -1,
    })

    assert "sequence" in errors


# ---------------------------------------------------------------------------
# RouteSchema
# ---------------------------------------------------------------------------

def test_route_schema_accepts_valid_data():
    errors = RouteSchema().validate({
        "name": "Nairobi CBD Route",
        "color": "#0000FF",
    })

    assert errors == {}


def test_route_schema_requires_name_and_color():
    errors = RouteSchema().validate({})

    assert "name" in errors
    assert "color" in errors


def test_route_schema_dumps_nested_route_stops():
    route_obj = {
        "id": 1,
        "name": "Nairobi CBD Route",
        "color": "#0000FF",
        "route_stops": [
            {
                "id": 1,
                "route_id": 1,
                "stop_id": 4,
                "sequence": 1,
                "stop": {
                    "id": 4,
                    "name": "CBD",
                    "longitude": 36.8219,
                    "latitude": -1.2921,
                },
            },
            {
                "id": 2,
                "route_id": 1,
                "stop_id": 5,
                "sequence": 2,
                "stop": {
                    "id": 5,
                    "name": "Westlands",
                    "longitude": 36.8065,
                    "latitude": -1.2676,
                },
            },
        ],
    }

    dumped = RouteSchema().dump(route_obj)

    assert len(dumped["route_stops"]) == 2
    assert dumped["route_stops"][0]["stop"]["name"] == "CBD"


# ---------------------------------------------------------------------------
# TripSchema
# ---------------------------------------------------------------------------

def test_trip_schema_accepts_valid_data():
    mock_stop_1 = MagicMock(id=4, route_id=1, sequence=1)
    mock_stop_2 = MagicMock(id=6, route_id=1, sequence=2)

    with app.app_context():
        with patch("schemas.db.session.get", side_effect=[mock_stop_1, mock_stop_2]):
            errors = TripSchema().validate({
                "origin_routestop_id": 4,
                "destination_routestop_id": 6,
                "vehicle_id": 1,
            })

    assert errors == {}

def test_trip_schema_rejects_same_origin_and_destination():
    with app.app_context():
        errors = TripSchema().validate({
            "origin_routestop_id": 4,
            "destination_routestop_id": 4,
            "vehicle_id": 1,
        })

    assert "destination_routestop_id" in errors


def test_trip_schema_rejects_invalid_status():
    with app.app_context():
        errors = TripSchema().validate({
            "origin_routestop_id": 4,
            "destination_routestop_id": 6,
            "vehicle_id": 1,
            "status": "invalid",
        })

    assert "status" in errors


# ---------------------------------------------------------------------------
# BookingSchema
# ---------------------------------------------------------------------------

def test_booking_schema_accepts_valid_data():
    errors = BookingSchema().validate({
        "user_id": 2,
        "trip_id": 1,
        "origin_routestop_id": 4,
        "destination_routestop_id": 6,
    })

    assert errors == {}


def test_booking_schema_rejects_same_origin_and_destination():
    errors = BookingSchema().validate({
        "user_id": 2,
        "trip_id": 1,
        "origin_routestop_id": 4,
        "destination_routestop_id": 4,
    })

    assert "destination_routestop_id" in errors


def test_booking_schema_requires_foreign_keys():
    errors = BookingSchema().validate({})

    assert "user_id" in errors
    assert "origin_routestop_id" in errors
    assert "destination_routestop_id" in errors


def test_booking_detail_schema_dumps_nested_relations():
    booking_obj = {
        "id": 1,
        "user_id": 2,
        "trip_id": 1,
        "origin_routestop_id": 4,
        "destination_routestop_id": 6,
        "user": {
            "id": 2,
            "email": "rider@example.com",
            "phone_number": None,
        },
        "origin_routestop": {
            "id": 4,
            "route_id": 2,
            "stop_id": 4,
            "sequence": 1,
            "stop": {
                "id": 4,
                "name": "CBD",
                "longitude": 36.8219,
                "latitude": -1.2921,
            },
        },
        "destination_routestop": {
            "id": 6,
            "route_id": 2,
            "stop_id": 6,
            "sequence": 3,
            "stop": {
                "id": 6,
                "name": "Kangemi",
                "longitude": 36.7695,
                "latitude": -1.2675,
            },
        },
    }

    dumped = BookingDetailSchema().dump(booking_obj)

    assert dumped["user"]["email"] == "rider@example.com"
    assert "password" not in dumped["user"]
    assert dumped["origin_routestop"]["stop"]["name"] == "CBD"
    assert dumped["destination_routestop"]["stop"]["name"] == "Kangemi"