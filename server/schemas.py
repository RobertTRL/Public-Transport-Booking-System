"""server/schemas.py — Marshmallow schemas for the transport booking API."""

from config import ma
from marshmallow import fields, validate, validates_schema, ValidationError

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
# optional (nullable) foreign key, e.g. Vehicle.sacco_id / Booking.trip_id
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
    # optional per schema: SACCOs.id <? Users.sacco_id
    sacco_id = positive_fk_field("sacco_id", required=False, allow_none=True)
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
    # optional per schema: SACCOs.id <? Vehicles.sacco_id
    sacco_id = positive_fk_field("sacco_id", required=False, allow_none=True)
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
    start_time = fields.DateTime(dump_default=fields.DateTime(), load_default=fields.DateTime())
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


class TripDetailSchema(TripSchema):
    origin_routestop = fields.Nested(RouteStopDetailSchema, dump_only=True)
    destination_routestop = fields.Nested(RouteStopDetailSchema, dump_only=True)
    vehicle = fields.Nested(VehicleSchema, dump_only=True)


# schemas for bookings and transactions
class BookingSchema(BaseSchema):
    user_id = positive_fk_field("user_id")
    # optional per schema: Bookings.trip_id ?> Trips.id
    trip_id = positive_fk_field("trip_id", required=False, allow_none=True)
    origin_routestop_id = positive_fk_field("origin_routestop_id")
    destination_routestop_id = positive_fk_field("destination_routestop_id")
    made_at = fields.DateTime(dump_only=True)

    @validates_schema
    def validate_origin_destination(self, data, **kwargs):
        origin = data.get("origin_routestop_id")
        destination = data.get("destination_routestop_id")
        if origin and destination and origin == destination:
            raise ValidationError("destination_routestop_id must be different from origin_routestop_id.", field_name="destination_routestop_id")


class BookingDetailSchema(BookingSchema):
    user = fields.Nested(PassengerSchema, dump_only=True)
    trip = fields.Nested(TripDetailSchema, dump_only=True, allow_none=True)
    origin_routestop = fields.Nested(RouteStopDetailSchema, dump_only=True)
    destination_routestop = fields.Nested(RouteStopDetailSchema, dump_only=True)