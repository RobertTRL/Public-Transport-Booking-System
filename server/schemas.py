# """server/schemas.py — Marshmallow schemas for the transport booking API.
# Plain ma.Schema (not SQLAlchemyAutoSchema) until models.py is populated;
# field shapes should carry over once real models land.
# """

# from config import ma
# from marshmallow import fields, validate, validates_schema, ValidationError

# NAME_MIN_LEN, NAME_MAX_LEN = 1, 100
# PASSWORD_MIN_LEN, PASSWORD_MAX_LEN = 8, 128
# PHONE_MIN_LEN, PHONE_MAX_LEN = 7, 20
# COLOR_MIN_LEN, COLOR_MAX_LEN = 1, 30
# CONTACT_MIN_LEN, CONTACT_MAX_LEN = 3, 100
# ADDRESS_MAX_LEN = 255
# ROLE_MAX_LEN = 50

# EMAIL_ERROR_MESSAGES = {
#     "required": "Email is required.",
#     "invalid": "Not a valid email address.",
# }


# def name_field(required=True):
#     return fields.String(
#         required=required,
#         validate=validate.Length(min=NAME_MIN_LEN, max=NAME_MAX_LEN, error="Name must be between {min} and {max} characters."),
#     )


# def email_field():
#     return fields.Email(required=True, error_messages=EMAIL_ERROR_MESSAGES)


# def password_field():
#     # load_only: hashing happens in the view layer, not here.
#     return fields.String(
#         required=True,
#         load_only=True,
#         validate=validate.Length(min=PASSWORD_MIN_LEN, max=PASSWORD_MAX_LEN, error="Password must be between {min} and {max} characters."),
#     )


# def phone_field():
#     return fields.String(
#         allow_none=True,
#         validate=validate.Length(min=PHONE_MIN_LEN, max=PHONE_MAX_LEN, error="Phone number must be between {min} and {max} characters."),
#     )


# def positive_fk_field(label, required=True):
#     return fields.Integer(required=required, validate=validate.Range(min=1, error=f"{label} must be a positive integer."))


# class BaseSchema(ma.Schema):
#     id = fields.Integer(dump_only=True)

#     class Meta:
#         ordered = True


# class UserSchema(BaseSchema):
#     email = email_field()
#     password = password_field()
#     phone_number = phone_field()


# class OperatorSchema(BaseSchema):
#     name = name_field()
#     address = fields.String(allow_none=True, validate=validate.Length(max=ADDRESS_MAX_LEN, error="Address is too long."))
#     contact = fields.String(
#         required=True,
#         validate=validate.Length(min=CONTACT_MIN_LEN, max=CONTACT_MAX_LEN, error="Contact must be between {min} and {max} characters."),
#     )
#     # Requires an Operator model with a `managers` relationship/backref.
#     managers = fields.Nested("ManagerSchema", many=True, dump_only=True)


# class ManagerSchema(BaseSchema):
#     name = name_field()
#     email = email_field()
#     password = password_field()
#     operator_id = positive_fk_field("operator_id")
#     phone_number = phone_field()
#     role = fields.String(allow_none=True, validate=validate.Length(max=ROLE_MAX_LEN, error="Role is too long."))


# class RouteSchema(BaseSchema):
#     name = name_field()
#     color = fields.String(
#         required=True,
#         validate=validate.Length(min=COLOR_MIN_LEN, max=COLOR_MAX_LEN, error="Color must be between {min} and {max} characters."),
#     )
#     # Requires a Route model with a `stops` relationship/backref.
#     stops = fields.Nested("StopSchema", many=True, dump_only=True)


# class StopSchema(BaseSchema):
#     route_id = positive_fk_field("route_id")
#     name = name_field()
#     longitude = fields.Float(required=True, validate=validate.Range(min=-180, max=180, error="Longitude must be between -180 and 180."))
#     latitude = fields.Float(required=True, validate=validate.Range(min=-90, max=90, error="Latitude must be between -90 and 90."))


# class BookingSchema(BaseSchema):
#     user_id = positive_fk_field("user_id")
#     seat_id = positive_fk_field("seat_id")
#     trip_id = positive_fk_field("trip_id")
#     origin_id = positive_fk_field("origin_id")
#     destination_id = positive_fk_field("destination_id")
#     made_at = fields.DateTime(dump_only=True)

#     @validates_schema
#     def validate_origin_destination(self, data, **kwargs):
#         if data.get("origin_id") is not None and data.get("origin_id") == data.get("destination_id"):
#             raise ValidationError("destination_id must be different from origin_id.", field_name="destination_id")


# class BookingDetailSchema(BookingSchema):
#     user = fields.Nested(UserSchema, dump_only=True)
#     origin = fields.Nested(StopSchema, dump_only=True)
#     destination = fields.Nested(StopSchema, dump_only=True)


# class VehicleSchema(BaseSchema):
#     registration_number = fields.String(
#         required=True,
#         validate=validate.Length(min=1, max=30, error="Registration number must be between {min} and {max} characters."),
#     )
#     operator_id = positive_fk_field("operator_id")
#     capacity = fields.Integer(required=True, validate=validate.Range(min=1, error="Capacity must be at least 1."))
#     seats = fields.Nested("SeatSchema", many=True, dump_only=True)


# class SeatSchema(BaseSchema):
#     vehicle_id = positive_fk_field("vehicle_id")
#     seat_number = fields.String(required=True, validate=validate.Length(min=1, max=20, error="Seat number must be between {min} and {max} characters."))


# class TripSchema(BaseSchema):
#     origin_id = positive_fk_field("origin_id")
#     destination_id = positive_fk_field("destination_id")
#     vehicle_id = positive_fk_field("vehicle_id")
#     start_time = fields.DateTime(required=True)
#     end_time = fields.DateTime(required=True)

#     @validates_schema
#     def validate_trip_locations(self, data, **kwargs):
#         if data.get("origin_id") is not None and data.get("destination_id") is not None and data["origin_id"] == data["destination_id"]:
#             raise ValidationError("destination_id must be different from origin_id.", field_name="destination_id")

#     @validates_schema
#     def validate_trip_times(self, data, **kwargs):
#         start_time = data.get("start_time")
#         end_time = data.get("end_time")
#         if start_time and end_time and end_time <= start_time:
#             raise ValidationError("end_time must be later than start_time.", field_name="end_time")

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
# func to validate positive integere
def positive_fk_field(label, required=True):
    return fields.Integer(
        required=required,
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
    sacco_id = positive_fk_field("sacco_id")
    number_plate = fields.String(
        required=True,
        validate=validate.Length(min=PLATE_MIN_LEN, max=PLATE_MAX_LEN, error="Number plate must be between {min} and {max} characters."),
    )
    capacity = fields.Integer(
        required=True,
        validate=validate.Range(min=1, error="Capacity must be at least 1 seat."),
    )

# schemas for the transit
class StopSchema(BaseSchema):
    route_id = positive_fk_field("route_id")
    name = name_field()
    longitude = fields.Float(
        required=True,
        validate=validate.Range(min=-180, max=180, error="Longitude must be between -180 and 180."),
    )
    latitude = fields.Float(
        required=True,
        validate=validate.Range(min=-90, max=90, error="Latitude must be between -90 and 90."),
    )


class RouteSchema(BaseSchema):
    name = name_field()
    color = fields.String(
        required=True,
        validate=validate.Length(min=COLOR_MIN_LEN, max=COLOR_MAX_LEN, error="Color must be between {min} and {max} characters."),
    )
    stops = fields.Nested(StopSchema, many=True, dump_only=True)