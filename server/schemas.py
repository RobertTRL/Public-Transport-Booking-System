"""server/schemas.py — Marshmallow schemas for the transport booking API."""

from config import ma
from marshmallow import fields, validate, validates_schema, ValidationError


# ---------------------------------------------------------------------------
# Validation constants
# ---------------------------------------------------------------------------

NAME_MIN_LEN, NAME_MAX_LEN = 1, 100
PASSWORD_MIN_LEN, PASSWORD_MAX_LEN = 8, 128
PHONE_MIN_LEN, PHONE_MAX_LEN = 7, 20
COLOR_MIN_LEN, COLOR_MAX_LEN = 1, 30
CONTACT_MIN_LEN, CONTACT_MAX_LEN = 3, 100
ADDRESS_MAX_LEN = 255
ROLE_MAX_LEN = 50
PLATE_MIN_LEN, PLATE_MAX_LEN = 3, 20

TRIP_STATUSES = (
    "scheduled",
    "in_progress",
    "completed",
    "cancelled",
)


# ---------------------------------------------------------------------------
# Error messages
# ---------------------------------------------------------------------------

EMAIL_ERROR_MESSAGES = {
    "required": "Email is required.",
    "invalid": "Not a valid email address.",
}


# ---------------------------------------------------------------------------
# Reusable fields
# ---------------------------------------------------------------------------

def name_field(required=True):
    return fields.String(
        required=required,
        validate=validate.Length(
            min=NAME_MIN_LEN,
            max=NAME_MAX_LEN,
            error="Name must be between {min} and {max} characters.",
        ),
    )


def email_field():
    return fields.Email(
        required=True,
        error_messages=EMAIL_ERROR_MESSAGES,
    )


def password_field():
    return fields.String(
        required=True,
        load_only=True,
        validate=validate.Length(
            min=PASSWORD_MIN_LEN,
            max=PASSWORD_MAX_LEN,
            error="Password must be between {min} and {max} characters.",
        ),
    )


def phone_field():
    return fields.String(
        allow_none=True,
        validate=validate.Length(
            min=PHONE_MIN_LEN,
            max=PHONE_MAX_LEN,
            error="Phone number must be between {min} and {max} characters.",
        ),
    )


def positive_fk_field(label, required=True, allow_none=False):
    return fields.Integer(
        required=required,
        allow_none=allow_none,
        validate=validate.Range(
            min=1,
            error=f"{label} must be a positive integer.",
        ),
    )


# ---------------------------------------------------------------------------
# Base schema
# ---------------------------------------------------------------------------

class BaseSchema(ma.Schema):
    id = fields.Integer(dump_only=True)

    class Meta:
        ordered = True


# ---------------------------------------------------------------------------
# User / Passenger schemas
# ---------------------------------------------------------------------------

class PassengerSchema(BaseSchema):
    email = email_field()
    password = password_field()
    phone_number = phone_field()

class UserSchema(BaseSchema):
    sacco_id = positive_fk_field(
        "sacco_id",
        required=False,
        allow_none=True,
    )

    name = name_field(required=False)

    email = email_field()
    password = password_field()
    phone_number = phone_field()

    role = fields.String(
        required=False,
        allow_none=True,
        validate=validate.Length(
            min=1,
            max=ROLE_MAX_LEN,
            error="Role must be between 1 and {max} characters.",
        ),
    )


# ---------------------------------------------------------------------------
# Operator schema
# ---------------------------------------------------------------------------

class OperatorSchema(BaseSchema):
    name = name_field()

    address = fields.String(
        required=False,
        allow_none=True,
        validate=validate.Length(
            max=ADDRESS_MAX_LEN,
            error="Address is too long.",
        ),
    )

    contact = fields.String(
        required=True,
        validate=validate.Length(
            min=CONTACT_MIN_LEN,
            max=CONTACT_MAX_LEN,
            error="Contact must be between {min} and {max} characters.",
        ),
    )


# ---------------------------------------------------------------------------
# Manager schema
# ---------------------------------------------------------------------------

class ManagerSchema(BaseSchema):
    name = name_field()
    email = email_field()
    password = password_field()

    operator_id = positive_fk_field("operator_id")


# ---------------------------------------------------------------------------
# SACCO schema
# ---------------------------------------------------------------------------

class SaccoSchema(BaseSchema):
    name = name_field()

    contact = fields.String(
        required=True,
        validate=validate.Length(
            min=CONTACT_MIN_LEN,
            max=CONTACT_MAX_LEN,
            error="Contact must be between {min} and {max} characters.",
        ),
    )

    address = fields.String(
        allow_none=True,
        validate=validate.Length(
            max=ADDRESS_MAX_LEN,
            error="Address is too long.",
        ),
    )


# ---------------------------------------------------------------------------
# Vehicle schema
# ---------------------------------------------------------------------------

