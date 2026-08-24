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
    email = fields.Email(required=True)
    # Exposed as "password" (not "password_hash"): schemas validate the raw
    # input the client sends. Hashing into User.password_hash happens in the
    # resource/view layer, never here.
    password = fields.String(required=True, load_only=True)
    phone_number = fields.String(allow_none=True)

    class Meta:
        ordered = True


class OperatorSchema(ma.Schema):
    """Bus/transit operators. ERD: Operators(id, name, address, contact)."""

    id = fields.Integer(dump_only=True)
    name = fields.String(required=True)
    address = fields.String(allow_none=True)
    contact = fields.String(required=True)
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
    name = fields.String(required=True)
    email = fields.Email(required=True)
    # Same rationale as UserSchema.password: raw input, hashed downstream.
    password = fields.String(required=True, load_only=True)
    operator_id = fields.Integer(required=True)
    phone_number = fields.String(allow_none=True)
    role = fields.String(allow_none=True)

    class Meta:
        ordered = True


class RouteSchema(ma.Schema):
    """ERD: Routes(id, name, color). `color` is used to render the route's
    line on the map (see feature/map-preview)."""

    id = fields.Integer(dump_only=True)
    name = fields.String(required=True)
    color = fields.String(required=True)
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
    route_id = fields.Integer(required=True)
    name = fields.String(required=True)
    x_coordinate = fields.Float(required=True)
    y_coordinate = fields.Float(required=True)

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
    user_id = fields.Integer(required=True)
    seat_id = fields.Integer(required=True)
    trip_id = fields.Integer(required=True)
    origin_id = fields.Integer(required=True)
    destination_id = fields.Integer(required=True)
    made_at = fields.DateTime(dump_only=True)

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
