"""server/schemas.py — Marshmallow schemas for the transport booking API."""

from datetime import datetime

from config import db, ma
from marshmallow import fields, validate, validates_schema, ValidationError

from models import RouteStop

# constants for validating
NAME_MIN_LEN, NAME_MAX_LEN = 1, 100
PASSWORD_MIN_LEN, PASSWORD_MAX_LEN = 8, 128
PHONE_MIN_LEN, PHONE_MAX_LEN = 7, 20
COLOR_MIN_LEN, COLOR_MAX_LEN = 1, 30
CONTACT_MIN_LEN, CONTACT_MAX_LEN = 3, 100
ADDRESS_MAX_LEN = 255
ROLE_MAX_LEN = 50
PLATE_MIN_LEN, PLATE_MAX_LEN = 3, 20
TRIP_STATUSES = ("scheduled", "in_progress", "completed", "cancelled")
# Booking.status: set internally (create -> "active", cancel -> "cancelled").
# Not client-settable via BookingSchema.load -- see BookingSchema below.
BOOKING_STATUSES = ("active", "cancelled")

# error messages that will be displayed
EMAIL_ERROR_MESSAGES = {
    "required": "Email is required.",
    "invalid": "Not a valid email address.",
}


# func to validate a name field
def name_field(required=True):
    return fields.String(
        required=required,
        validate=validate.Length(min=NAME_MIN_LEN, max=NAME_MAX_LEN, error="Name must be between {min} and {max} characters."),
    )


# validate the email
def email_field():
    return fields.Email(required=True, error_messages=EMAIL_ERROR_MESSAGES)


def password_field():
    # load_only ensures the raw password is never dumped to API responses
    return fields.String(
        required=True,
        load_only=True,
        validate=validate.Length(min=PASSWORD_MIN_LEN, max=PASSWORD_MAX_LEN, error="Password must be between {min} and {max} characters."),
    )


def phone_field():
    return fields.String(
        allow_none=True,
        validate=validate.Length(min=PHONE_MIN_LEN, max=PHONE_MAX_LEN, error="Phone number must be between {min} and {max} characters."),
    )


# func to validate positive integer FKs — allow_none lets it model an
# optional (nullable) foreign key. As of this revision every FK using this
# helper without overriding required/allow_none is a genuinely NOT NULL
# column, so the default (required=True, allow_none=False) is correct
# unless a specific column is actually nullable in models.py.
def positive_fk_field(label, required=True, allow_none=False):
    return fields.Integer(
        required=required,
        allow_none=allow_none,
        validate=validate.Range(min=1, error=f"{label} must be a positive integer."),
    )


# SCHEMAS
class BaseSchema(ma.Schema):
    id = fields.Integer(dump_only=True)

    class Meta:
        ordered = True


class PassengerSchema(BaseSchema):
    email = email_field()
    password = password_field()
    phone_number = phone_field()


class UserSchema(BaseSchema):
    # Users.sacco_id is `not null` in the DBML Table definition and in
    # models.py (nullable=False) -- this used to be marked optional here
    # based on a nonstandard "?" annotation on the DBML Ref line, which
    # contradicted the actual column. Fixed to require it.
    sacco_id = positive_fk_field("sacco_id")
    name = name_field()
    email = email_field()
    password = password_field()
    phone_number = phone_field()
    role = fields.String(
        required=True,
        validate=validate.Length(min=1, max=ROLE_MAX_LEN, error="Role must be between 1 and {max} characters."),
    )


# fleet and organizations
class SaccoSchema(BaseSchema):
    name = name_field()
    contact = fields.String(
        required=True,
        validate=validate.Length(min=CONTACT_MIN_LEN, max=CONTACT_MAX_LEN, error="Contact must be between {min} and {max} characters."),
    )
    address = fields.String(
        allow_none=True,
        validate=validate.Length(max=ADDRESS_MAX_LEN, error="Address is too long."),
    )


class VehicleSchema(BaseSchema):
    # Vehicles.sacco_id is `not null` -- see the note on UserSchema.sacco_id
    # above; this was the same bug.
    sacco_id = positive_fk_field("sacco_id")
    number_plate = fields.String(
        required=True,
        validate=validate.Length(min=PLATE_MIN_LEN, max=PLATE_MAX_LEN, error="Number plate must be between {min} and {max} characters."),
    )
    capacity = fields.Integer(
        required=True,
        validate=validate.Range(min=1, error="Capacity must be at least 1 seat."),
    )
    is_active = fields.Boolean(dump_default=True, load_default=True)


# schemas for the transit network
class StopSchema(BaseSchema):
    name = name_field()
    longitude = fields.Float(
        required=True,
        validate=validate.Range(min=-180, max=180, error="Longitude must be between -180 and 180."),
    )
    latitude = fields.Float(
        required=True,
        validate=validate.Range(min=-90, max=90, error="Latitude must be between -90 and 90."),
    )


class RouteStopSchema(BaseSchema):
    route_id = positive_fk_field("route_id")
    stop_id = positive_fk_field("stop_id")
    sequence = fields.Integer(
        required=True,
        validate=validate.Range(
            min=0,
            error="Sequence must be zero or a positive integer."
        )
    )


class RouteStopDetailSchema(RouteStopSchema):
    stop = fields.Nested(StopSchema, dump_only=True)


