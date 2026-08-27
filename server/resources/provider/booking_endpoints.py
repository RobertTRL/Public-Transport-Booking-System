from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from config import db, app, api
from provider.dashboard_endpoints import get_current_provider_user

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

# api.add_resource(ProviderDashboardResource, '/api/v1/provider/dashboard')
# api.add_resource(ProviderRoutesResource, '/api/v1/provider/routes')
# api.add_resource(ProviderRouteDetailResource, '/api/v1/provider/routes/<int:route_id>')
# api.add_resource(ProviderRouteStopsResource, '/api/v1/provider/routes/<int:route_id>/stops')
db.init_app(app)





if __name__ == '__main__':
    app.run(debug=True)