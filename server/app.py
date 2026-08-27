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

from resources.stops import (
    CreateStopResource,
    UpdateStopResource,
    DeleteStopResource
)

api.add_resource(
    CreateStopResource,
    '/api/v1/stops'
)

api.add_resource(
    UpdateStopResource,
    '/api/v1/stops/<int:stop_id>'
)

api.add_resource(
    DeleteStopResource,
    '/api/v1/stops/<int:stop_id>'
)
from resources.routes import (
    ListCreateRouteResource,
    UpdateDeleteRouteResource
)

api.add_resource(
    ListCreateRouteResource,
    '/api/v1/routes'
)

api.add_resource(
    UpdateDeleteRouteResource,
    '/api/v1/routes/<int:route_id>'
)
if __name__ == '__main__':
    app.run(debug=True)