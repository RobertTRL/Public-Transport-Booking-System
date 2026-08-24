"""
server/schemas.py

Marshmallow schemas for the Public Transport Booking System API.

Setup note: as of this branch point, server/models.py is still empty on
dev — only the ERD (Schema.txt / Schema.png) has been pushed. These
schemas are written as plain schemas (via flask-marshmallow's `ma.Schema`)
with fields mirroring the ERD directly, rather than `ma.SQLAlchemyAutoSchema`
bound to model classes. Once real SQLAlchemy models land on dev, these can
be converted to model-bound schemas without changing the public field
shapes below.

Schemas defined in this module (see Schema.txt for the full ERD):
    - UserSchema
    - OperatorSchema
    - ManagerSchema
    - RouteSchema
    - StopSchema
    - BookingSchema / BookingDetailSchema   (association/junction example)
"""

from config import ma
from marshmallow import fields, validate, validates_schema, ValidationError


class UserSchema(ma.Schema):
    """Riders. ERD: Users(id, email, password_hash, phone_number)."""

    id = fields.Integer(dump_only=True)
    email = fields.Email(
        required=True,
        error_messages={
            "required": "Email is required.",
            "invalid": "Not a valid email address.",
        },
    )
    # Exposed as "password" (not "password_hash"): schemas validate the raw
    # input the client sends. Hashing into User.password_hash happens in the
    # resource/view layer, never here.
    password = fields.String(
        required=True,
        load_only=True,
        validate=validate.Length(min=8, max=128, error="Password must be between {min} and {max} characters."),
    )
    phone_number = fields.String(
        allow_none=True,
        validate=validate.Length(min=7, max=20, error="Phone number must be between {min} and {max} characters."),
    )

    class Meta:
        ordered = True


class OperatorSchema(ma.Schema):
    """Bus/transit operators. ERD: Operators(id, name, address, contact)."""

    id = fields.Integer(dump_only=True)
    name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=100, error="Name must be between {min} and {max} characters."),
    )
    address = fields.String(allow_none=True, validate=validate.Length(max=255, error="Address is too long."))
    contact = fields.String(
        required=True,
        validate=validate.Length(min=3, max=100, error="Contact must be between {min} and {max} characters."),
    )
    # One-to-many, dump only: a list of this operator's managers. Relies on
    # the eventual Operator model exposing a `managers` relationship/backref
    # with that exact attribute name. ManagerSchema only exposes operator_id
    # (not a nested operator), so there is no Operator <-> Manager cycle.
    managers = fields.Nested("ManagerSchema", many=True, dump_only=True)

    class Meta:
        ordered = True


class ManagerSchema(ma.Schema):
    """Operator staff/admins. ERD: Managers(id, name, email, password_hash,
    operator_id, phone_number, role)."""

    id = fields.Integer(dump_only=True)
    name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=100, error="Name must be between {min} and {max} characters."),
    )
    email = fields.Email(
        required=True,
        error_messages={
            "required": "Email is required.",
            "invalid": "Not a valid email address.",
        },
    )
    # Same rationale as UserSchema.password: raw input, hashed downstream.
    password = fields.String(
        required=True,
        load_only=True,
        validate=validate.Length(min=8, max=128, error="Password must be between {min} and {max} characters."),
    )
    operator_id = fields.Integer(
        required=True,
        validate=validate.Range(min=1, error="operator_id must be a positive integer."),
    )
    phone_number = fields.String(
        allow_none=True,
        validate=validate.Length(min=7, max=20, error="Phone number must be between {min} and {max} characters."),
    )
    # No fixed set of roles confirmed yet — keeping this a free-text field
    # with a sane length cap until Robert specifies role values.
    role = fields.String(allow_none=True, validate=validate.Length(max=50, error="Role is too long."))

    class Meta:
        ordered = True


