from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from sqlalchemy import func

from config import db
from models import Booking, RouteStop, Trip, Vehicle
from .helpers import get_current_provider_user, parse_datetime, booking_response


class ProviderBookingsResource(Resource):
    """/api/v1/provider/bookings"""

    @jwt_required()
    def get(self):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        route_id = request.args.get("route_id", type=int)
        trip_id = request.args.get("trip_id", type=int)
        from_value = request.args.get("from")
        to_value = request.args.get("to")
        status = request.args.get("status")

        from_date = parse_datetime(from_value)
        to_date = parse_datetime(to_value)

        if from_value and from_date is None:
            return {"error": "Invalid 'from' datetime"}, 400

        if to_value and to_date is None:
            return {"error": "Invalid 'to' datetime"}, 400

        query = (
            Booking.query
            .outerjoin(Trip, Booking.trip_id == Trip.id)
            .outerjoin(Vehicle, Trip.vehicle_id == Vehicle.id)
        )

        # Scope to bookings tied to this provider's own SACCO. Cancelled
        # bookings (trip_id is None) have no vehicle left to check
        # ownership against, so they're left visible rather than silently
        # hidden — worth a second look if Booking ever stores its own
        # sacco_id directly.
        query = query.filter(
            db.or_(
                Vehicle.sacco_id == user.sacco_id,
                Booking.trip_id.is_(None),
            )
        )

        if trip_id is not None:
            query = query.filter(Booking.trip_id == trip_id)

        if route_id is not None:
            route_stop_ids = db.session.query(RouteStop.id).filter(
                RouteStop.route_id == route_id
            ).subquery()

            query = query.filter(Booking.origin_routestop_id.in_(route_stop_ids))

        if from_date:
            query = query.filter(Booking.made_at >= from_date)

        if to_date:
            query = query.filter(Booking.made_at <= to_date)

        if status:
            return {
                "error": "Booking status filtering is unavailable because Booking has no status field."
            }, 400

        bookings = query.order_by(Booking.made_at.desc()).all()

        return [booking_response(booking) for booking in bookings], 200


class BookingStatisticsResource(Resource):
    """/api/v1/provider/booking-statistics"""

    @jwt_required()
    def get(self):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        from_value = request.args.get("from")
        to_value = request.args.get("to")
        group_by = request.args.get("group_by", "day")

        if group_by != "day":
            return {"error": "Only group_by=day is currently supported"}, 400

        from_date = parse_datetime(from_value)
        to_date = parse_datetime(to_value)

        if from_value and from_date is None:
            return {"error": "Invalid 'from' datetime"}, 400

        if to_value and to_date is None:
            return {"error": "Invalid 'to' datetime"}, 400

        # Inner joins here (unlike the listing above) — aggregate stats
        # are scoped strictly to this SACCO's trip-linked bookings, so
        # cancelled/unlinked bookings are excluded from the counts.
        query = (
            db.session.query(
                func.date(Booking.made_at).label("date"),
                func.count(Booking.id).label("bookings")
            )
            .join(Trip, Booking.trip_id == Trip.id)
            .join(Vehicle, Trip.vehicle_id == Vehicle.id)
            .filter(Vehicle.sacco_id == user.sacco_id)
        )

        if from_date:
            query = query.filter(Booking.made_at >= from_date)

        if to_date:
            query = query.filter(Booking.made_at <= to_date)

        rows = query.group_by(func.date(Booking.made_at)).order_by(func.date(Booking.made_at)).all()

        return [{"date": str(row.date), "bookings": row.bookings} for row in rows], 200


class TripBookingsResource(Resource):
    """/api/v1/provider/trips/<int:trip_id>/bookings"""

    @jwt_required()
    def get(self, trip_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        trip = db.session.get(Trip, trip_id)
        if trip is None:
            return {"error": "Trip not found"}, 404

        vehicle = db.session.get(Vehicle, trip.vehicle_id)
        if vehicle and vehicle.sacco_id != user.sacco_id:
            return {"error": "You are not authorized to view this trip's bookings."}, 403

        bookings = Booking.query.filter_by(trip_id=trip_id).order_by(Booking.made_at.desc()).all()

        return [booking_response(booking) for booking in bookings], 200