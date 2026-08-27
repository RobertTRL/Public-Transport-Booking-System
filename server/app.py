from flask import Flask
from flask_migrate import Migrate
from config import app, db
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

import resources.passenger
import resources.IAM

"""
# IAM endpoints for passengers and providers
# Robert
POST	            /api/v1/auth/passenger/register	                                                        register_passenger() ✓
POST	            /api/v1/auth/provider/register	                                                        register_provider() ✓
POST	            /api/v1/auth/passenger/login	                                                        login_passenger() ✓
POST	            /api/v1/auth/provider/login	                                                            login_provider() ✓


api.add_resource(
    UpdateRouteStopResource,
    '/api/v1/provider/routes/<int:route_id>/stops/<int:stop_id>'
)

api.add_resource(
    DeleteRouteStopResource,
    '/api/v1/provider/routes/<int:route_id>/stops/<int:stop_id>'
)

from resources.stops import (
    CreateStopResource,
    UpdateStopResource,
    DeleteStopResource
)

# 41 total routes
"""

# api.add_resource(
#     DeleteStopResource,
#     '/api/v1/stops/<int:stop_id>'
# )
# from resources.routes import (
#     ListCreateRouteResource,
#     UpdateDeleteRouteResource
# )

# api.add_resource(
#     ListCreateRouteResource,
#     '/api/v1/routes'
# )

# api.add_resource(
#     UpdateDeleteRouteResource,
#     '/api/v1/routes/<int:route_id>'
# )
if __name__ == '__main__':
    app.run(debug=True)