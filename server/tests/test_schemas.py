"""
server/tests/test_schemas.py

Tests for server/schemas.py. Marshmallow schemas are pure Python (no DB
needed), so these run against the schemas directly with .load()/.dump() —
no Flask app context or live Postgres connection required.
"""

from schemas import (
    BookingDetailSchema,
    BookingSchema,
    ManagerSchema,
    OperatorSchema,
    RouteSchema,
    StopSchema,
    UserSchema,
)


# ---------------------------------------------------------------------------
# UserSchema
# ---------------------------------------------------------------------------

def test_user_schema_accepts_valid_data():
    data = {"email": "rider@example.com", "password": "supersecret1", "phone_number": "0712345678"}
    loaded = UserSchema().load(data)
    assert loaded["email"] == "rider@example.com"
    assert loaded["password"] == "supersecret1"


def test_user_schema_requires_email_and_password():
    errors = UserSchema().validate({})
    assert "email" in errors
    assert "password" in errors


def test_user_schema_rejects_invalid_email_format():
    errors = UserSchema().validate({"email": "not-an-email", "password": "supersecret1"})
    assert "email" in errors


def test_user_schema_rejects_short_password():
    errors = UserSchema().validate({"email": "rider@example.com", "password": "abc"})
    assert "password" in errors


def test_user_schema_never_dumps_password():
    dumped = UserSchema().dump({"id": 1, "email": "rider@example.com", "password": "supersecret1", "phone_number": None})
    assert "password" not in dumped
    assert dumped["email"] == "rider@example.com"


# ---------------------------------------------------------------------------
# OperatorSchema
# ---------------------------------------------------------------------------

def test_operator_schema_accepts_valid_data():
    data = {"name": "City Hoppa", "address": "Nairobi CBD", "contact": "0700111222"}
    loaded = OperatorSchema().load(data)
    assert loaded["name"] == "City Hoppa"


def test_operator_schema_requires_name_and_contact():
    errors = OperatorSchema().validate({"address": "Nairobi CBD"})
    assert "name" in errors
    assert "contact" in errors


def test_operator_schema_allows_missing_address():
    errors = OperatorSchema().validate({"name": "City Hoppa", "contact": "0700111222"})
    assert errors == {}


# ---------------------------------------------------------------------------
# ManagerSchema
# ---------------------------------------------------------------------------

def test_manager_schema_accepts_valid_data():
    data = {"name": "Jane Doe", "email": "jane@cityhoppa.co.ke", "password": "supersecret1", "operator_id": 1}
    errors = ManagerSchema().validate(data)
    assert errors == {}


def test_manager_schema_rejects_non_positive_operator_id():
    data = {"name": "Jane Doe", "email": "jane@cityhoppa.co.ke", "password": "supersecret1", "operator_id": 0}
    errors = ManagerSchema().validate(data)
    assert "operator_id" in errors


def test_manager_schema_requires_operator_id():
    data = {"name": "Jane Doe", "email": "jane@cityhoppa.co.ke", "password": "supersecret1"}
    errors = ManagerSchema().validate(data)
    assert "operator_id" in errors


# ---------------------------------------------------------------------------
# RouteSchema
# ---------------------------------------------------------------------------

def test_route_schema_accepts_valid_data():
    errors = RouteSchema().validate({"name": "Route 24", "color": "#1E90FF"})
    assert errors == {}


def test_route_schema_requires_name_and_color():
    errors = RouteSchema().validate({})
    assert "name" in errors
    assert "color" in errors


def test_route_schema_dumps_nested_stops_without_circular_route():
    route_obj = {
        "id": 1,
        "name": "Route 24",
        "color": "#1E90FF",
        "stops": [
            {"id": 10, "route_id": 1, "name": "Stage A", "x_coordinate": 1.0, "y_coordinate": 2.0},
            {"id": 11, "route_id": 1, "name": "Stage B", "x_coordinate": 3.0, "y_coordinate": 4.0},
        ],
    }
    dumped = RouteSchema().dump(route_obj)
    assert len(dumped["stops"]) == 2
    assert dumped["stops"][0]["name"] == "Stage A"
    # Each nested stop should carry its route_id but never a nested route
    # back-reference (that's what avoids the circular serialization loop).
    assert dumped["stops"][0]["route_id"] == 1
    assert "route" not in dumped["stops"][0]


# ---------------------------------------------------------------------------
# StopSchema
# ---------------------------------------------------------------------------

def test_stop_schema_accepts_valid_data():
    data = {"route_id": 1, "name": "Stage A", "x_coordinate": 12.5, "y_coordinate": 40.2}
    errors = StopSchema().validate(data)
    assert errors == {}


def test_stop_schema_rejects_negative_coordinates():
    data = {"route_id": 1, "name": "Stage A", "x_coordinate": -1.0, "y_coordinate": 40.2}
    errors = StopSchema().validate(data)
    assert "x_coordinate" in errors


def test_stop_schema_requires_route_id():
    data = {"name": "Stage A", "x_coordinate": 12.5, "y_coordinate": 40.2}
    errors = StopSchema().validate(data)
    assert "route_id" in errors


# ---------------------------------------------------------------------------
# BookingSchema / BookingDetailSchema (association/junction example)
# ---------------------------------------------------------------------------

def test_booking_schema_accepts_valid_data():
    data = {"user_id": 1, "seat_id": 2, "trip_id": 3, "origin_id": 5, "destination_id": 6}
    errors = BookingSchema().validate(data)
    assert errors == {}


def test_booking_schema_rejects_same_origin_and_destination():
    data = {"user_id": 1, "seat_id": 2, "trip_id": 3, "origin_id": 5, "destination_id": 5}
    errors = BookingSchema().validate(data)
    assert "destination_id" in errors


def test_booking_schema_requires_all_foreign_keys():
    errors = BookingSchema().validate({})
    for field in ("user_id", "seat_id", "trip_id", "origin_id", "destination_id"):
        assert field in errors


def test_booking_detail_schema_dumps_nested_relations():
    booking_obj = {
        "id": 1,
        "user_id": 1,
        "seat_id": 2,
        "trip_id": 3,
        "origin_id": 5,
        "destination_id": 6,
        "user": {"id": 1, "email": "rider@example.com", "phone_number": None},
        "origin": {"id": 5, "route_id": 1, "name": "Stage A", "x_coordinate": 1.0, "y_coordinate": 2.0},
        "destination": {"id": 6, "route_id": 1, "name": "Stage B", "x_coordinate": 3.0, "y_coordinate": 4.0},
    }
    dumped = BookingDetailSchema().dump(booking_obj)
    assert dumped["user"]["email"] == "rider@example.com"
    assert "password" not in dumped["user"]
    assert dumped["origin"]["name"] == "Stage A"
    assert dumped["destination"]["name"] == "Stage B"
