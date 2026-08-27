from config import app, db, api

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

from resources.route_stops import (
    UpdateRouteStopResource,
    DeleteRouteStopResource
)


api.add_resource(
    UpdateRouteStopResource,
    '/api/v1/provider/routes/<int:route_id>/stops/<int:stop_id>'
)

api.add_resource(
    DeleteRouteStopResource,
    '/api/v1/provider/routes/<int:route_id>/stops/<int:stop_id>'
)


if __name__ == '__main__':
    app.run(debug=True)