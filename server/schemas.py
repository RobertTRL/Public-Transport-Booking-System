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

    class Meta:
        ordered = True