class RouteSchema(ma.Schema):
    """ERD: Routes(id, name, color). `color` is used to render the route's
    line on the map (see feature/map-preview)."""

    id = fields.Integer(dump_only=True)
    name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=100, error="Name must be between {min} and {max} characters."),
    )
    # Length-only for now — Schema.txt doesn't say whether this is a hex code
    # (e.g. "#1E90FF") or a named color. Tighten with validate.Regexp once
    # Robert/the frontend map work settles on a format.
    color = fields.String(
        required=True,
        validate=validate.Length(min=1, max=30, error="Color must be between {min} and {max} characters."),
    )
    # One-to-many, dump only: this route's stops. Relies on the eventual
    # Route model exposing a `stops` relationship/backref with that exact
    # attribute name. StopSchema only exposes route_id (not a nested route),
    # so there is no Route <-> Stop cycle.
    stops = fields.Nested("StopSchema", many=True, dump_only=True)

    class Meta:
        ordered = True


class StopSchema(ma.Schema):
    """ERD: Stops(id, route_id, name, x_coordinate, y_coordinate). Each stop
    belongs to exactly one route (route_id is a plain FK field here, not a
    nested Route, to avoid Route <-> Stop circular serialization — see
    RouteSchema.stops in the relationships section below)."""

    id = fields.Integer(dump_only=True)
    route_id = fields.Integer(
        required=True,
        validate=validate.Range(min=1, error="route_id must be a positive integer."),
    )
    name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=100, error="Name must be between {min} and {max} characters."),
    )
    # Assumes a non-negative pixel/map coordinate system (matches the custom
    # Schema.png map), not signed GPS lat/long. Adjust the range if Robert's
    # coordinate system turns out to be different.
    x_coordinate = fields.Float(required=True, validate=validate.Range(min=0, error="x_coordinate cannot be negative."))
    y_coordinate = fields.Float(required=True, validate=validate.Range(min=0, error="y_coordinate cannot be negative."))

    class Meta:
        ordered = True


# ---------------------------------------------------------------------------
# Note on the many-to-many requirement: Schema.txt does not show an explicit
# M2M / join table among User, Operator, Manager, Route or Stop — Route<->Stop
# and Operator<->Manager are both plain one-to-many FKs (handled above).
# The one real association/junction entity in Robert's full ERD is Bookings,
# which ties a User to a Seat and a Trip (unique on seat_id+trip_id prevents
# double-booking a seat on a trip) — added below per team decision, even
# though Booking/Seat/Trip aren't in this branch's assigned model list.
# Seat/Trip/Vehicle don't have schemas yet, so BookingSchema references them
# as plain FK ids only.
# ---------------------------------------------------------------------------


class BookingSchema(ma.Schema):
    """ERD: Bookings(id, user_id, seat_id, trip_id, origin_id, destination_id,
    made_at). Flat/FK-id shape — used for create/update and list views."""

    id = fields.Integer(dump_only=True)
    user_id = fields.Integer(required=True, validate=validate.Range(min=1, error="user_id must be a positive integer."))
    seat_id = fields.Integer(required=True, validate=validate.Range(min=1, error="seat_id must be a positive integer."))
    trip_id = fields.Integer(required=True, validate=validate.Range(min=1, error="trip_id must be a positive integer."))
    origin_id = fields.Integer(
        required=True, validate=validate.Range(min=1, error="origin_id must be a positive integer.")
    )
    destination_id = fields.Integer(
        required=True, validate=validate.Range(min=1, error="destination_id must be a positive integer.")
    )
    made_at = fields.DateTime(dump_only=True)

    @validates_schema
    def validate_origin_destination(self, data, **kwargs):
        if data.get("origin_id") is not None and data.get("origin_id") == data.get("destination_id"):
            raise ValidationError(
                "destination_id must be different from origin_id.", field_name="destination_id"
            )

    class Meta:
        ordered = True


class BookingDetailSchema(BookingSchema):
    """Read-only detail view of a booking: adds nested rider/origin/
    destination data on top of BookingSchema's flat ids. Only dump_only
    nested fields are added, so writes still go through BookingSchema's
    flat ids and there's no write-side circularity. Relies on the eventual
    Booking model exposing `user`, `origin` and `destination` relationship
    attributes with those exact names."""

    user = fields.Nested(UserSchema, dump_only=True)
    origin = fields.Nested(StopSchema, dump_only=True)
    destination = fields.Nested(StopSchema, dump_only=True)
