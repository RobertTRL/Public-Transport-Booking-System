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

import server.resources.passenger
import server.resources.auth_endpoints

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