class VehicleSchema(BaseSchema):
    sacco_id = positive_fk_field(
        "sacco_id",
        required=False,
        allow_none=True,
    )

    number_plate = fields.String(
        required=True,
        validate=validate.Length(
            min=PLATE_MIN_LEN,
            max=PLATE_MAX_LEN,
            error="Number plate must be between {min} and {max} characters.",
        ),
    )

    capacity = fields.Integer(
        required=True,
        validate=validate.Range(
            min=1,
            error="Capacity must be at least 1 seat.",
        ),
    )

    is_active = fields.Boolean(
        dump_default=True,
        load_default=True,
    )


# ---------------------------------------------------------------------------
# Stop schema
# ---------------------------------------------------------------------------

class StopSchema(BaseSchema):
    route_id = positive_fk_field("route_id")

    name = name_field()

    # Keep x/y because the current test suite expects these fields.
    # These can be changed to longitude/latitude later together with tests.
    x_coordinate = fields.Float(
        required=True,
        validate=validate.Range(
            min=0,
            error="x_coordinate must be zero or positive.",
        ),
    )

    y_coordinate = fields.Float(
        required=True,
        validate=validate.Range(
            min=0,
            error="y_coordinate must be zero or positive.",
        ),
    )


# ---------------------------------------------------------------------------
# Route / RouteStop schemas
# ---------------------------------------------------------------------------

class RouteStopSchema(BaseSchema):
    route_id = positive_fk_field("route_id")
    stop_id = positive_fk_field("stop_id")

    sequence = fields.Integer(
        required=True,
        validate=validate.Range(
            min=0,
            error="Sequence must be zero or a positive integer.",
        ),
    )


class RouteStopDetailSchema(RouteStopSchema):
    stop = fields.Nested(
        StopSchema,
        dump_only=True,
    )


class RouteSchema(BaseSchema):
    name = name_field()

    color = fields.String(
        required=True,
        validate=validate.Length(
            min=COLOR_MIN_LEN,
            max=COLOR_MAX_LEN,
            error="Color must be between {min} and {max} characters.",
        ),
    )

    # The current tests expect RouteSchema.dump()
    # to serialize a "stops" relationship.
    stops = fields.Nested(
        StopSchema,
        many=True,
        dump_only=True,
    )

    route_stops = fields.Nested(
        RouteStopDetailSchema,
        many=True,
        dump_only=True,
    )


# ---------------------------------------------------------------------------
# Booking schema
# ---------------------------------------------------------------------------

class BookingSchema(BaseSchema):
    user_id = positive_fk_field("user_id")
    seat_id = positive_fk_field("seat_id")
    trip_id = positive_fk_field("trip_id")
    origin_id = positive_fk_field("origin_id")
    destination_id = positive_fk_field("destination_id")

    @validates_schema
    def validate_booking_stops(self, data, **kwargs):
        origin = data.get("origin_id")
        destination = data.get("destination_id")

        if origin is not None and destination is not None:
            if origin == destination:
                raise ValidationError(
                    "destination_id must be different from origin_id.",
                    field_name="destination_id",
                )


# ---------------------------------------------------------------------------
# Booking detail schema
# ---------------------------------------------------------------------------

class BookingDetailSchema(BookingSchema):
    user = fields.Nested(
        UserSchema,
        dump_only=True,
    )

    origin = fields.Nested(
        StopSchema,
        dump_only=True,
    )

    destination = fields.Nested(
        StopSchema,
        dump_only=True,
    )


# ---------------------------------------------------------------------------
# Trip schema
# ---------------------------------------------------------------------------

class TripSchema(BaseSchema):
    origin_routestop_id = positive_fk_field(
        "origin_routestop_id"
    )

    destination_routestop_id = positive_fk_field(
        "destination_routestop_id"
    )

    vehicle_id = positive_fk_field(
        "vehicle_id"
    )

    start_time = fields.DateTime(
        required=False,
        allow_none=True,
    )

    stop_time = fields.DateTime(
        allow_none=True,
        required=False,
    )

    status = fields.String(
        load_default="scheduled",
        dump_default="scheduled",
        validate=validate.OneOf(
            TRIP_STATUSES,
            error="Status must be one of: {choices}.",
        ),
    )

    @validates_schema
    def validate_trip_stops(self, data, **kwargs):
        origin = data.get("origin_routestop_id")
        destination = data.get("destination_routestop_id")

        if (
            origin is not None
            and destination is not None
            and origin == destination
        ):
            raise ValidationError(
                "destination_routestop_id must be different from "
                "origin_routestop_id.",
                field_name="destination_routestop_id",
            )

    @validates_schema
    def validate_trip_times(self, data, **kwargs):
        start = data.get("start_time")
        stop = data.get("stop_time")

        if start and stop and stop <= start:
            raise ValidationError(
                "stop_time must be later than start_time.",
                field_name="stop_time",
            )