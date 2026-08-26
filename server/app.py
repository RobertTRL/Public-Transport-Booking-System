from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from config import db, app, api
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


def get_current_provider_user():
    identity = get_jwt_identity()
    if not identity:
        return None
    return User.query.get(identity)


class ProviderDashboardResource(Resource):
    @jwt_required()
    def get(self):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        sacco = Sacco.query.get(user.sacco_id) if user.sacco_id else None
        if not sacco:
            return {'error': 'No SACCO associated with this provider'}, 404

        vehicles = Vehicle.query.filter_by(sacco_id=sacco.id).all()
        vehicle_ids = [v.id for v in vehicles]
        active_vehicles_count = sum(1 for v in vehicles if v.is_active)

        trips = Trip.query.filter(Trip.vehicle_id.in_(vehicle_ids)).all() if vehicle_ids else []
        trip_ids = [t.id for t in trips]

        scheduled_trips = sum(1 for t in trips if t.status == 'scheduled')
        in_progress_trips = sum(1 for t in trips if t.status == 'in_progress')
        completed_trips = sum(1 for t in trips if t.status == 'completed')
        cancelled_trips = sum(1 for t in trips if t.status == 'cancelled')

        total_bookings = Booking.query.filter(Booking.trip_id.in_(trip_ids)).count() if trip_ids else 0
        total_routes = Route.query.count()

        metrics = {
            'total_vehicles': len(vehicles),
            'active_vehicles': active_vehicles_count,
            'total_routes': total_routes,
            'total_trips': len(trips),
            'scheduled_trips': scheduled_trips,
            'in_progress_trips': in_progress_trips,
            'completed_trips': completed_trips,
            'cancelled_trips': cancelled_trips,
            'total_bookings': total_bookings
        }

        recent_trips_data = [
            {
                'id': t.id,
                'vehicle_id': t.vehicle_id,
                'status': t.status,
                'start_time': t.start_time.isoformat() if t.start_time else None,
                'stop_time': t.stop_time.isoformat() if t.stop_time else None,
                'origin_routestop_id': t.origin_routestop_id,
                'destination_routestop_id': t.destination_routestop_id
            }
            for t in sorted(trips, key=lambda x: x.id, reverse=True)[:5]
        ]

        recent_bookings = Booking.query.filter(Booking.trip_id.in_(trip_ids)).order_by(Booking.id.desc()).limit(5).all() if trip_ids else []
        recent_bookings_data = [
            {
                'id': b.id,
                'user_id': b.user_id,
                'trip_id': b.trip_id,
                'made_at': b.made_at.isoformat() if b.made_at else None
            }
            for b in recent_bookings
        ]

        return {
            'provider': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'sacco': {
                    'id': sacco.id,
                    'name': sacco.name,
                    'contact': sacco.contact,
                    'address': sacco.address
                }
            },
            'metrics': metrics,
            'recent_trips': recent_trips_data,
            'recent_bookings': recent_bookings_data
        }, 200