class RouteStopUpdateSchema(ma.Schema):
    sequence = fields.Integer(
        required=True,
        validate=validate.Range(
            min=0,
            error="Sequence must be zero or a positive integer."
        )
    )

class RouteSchema(BaseSchema):
    name = name_field()
    color = fields.String(
        required=True,
        validate=validate.Length(min=COLOR_MIN_LEN, max=COLOR_MAX_LEN, error="Color must be between {min} and {max} characters."),
    )
    route_stops = fields.Nested(RouteStopDetailSchema, many=True, dump_only=True)


class TripSchema(BaseSchema):
    origin_routestop_id = positive_fk_field("origin_routestop_id")
    destination_routestop_id = positive_fk_field("destination_routestop_id")
    vehicle_id = positive_fk_field("vehicle_id")
    # Was `fields.DateTime()` (a Field instance, not a value) -- marshmallow
    # needs an actual value or a zero-arg callable here. The model already
    # has a DB-side default (`default=db.func.now()`), so this app-layer
    # default just needs to be a real, current timestamp when start_time
    # is omitted.
    start_time = fields.DateTime(dump_default=datetime.utcnow, load_default=datetime.utcnow)
    stop_time = fields.DateTime(allow_none=True)
    status = fields.String(
        load_default="scheduled",
        dump_default="scheduled",
        validate=validate.OneOf(TRIP_STATUSES, error="Status must be one of: {choices}."),
    )

    @validates_schema
    def validate_trip_stops(self, data, **kwargs):
        origin = data.get("origin_routestop_id")
        destination = data.get("destination_routestop_id")
        if origin and destination and origin == destination:
            raise ValidationError("destination_routestop_id must be different from origin_routestop_id.", field_name="destination_routestop_id")

    @validates_schema
    def validate_trip_times(self, data, **kwargs):
        start = data.get("start_time")
        stop = data.get("stop_time")
        if start and stop and stop <= start:
            raise ValidationError("stop_time must be later than start_time.", field_name="stop_time")

    @validates_schema
    def validate_trip_route_stops(self, data, **kwargs):
        """
        Ensure origin/destination belong to the same route and are in
        order. Previously only checked that the two ids differed -- the
        same rule enforced for passenger-facing segments via
        `valid_route_segment` in routes.py was not enforced here, so a
        Trip could be created spanning two unrelated routes, or with its
        destination before its origin.
        """
        origin_id = data.get("origin_routestop_id")
        destination_id = data.get("destination_routestop_id")

        if not origin_id or not destination_id:
            return

        if origin_id == destination_id:
            return

        origin = db.session.get(RouteStop, origin_id)
        destination = db.session.get(RouteStop, destination_id)

        if not origin or not destination:
            raise ValidationError(
                "origin_routestop_id and destination_routestop_id must "
                "reference existing route stops.",
                field_name="destination_routestop_id",
            )
        if not origin or not destination:
            raise ValidationError(
                "origin_routestop_id and destination_routestop_id must "
                "reference existing route stops.",
                field_name="destination_routestop_id",
            )

        if origin.route_id != destination.route_id:
            raise ValidationError(
                "origin_routestop_id and destination_routestop_id must "
                "belong to the same route.",
                field_name="destination_routestop_id",
            )

        if origin.sequence >= destination.sequence:
            raise ValidationError(
                "origin_routestop_id must precede destination_routestop_id "
                "on the route.",
                field_name="destination_routestop_id",
            )


class TripDetailSchema(TripSchema):
    origin_routestop = fields.Nested(RouteStopDetailSchema, dump_only=True)
    destination_routestop = fields.Nested(RouteStopDetailSchema, dump_only=True)
    vehicle = fields.Nested(VehicleSchema, dump_only=True)


# schemas for bookings and transactions
class BookingSchema(BaseSchema):
    user_id = positive_fk_field("user_id")
    # Bookings.trip_id is `not null` in the DBML Table definition. It used
    # to be marked optional here (and nulled out on the model on
    # cancellation) -- cancellation is now tracked via `status` /
    # `cancelled_at` instead, so trip_id is required again and always
    # present, matching the column.
    trip_id = positive_fk_field("trip_id")
    origin_routestop_id = positive_fk_field("origin_routestop_id")
    destination_routestop_id = positive_fk_field("destination_routestop_id")
    # Always starts "active" on creation and is only ever changed by the
    # dedicated cancel action -- never accepted directly from client input.
    status = fields.String(dump_only=True)
    cancelled_at = fields.DateTime(dump_only=True, allow_none=True)
    made_at = fields.DateTime(dump_only=True)

    @validates_schema
    def validate_origin_destination(self, data, **kwargs):
        origin = data.get("origin_routestop_id")
        destination = data.get("destination_routestop_id")
        if origin and destination and origin == destination:
            raise ValidationError("destination_routestop_id must be different from origin_routestop_id.", field_name="destination_routestop_id")


class BookingDetailSchema(BookingSchema):
    user = fields.Nested(PassengerSchema, dump_only=True)
    trip = fields.Nested(TripDetailSchema, dump_only=True)
    origin_routestop = fields.Nested(RouteStopDetailSchema, dump_only=True)
    destination_routestop = fields.Nested(RouteStopDetailSchema, dump_only=True)