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
POST	            /api/v1/auth/passengers/register	                                    register_passenger()
POST	            /api/v1/auth/providers/register	                                        register_provider()
POST	            /api/v1/auth/passenger/login	                                        login_passenger()
POST	            /api/v1/auth/provider/login	                                            login_provider()
GET	                /api/v1/stops	                                                        search_stops()
GET	                /api/v1/routes/search?origin_id=&destination_id=	                    search_routes()
GET	                /api/v1/routes/<int:route_id>	                                        get_route()
GET	                /api/v1/trips?origin_id=&destination_id=&date=	                        search_available_trips()
GET	                /api/v1/trips/<int:trip_id>	                                            get_trip()
GET	                /api/v1/trips/<int:trip_id>/availability?origin_id=&destination_id=	    get_trip_availability()
POST	            /api/v1/bookings	                                                    create_booking()
GET	                /api/v1/me/bookings	                                                    get_my_bookings()
GET	                /api/v1/bookings/<int:booking_id>	                                    get_booking()
PATCH	            /api/v1/bookings/<int:booking_id>/cancel	                            cancel_booking()
GET	                /api/v1/provider/dashboard	                                            get_provider_dashboard()
GET, POST	        /api/v1/provider/routes	                                                list_provider_routes(), create_route()
GET, PATCH, DELETE	/api/v1/provider/routes/<int:route_id>	                                get_provider_route(), update_provider_route(), deactivate_route()
POST	            /api/v1/provider/routes/<int:route_id>/stops	                        add_stop()
PATCH, DELETE	    /api/v1/provider/routes/<int:route_id>/stops/<int:stop_id>	            update_stop(), remove_stop()
GET, POST	        /api/v1/provider/vehicles	                                            list_vehicles(), create_vehicle()
PATCH, DELETE	    /api/v1/provider/vehicles/<int:vehicle_id>	                            update_vehicle(), deactivate_vehicle()
GET, POST	        /api/v1/provider/routes/<int:route_id>/trips	                        list_route_trips(), create_trip()
PATCH	            /api/v1/provider/trips/<int:trip_id>	                                update_trip()
GET	                /api/v1/provider/trips/<int:trip_id>/bookings	                        get_trip_bookings()

"""
db.init_app(app)

if __name__ == '__main__':
    app.run(debug=True)