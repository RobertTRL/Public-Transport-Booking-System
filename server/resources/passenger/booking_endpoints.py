from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource

from config import api, db
from models import Booking, Trip
from schemas import (
    BookingDetailSchema,
    BookingSchema,
)

from .helpers import (
    create_booking,
    get_current_passenger,
    get_route_stop_pair,
    get_trip_availability,
    passenger_has_overlapping_booking,
    trip_contains_segment,
)


class BookingResource(Resource):
    """Create a booking for the authenticated passenger."""

    @jwt_required()
    def post(self):
        passenger = get_current_passenger()

        if not passenger:
            return {
                "error": "Passenger account not found."
            }, 404

        data = request.get_json(silent=True) or {}

        trip_id = data.get("trip_id")
        origin_routestop_id = data.get("origin_routestop_id")
        destination_routestop_id = data.get("destination_routestop_id")

        if (
            trip_id is None
            or origin_routestop_id is None
            or destination_routestop_id is None
        ):
            return {
                "error": (
                    "trip_id, origin_routestop_id and "
                    "destination_routestop_id are required."
                )
            }, 400

        try:
            booking_data = BookingSchema().load(
                {
                    "user_id": passenger.id,
                    "trip_id": trip_id,
                    "origin_routestop_id": origin_routestop_id,
                    "destination_routestop_id": destination_routestop_id,
                }
            )
        except Exception as error:
            return {
                "error": str(error)
            }, 400

        origin, destination = get_route_stop_pair(
            booking_data["origin_routestop_id"],
            booking_data["destination_routestop_id"],
        )

        if not origin or not destination:
            return {
                "error": "One or both route stops could not be found."
            }, 404

        trip = (
            Trip.query
            .filter_by(id=booking_data["trip_id"])
            .with_for_update()
            .first()
        )

        if not trip:
            db.session.rollback()
            return {
                "error": "Trip not found."
            }, 404

        if trip.status != "scheduled":
            db.session.rollback()
            return {
                "error": "Only scheduled trips can be booked."
            }, 409

        if not trip.vehicle or not trip.vehicle.is_active:
            db.session.rollback()
            return {
                "error": "The vehicle assigned to this trip is not active."
            }, 409

        if not trip_contains_segment(trip, origin, destination):
            db.session.rollback()
            return {
                "error": (
                    "The requested booking segment is not valid "
                    "for this trip."
                )
            }, 400

        availability = get_trip_availability(
            trip,
            origin,
            destination,
        )

        if availability["available_seats"] <= 0:
            db.session.rollback()
            return {
                "error": "No seats are available for this trip segment."
            }, 409

        if passenger_has_overlapping_booking(
            passenger,
            trip,
            origin,
            destination,
        ):
            db.session.rollback()
            return {
                "error": (
                    "You already have an active booking that "
                    "overlaps this trip segment."
                )
            }, 409

        booking = create_booking(
            passenger,
            trip,
            origin,
            destination,
        )

        return BookingDetailSchema().dump(booking), 201


class MyBookingsResource(Resource):
    """Return all bookings belonging to the authenticated passenger with pagination."""

    @jwt_required()
    def get(self):
        passenger = get_current_passenger()

        if not passenger:
            return {
                "error": "Passenger account not found."
            }, 404

        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 5, type=int)

        pagination = (
            Booking.query
            .filter_by(user_id=passenger.id)
            .order_by(Booking.made_at.desc())
            .paginate(
                page=page,
                per_page=per_page,
                error_out=False,
            )
        )

        bookings = pagination.items

        return {
            "page": page,
            "per_page": per_page,
            "total": pagination.total,
            "total_pages": pagination.pages,
            "items": BookingDetailSchema(many=True).dump(bookings),
        }, 200


class BookingDetailResource(Resource):
    """Return a specific booking belonging to the passenger."""

    @jwt_required()
    def get(self, booking_id):
        passenger = get_current_passenger()

        if not passenger:
            return {
                "error": "Passenger account not found."
            }, 404

        booking = db.session.get(Booking, booking_id)

        if not booking:
            return {
                "error": "Booking not found."
            }, 404

        if booking.user_id != passenger.id:
            return {
                "error": "You are not authorized to view this booking."
            }, 403

        return BookingDetailSchema().dump(booking), 200


class CancelBookingResource(Resource):
    """Cancel an existing booking belonging to the passenger."""

    @jwt_required()
    def patch(self, booking_id):
        passenger = get_current_passenger()

        if not passenger:
            return {
                "error": "Passenger account not found."
            }, 404

        booking = db.session.get(Booking, booking_id)

        if not booking:
            return {
                "error": "Booking not found."
            }, 404

        if booking.user_id != passenger.id:
            return {
                "error": "You are not authorized to cancel this booking."
            }, 403

        if booking.status == "cancelled":
            return {
                "error": "Booking has already been cancelled."
            }, 409

        booking.status = "cancelled"
        booking.cancelled_at = db.func.now()

        db.session.commit()

        return {
            "message": "Booking cancelled successfully.",
            "booking": BookingDetailSchema().dump(booking),
        }, 200


api.add_resource(
    BookingResource,
    "/api/v1/bookings",
)

api.add_resource(
    MyBookingsResource,
    "/api/v1/me/bookings",
)

api.add_resource(
    BookingDetailResource,
    "/api/v1/bookings/<int:booking_id>",
)

api.add_resource(
    CancelBookingResource,
    "/api/v1/bookings/<int:booking_id>/cancel",
)