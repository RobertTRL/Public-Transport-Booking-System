try:
    from resources.passenger import (
        booking_endpoints,
        route_endpoints,
        stops_endpoints,
        trip_endpoints,
    )
except ImportError:
    try:
        from passenger import (
            booking_endpoints,
            route_endpoints,
            stops_endpoints,
            trip_endpoints,
        )
    except ImportError:
        from server.resources.passenger import (
            booking_endpoints,
            route_endpoints,
            stops_endpoints,
            trip_endpoints,
        )