class ProviderRoutesResource(Resource):
    @jwt_required()
    def get(self):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        query = Route.query
        search_term = request.args.get('q')
        color_filter = request.args.get('color')

        if search_term:
            query = query.filter(Route.name.ilike(f"%{search_term}%"))
        if color_filter:
            query = query.filter_by(color=color_filter)

        routes = query.all()

        result = []
        for r in routes:
            ordered_stops = sorted(r.route_stops, key=lambda s: s.sequence)
            result.append({
                'id': r.id,
                'name': r.name,
                'color': r.color,
                'total_stops': len(ordered_stops),
                'stops': [
                    {
                        'id': rs.id,
                        'stop_id': rs.stop_id,
                        'sequence': rs.sequence,
                        'name': rs.stop.name if rs.stop else None,
                        'latitude': rs.stop.latitude if rs.stop else None,
                        'longitude': rs.stop.longitude if rs.stop else None
                    }
                    for rs in ordered_stops
                ]
            })

        return result, 200

    @jwt_required()
    def post(self):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        data = request.get_json() or {}
        name = data.get('name')
        color = data.get('color')

        if not name or not color:
            return {'error': 'Route name and color are required'}, 400

        name = name.strip()
        color = color.strip()

        if Route.query.filter_by(color=color).first():
            return {'error': f"A route with color '{color}' already exists"}, 409

        if Route.query.filter_by(name=name).first():
            return {'error': f"A route with name '{name}' already exists"}, 409

        new_route = Route(name=name, color=color)
        db.session.add(new_route)
        db.session.flush()

        stops_input = data.get('stops', [])
        created_stops = []
        if isinstance(stops_input, list) and stops_input:
            for idx, item in enumerate(stops_input, start=1):
                stop_id = item.get('stop_id') if isinstance(item, dict) else item
                sequence = item.get('sequence', idx) if isinstance(item, dict) else idx
                stop = Stop.query.get(stop_id)
                if stop:
                    route_stop = RouteStop(route_id=new_route.id, stop_id=stop.id, sequence=sequence)
                    db.session.add(route_stop)
                    created_stops.append({
                        'stop_id': stop.id,
                        'sequence': sequence,
                        'name': stop.name,
                        'latitude': stop.latitude,
                        'longitude': stop.longitude
                    })

        db.session.commit()

        return {
            'id': new_route.id,
            'name': new_route.name,
            'color': new_route.color,
            'total_stops': len(created_stops),
            'stops': created_stops
        }, 201


class ProviderRouteDetailResource(Resource):
    @jwt_required()
    def get(self, route_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        route = Route.query.get(route_id)
        if not route:
            return {'error': 'Route not found'}, 404

        ordered_stops = sorted(route.route_stops, key=lambda s: s.sequence)
        return {
            'id': route.id,
            'name': route.name,
            'color': route.color,
            'total_stops': len(ordered_stops),
            'stops': [
                {
                    'id': rs.id,
                    'stop_id': rs.stop_id,
                    'sequence': rs.sequence,
                    'name': rs.stop.name if rs.stop else None,
                    'latitude': rs.stop.latitude if rs.stop else None,
                    'longitude': rs.stop.longitude if rs.stop else None
                }
                for rs in ordered_stops
            ]
        }, 200

    @jwt_required()
    def patch(self, route_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        route = Route.query.get(route_id)
        if not route:
            return {'error': 'Route not found'}, 404

        data = request.get_json() or {}
        if 'name' in data and data['name']:
            new_name = data['name'].strip()
            existing_name = Route.query.filter(Route.name == new_name, Route.id != route_id).first()
            if existing_name:
                return {'error': f"A route with name '{new_name}' already exists"}, 409
            route.name = new_name

        if 'color' in data and data['color']:
            new_color = data['color'].strip()
            existing_color = Route.query.filter(Route.color == new_color, Route.id != route_id).first()
            if existing_color:
                return {'error': f"A route with color '{new_color}' already exists"}, 409
            route.color = new_color

        db.session.commit()


        return {
            'id': route.id,
            'name': route.name,
            'color': route.color,
            'total_stops': len(route.route_stops)
        }, 200

    @jwt_required()
    def delete(self, route_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        route = Route.query.get(route_id)
        if not route:
            return {'error': 'Route not found'}, 404

        route_stop_ids = [rs.id for rs in route.route_stops]
        if route_stop_ids:
            active_trips = Trip.query.filter(
                (Trip.origin_routestop_id.in_(route_stop_ids)) | (Trip.destination_routestop_id.in_(route_stop_ids)),
                Trip.status.in_(['scheduled', 'in_progress'])
            ).first()
            if active_trips:
                return {'error': 'Cannot delete route with active scheduled or in-progress trips'}, 409

        route_name = route.name
        db.session.delete(route)
        db.session.commit()


        return {'message': f"Route '{route_name}' successfully deleted"}, 200












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
api.add_resource(ProviderDashboardResource, '/api/v1/provider/dashboard')
api.add_resource(ProviderRoutesResource, '/api/v1/provider/routes')
db.init_app(app)



if __name__ == '__main__':
    app.run(debug=True)