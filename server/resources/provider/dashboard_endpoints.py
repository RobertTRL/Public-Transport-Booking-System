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
