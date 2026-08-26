from flask import Flask
from flask_migrate import Migrate

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

"""
# IAM endpoints for passengers and providers
# Robert
POST	            /api/v1/auth/passenger/register	                                                        register_passenger() ✓
POST	            /api/v1/auth/provider/register	                                                        register_provider() ✓
POST	            /api/v1/auth/passenger/login	                                                        login_passenger() ✓
POST	            /api/v1/auth/provider/login	                                                            login_provider() ✓

# Passenger endpoints
# Norman
GET	                /api/v1/stops	                                                                        get_stops() ✓
GET	                /api/v1/routes/search?origin_stop_id=&destination_stop_id=	                            search_routes() ✓
GET	                /api/v1/trips?origin_routestop_id=&destination_routestop_id=&date=	                    search_available_trips() ✓
GET	                /api/v1/trips/<int:trip_id>	                                                            get_trip() ✓
GET	                /api/v1/trips/<int:trip_id>/availability?origin_routestop_id=&destination_routestop_id=	get_trip_availability() ✓
POST	            /api/v1/bookings	                                                                    create_booking() ✓
GET	                /api/v1/me/bookings	                                                                    get_my_bookings() ✓
GET	                /api/v1/bookings/<int:booking_id>	                                                    get_booking() ✓
PATCH	            /api/v1/bookings/<int:booking_id>/cancel	                                            cancel_booking() ✓
GET	                /api/v1/routes/<int:route_id>	                                                        get_route() 

# Provider endpoints
# Vincent
GET	                /api/v1/provider/dashboard	                                                            get_dashboard_summary() ✓
GET	                /api/v1/provider/routes	                                                                list_provider_routes() ✓
POST	            /api/v1/provider/routes	                                                                create_route() ✓
GET 	            /api/v1/provider/routes/<int:route_id>	                                                get_provider_route() ✓
PATCH               /api/v1/provider/routes/<int:route_id>                                                  update_provider_route() ✓
DELETE              /api/v1/provider/routes/<int:route_id>                                                  deactivate_route() ✓
POST	            /api/v1/provider/routes/<int:route_id>/stops	                                        add_route_stop() ✓
PUT                 /api/v1/provider/routes/<int:route_id>/stops                                            replace_route_stops() ✓
GET                 /api/v1/provider/routes/<int:route_id>/stops                                            list_route_stops() ✓

# Marlene
PATCH	            /api/v1/provider/routes/<int:route_id>/stops/<int:stop_id>	                            update_route_stop() ✓
DELETE              /api/v1/provider/routes/<int:route_id>/stops/<int:stop_id>	                            remove_route_stop() ✓
GET	                /api/v1/provider/vehicles	                                                            list_vehicles() ✓
POST                /api/v1/stops	                                                                        create_stop() ✓
PATCH               /api/v1/stops/<int:stop_id>	                                                            update_stop() ✓
DELETE              /api/v1/stops/<int:stop_id>	                                                            delete_stop() ✓
GET                 /api/v1/provider/vehicles?route_id=&q=                                                  list_provider_vehicles() ✓
POST	            /api/v1/provider/vehicles	                                                            create_vehicle() ✓

# Stephen
GET                 /api/v1/provider/vehicles/<int:vehicle_id>	                                            get_vehicle() ✓
PATCH	            /api/v1/provider/vehicles/<int:vehicle_id>	                                            update_vehicle() ✓
DELETE              /api/v1/provider/vehicles/<int:vehicle_id>	                                            deactivate_vehicle() ✓
GET	                /api/v1/provider/routes/<int:route_id>/trips?from=&to=	                                list_route_trips() ✓
POST                /api/v1/provider/routes/<int:route_id>/trips	                                        create_trip() ✓
PATCH	            /api/v1/provider/trips/<int:trip_id>	                                                update_trip() ✓
PATCH               /api/v1/provider/trips/<int:trip_id>/cancel	                                            cancel_trip() ✓
GET	                /api/v1/provider/bookings?route_id=&trip_id=&from=&to=&status=                          list_provider_bookings() ✓   
GET                 /api/v1/provider/booking-statistics?from=&to=&group_by=day                              get_booking_statistics() ✓
GET	                /api/v1/provider/trips/<int:trip_id>/bookings	                                        get_trip_bookings() ✓

# 41 total routes
"""
db.init_app(app)

if __name__ == '__main__':
    app.run(debug=True)