from flask import Flask
from flask_migrate import Migrate
from resources.route_stops import UpdateRouteStopResource

from models import (
    db,
    app,
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


db.init_app(app)

api.add_resource(
    UpdateRouteStopResource,
    '/api/v1/provider/routes/<int:route_id>/stops/<int:stop_id>'
)

if __name__ == '__main__':
    app.run(debug=True)