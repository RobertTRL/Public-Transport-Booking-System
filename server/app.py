from flask import Flask
from flask_migrate import Migrate

from config import app, db
from provider_routes import provider_bp

import passenger
import IAM
from models import (
    User,
    Passenger,
    Route,
    Stop,
    RouteStop,
    Booking,
    Vehicle,
    Sacco,
    Trip
)

import passenger
import IAM

"""
# IAM endpoints for passengers and providers
# Robert
POST  /api/v1/auth/passenger/register
POST  /api/v1/auth/provider/register
POST  /api/v1/auth/passenger/login
POST  /api/v1/auth/provider/login

# Passenger endpoints
# Norman
GET     /api/v1/stops
GET     /api/v1/routes/search
GET     /api/v1/trips
GET     /api/v1/trips/<int:trip_id>
GET     /api/v1/trips/<int:trip_id>/availability
POST    /api/v1/bookings
GET     /api/v1/me/bookings
GET     /api/v1/bookings/<int:booking_id>
PATCH   /api/v1/bookings/<int:booking_id>/cancel
GET     /api/v1/routes/<int:route_id>

# Provider endpoints
# Vincent
GET     /api/v1/provider/dashboard
GET     /api/v1/provider/routes
POST    /api/v1/provider/routes
GET     /api/v1/provider/routes/<int:route_id>
PATCH   /api/v1/provider/routes/<int:route_id>
DELETE  /api/v1/provider/routes/<int:route_id>
POST    /api/v1/provider/routes/<int:route_id>/stops
PUT     /api/v1/provider/routes/<int:route_id>/stops
GET     /api/v1/provider/routes/<int:route_id>/stops

# Marlene
PATCH   /api/v1/provider/routes/<int:route_id>/stops/<int:stop_id>
DELETE  /api/v1/provider/routes/<int:route_id>/stops/<int:stop_id>
GET     /api/v1/provider/vehicles
POST    /api/v1/stops
PATCH   /api/v1/stops/<int:stop_id>
DELETE  /api/v1/stops/<int:stop_id>
GET     /api/v1/provider/vehicles?route_id=&q=
POST    /api/v1/provider/vehicles

# Stephen
GET     /api/v1/provider/vehicles/<int:vehicle_id>
PATCH   /api/v1/provider/vehicles/<int:vehicle_id>
DELETE  /api/v1/provider/vehicles/<int:vehicle_id>
GET     /api/v1/provider/routes/<int:route_id>/trips?from=&to=
POST    /api/v1/provider/routes/<int:route_id>/trips
PATCH   /api/v1/provider/trips/<int:trip_id>
PATCH   /api/v1/provider/trips/<int:trip_id>/cancel
GET     /api/v1/provider/bookings?route_id=&trip_id=&from=&to=&status=
GET     /api/v1/provider/booking-statistics?from=&to=&group_by=day
GET     /api/v1/provider/trips/<int:trip_id>/bookings

# 41 total routes
"""

migrate = Migrate(app, db)

# Register Stephen's provider endpoints
app.register_blueprint(provider_bp)


if __name__ == "__main__":
    app.run(debug=True)