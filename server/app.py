from flask import Flask
from flask_migrate import Migrate
from config import app, api
import models

from resources.passenger import (
    MyBookingsResource, BookingResource, CancelBookingResource, 
    BookingDetailResource, RouteSearchResource, RouteResource,
    StopsResource, AvailableTripsResource, TripResource, TripAvailabilityResource
)
from resources.provider import (
    ProviderBookingsResource, BookingStatisticsResource, TripBookingsResource,
    ProviderDashboardResource, ProviderRoutesResource, ProviderRouteDetailResource,
    ProviderRouteStopsResource, UpdateRouteStopResource, DeleteRouteStopResource,
    CreateStopResource, UpdateStopResource, DeleteStopResource,
    ProviderRouteTripsResource, ProviderTripResource, CancelTripResource,
    ListVehiclesResource, CreateVehicleResource, ProviderVehicleResource
)

from resources.auth_endpoints import MeResource
from resources.provider.user_endpoints import (
    ListCreateUserResource,
    UpdateDeleteUserResource
)

api.add_resource(MeResource, '/api/v1/me')

api.add_resource(
    ListCreateUserResource,
    '/api/v1/users'
)

api.add_resource(
    UpdateDeleteUserResource,
    '/api/v1/users/<int:user_id>'
)

# Provider dashboard endpoint
api.add_resource(ProviderDashboardResource, '/api/v1/provider/dashboard')

# Provider booking endpoints
api.add_resource(ProviderBookingsResource, '/api/v1/provider/bookings')
api.add_resource(BookingStatisticsResource, '/api/v1/provider/booking-statistics')
api.add_resource(TripBookingsResource, '/api/v1/provider/trips/<int:trip_id>/bookings')

# Provider route endpoints
api.add_resource(ProviderRoutesResource, '/api/v1/provider/routes')
api.add_resource(ProviderRouteDetailResource, '/api/v1/provider/routes/<int:route_id>')

# Provider route-stops endpoints
api.add_resource(ProviderRouteStopsResource, '/api/v1/provider/routes/<int:route_id>/stops')
api.add_resource(UpdateRouteStopResource, '/api/v1/provider/routes/<int:route_id>/stops/<int:stop_id>')
api.add_resource(DeleteRouteStopResource, '/api/v1/provider/routes/<int:route_id>/stops/<int:stop_id>')

# Provider stop endpoints
api.add_resource(CreateStopResource, '/api/v1/stops')
api.add_resource(UpdateStopResource, '/api/v1/stops/<int:stop_id>')
api.add_resource(DeleteStopResource, '/api/v1/stops/<int:stop_id>')

# Provider trip endpoints
api.add_resource(ProviderRouteTripsResource, '/api/v1/provider/routes/<int:route_id>/trips')
api.add_resource(ProviderTripResource, '/api/v1/provider/trips/<int:trip_id>')
api.add_resource(CancelTripResource, '/api/v1/provider/trips/<int:trip_id>/cancel')

# Provider vehicle endpoints
api.add_resource(ListVehiclesResource, '/api/v1/provider/vehicles')
api.add_resource(CreateVehicleResource, '/api/v1/provider/vehicles')
api.add_resource(ProviderVehicleResource, '/api/v1/provider/vehicles/<int:vehicle_id>')

# Passenger route endpoints
api.add_resource(RouteSearchResource, "/api/v1/routes/search")
api.add_resource(RouteResource, "/api/v1/routes/<int:route_id>")

# Passenger stops endpoint
api.add_resource(StopsResource, "/api/v1/stops")

# Passenger trip endpoints
api.add_resource(AvailableTripsResource, "/api/v1/trips")
api.add_resource(TripResource, "/api/v1/trips/<int:trip_id>")
api.add_resource(TripAvailabilityResource, "/api/v1/trips/<int:trip_id>/availability")

# Passenger booking endpoints 
api.add_resource(BookingResource, "/api/v1/bookings")
api.add_resource(MyBookingsResource, "/api/v1/me/bookings")
api.add_resource(BookingDetailResource, "/api/v1/bookings/<int:booking_id>")
api.add_resource(CancelBookingResource, "/api/v1/bookings/<int:booking_id>/cancel")

if __name__ == '__main__':
    app.run(debug=True)