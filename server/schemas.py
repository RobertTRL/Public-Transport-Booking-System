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

# --- shared length/range limits (kept in one place instead of repeated
# magic numbers across every schema) -----------------------------------
NAME_MIN_LEN, NAME_MAX_LEN = 1, 100
PASSWORD_MIN_LEN, PASSWORD_MAX_LEN = 8, 128
PHONE_MIN_LEN, PHONE_MAX_LEN = 7, 20
COLOR_MIN_LEN, COLOR_MAX_LEN = 1, 30
CONTACT_MIN_LEN, CONTACT_MAX_LEN = 3, 100
ADDRESS_MAX_LEN = 255
ROLE_MAX_LEN = 50

EMAIL_ERROR_MESSAGES = {
    "required": "Email is required.",
    "invalid": "Not a valid email address.",
}


def name_field(required=True):
    return fields.String(
        required=required,
        validate=validate.Length(
            min=NAME_MIN_LEN, max=NAME_MAX_LEN, error="Name must be between {min} and {max} characters."
        ),
    )


def email_field():
    return fields.Email(required=True, error_messages=EMAIL_ERROR_MESSAGES)


def password_field():
    """Raw input field, load_only. Hashing into *_hash happens in the
    resource/view layer, never in the schema."""
    return fields.String(
        required=True,
        load_only=True,
        validate=validate.Length(
            min=PASSWORD_MIN_LEN, max=PASSWORD_MAX_LEN, error="Password must be between {min} and {max} characters."
        ),
    )


def phone_field():
    return fields.String(
        allow_none=True,
        validate=validate.Length(
            min=PHONE_MIN_LEN, max=PHONE_MAX_LEN, error="Phone number must be between {min} and {max} characters."
        ),
    )


def positive_fk_field(label, required=True):
    """An integer foreign-key field that must be a positive integer."""
    return fields.Integer(
        required=required,
        validate=validate.Range(min=1, error=f"{label} must be a positive integer."),
    )


class BaseSchema(ma.Schema):
    """Common shape for every schema below: an auto id, and stable key
    ordering in dumped output."""

    id = fields.Integer(dump_only=True)

    class Meta:
        ordered = True


class UserSchema(BaseSchema):
    """Riders. ERD: Users(id, email, password_hash, phone_number)."""

    email = email_field()
    password = password_field()
    phone_number = phone_field()


class OperatorSchema(BaseSchema):
    """Bus/transit operators. ERD: Operators(id, name, address, contact)."""

    name = name_field()
    address = fields.String(
        allow_none=True, validate=validate.Length(max=ADDRESS_MAX_LEN, error="Address is too long.")
    )
    contact = fields.String(
        required=True,
        validate=validate.Length(
            min=CONTACT_MIN_LEN, max=CONTACT_MAX_LEN, error="Contact must be between {min} and {max} characters."
        ),
    )
    # One-to-many, dump only: this operator's managers. Relies on the
    # eventual Operator model exposing a `managers` relationship/backref
    # with that exact attribute name. ManagerSchema only exposes operator_id
    # (not a nested operator), so there is no Operator <-> Manager cycle.
    managers = fields.Nested("ManagerSchema", many=True, dump_only=True)


class ManagerSchema(BaseSchema):
    """Operator staff/admins. ERD: Managers(id, name, email, password_hash,
    operator_id, phone_number, role)."""

    name = name_field()
    email = email_field()
    password = password_field()
    operator_id = positive_fk_field("operator_id")
    phone_number = phone_field()
    # No fixed set of roles confirmed yet — keeping this a free-text field
    # with a sane length cap until Robert specifies role values.
    role = fields.String(allow_none=True, validate=validate.Length(max=ROLE_MAX_LEN, error="Role is too long."))


class RouteSchema(BaseSchema):
    """ERD: Routes(id, name, color). `color` is used to render the route's
    line on the map (see feature/map-preview)."""

    name = name_field()
    # Length-only for now — Schema.txt doesn't say whether this is a hex code
    # (e.g. "#1E90FF") or a named color. Tighten with validate.Regexp once
    # Robert/the frontend map work settles on a format.
    color = fields.String(
        required=True,
        validate=validate.Length(
            min=COLOR_MIN_LEN, max=COLOR_MAX_LEN, error="Color must be between {min} and {max} characters."
        ),
    )
    # One-to-many, dump only: this route's stops. Relies on the eventual
    # Route model exposing a `stops` relationship/backref with that exact
    # attribute name. StopSchema only exposes route_id (not a nested route),
    # so there is no Route <-> Stop cycle.
    stops = fields.Nested("StopSchema", many=True, dump_only=True)


class StopSchema(BaseSchema):
    """ERD: Stops(id, route_id, name, x_coordinate, y_coordinate). Each stop
    belongs to exactly one route (route_id is a plain FK field here, not a
    nested Route, to avoid a Route <-> Stop serialization cycle — see
    RouteSchema.stops above)."""

    route_id = positive_fk_field("route_id")
    name = name_field()
    # Assumes a non-negative pixel/map coordinate system (matches the custom
    # Schema.png map), not signed GPS lat/long. Adjust the range if Robert's
    # coordinate system turns out to be different.
    x_coordinate = fields.Float(required=True, validate=validate.Range(min=0, error="x_coordinate cannot be negative."))
    y_coordinate = fields.Float(required=True, validate=validate.Range(min=0, error="y_coordinate cannot be negative."))


# ---------------------------------------------------------------------------
# Note on the many-to-many requirement: Schema.txt does not show an explicit
# M2M / join table among User, Operator, Manager, Route or Stop — Route<->Stop
# and Operator<->Manager are both plain one-to-many FKs (handled above). The
# one real association/junction entity in Robert's full ERD is Bookings,
# which ties a User to a Seat and a Trip (unique on seat_id+trip_id prevents
# double-booking a seat on a trip) — added below per team decision, even
# though Booking/Seat/Trip aren't in this branch's assigned model list.
# Seat/Trip/Vehicle don't have schemas yet, so BookingSchema references them
# as plain FK ids only.
# ---------------------------------------------------------------------------


class BookingSchema(BaseSchema):
    """ERD: Bookings(id, user_id, seat_id, trip_id, origin_id, destination_id,
    made_at). Flat/FK-id shape — used for create/update and list views."""

    user_id = positive_fk_field("user_id")
    seat_id = positive_fk_field("seat_id")
    trip_id = positive_fk_field("trip_id")
    origin_id = positive_fk_field("origin_id")
    destination_id = positive_fk_field("destination_id")
    made_at = fields.DateTime(dump_only=True)

    @validates_schema
    def validate_origin_destination(self, data, **kwargs):
        if data.get("origin_id") is not None and data.get("origin_id") == data.get("destination_id"):
            raise ValidationError(
                "destination_id must be different from origin_id.", field_name="destination_id"
            )


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
