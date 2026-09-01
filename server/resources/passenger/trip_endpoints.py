from datetime import date, datetime, time

from flask import request
from flask_restful import Resource
from sqlalchemy.orm import aliased, joinedload

from config import db
from models import RouteStop, Trip
from schemas import TripDetailSchema

from .helpers import (
    get_route_stop_pair,
    get_trip_availability,
    trip_contains_segment,
    valid_route_segment,
)


class AvailableTripsResource(Resource):
    """Return trips available for a requested route segment and date."""

    def get(self):
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 5, type=int)

        origin_routestop_id = request.args.get(
            "origin_routestop_id",
            type=int,
        )
        destination_routestop_id = request.args.get(
            "destination_routestop_id",
            type=int,
        )
        trip_date = request.args.get("date")

        if origin_routestop_id is None or destination_routestop_id is None:
            return {
                "error": (
                    "origin_routestop_id and destination_routestop_id "
                    "are required."
                )
            }, 400

        if not trip_date:
            return {
                "error": "date is required."
            }, 400

        try:
            requested_date = date.fromisoformat(trip_date)
        except ValueError:
            return {
                "error": "date must use YYYY-MM-DD format."
            }, 400

        origin, destination = get_route_stop_pair(
            origin_routestop_id,
            destination_routestop_id,
        )

        if not origin or not destination:
            return {
                "error": "One or both route stops could not be found."
            }, 404

        if not valid_route_segment(origin, destination):
            return {
                "error": (
                    "Origin and destination must belong to the same "
                    "route, with origin before destination."
                )
            }, 400

        trip_origin_rs = aliased(RouteStop)
        trip_destination_rs = aliased(RouteStop)

        day_start = datetime.combine(requested_date, time.min)
        day_end = datetime.combine(requested_date, time.max)

        pagination = (
            Trip.query
            .join(
                trip_origin_rs,
                Trip.origin_routestop_id == trip_origin_rs.id,
            )
            .join(
                trip_destination_rs,
                Trip.destination_routestop_id == trip_destination_rs.id,
            )
            .options(
                joinedload(Trip.origin_routestop).joinedload(RouteStop.stop),
                joinedload(Trip.destination_routestop).joinedload(
                    RouteStop.stop
                ),
                joinedload(Trip.vehicle),
            )
            .filter(
                trip_origin_rs.route_id == origin.route_id,
                trip_origin_rs.sequence <= origin.sequence,
                trip_destination_rs.sequence >= destination.sequence,
                Trip.status == "scheduled",
                Trip.start_time >= day_start,
                Trip.start_time <= day_end,
            )
            .order_by(Trip.start_time.asc())
            .paginate(
                page=page,
                per_page=per_page,
                error_out=False,
            )
        )

        trips = pagination.items

        return {
            "page": page,
            "per_page": per_page,
            "total": pagination.total,
            "total_pages": pagination.pages,
            "items": TripDetailSchema(many=True).dump(trips),
        }, 200


class TripResource(Resource):
    """Return details for a single trip."""

    def get(self, trip_id):
        trip = db.session.get(Trip, trip_id)

        if not trip:
            return {
                "error": "Trip not found."
            }, 404

        return TripDetailSchema().dump(trip), 200


class TripAvailabilityResource(Resource):
    """Return seat availability for a trip segment."""

    def get(self, trip_id):
        origin_routestop_id = request.args.get(
            "origin_routestop_id",
            type=int,
        )
        destination_routestop_id = request.args.get(
            "destination_routestop_id",
            type=int,
        )

        if origin_routestop_id is None or destination_routestop_id is None:
            return {
                "error": (
                    "origin_routestop_id and destination_routestop_id "
                    "are required."
                )
            }, 400

        trip = db.session.get(Trip, trip_id)

        if not trip:
            return {
                "error": "Trip not found."
            }, 404

        origin, destination = get_route_stop_pair(
            origin_routestop_id,
            destination_routestop_id,
        )

        if not origin or not destination:
            return {
                "error": "One or both route stops could not be found."
            }, 404

        if not trip_contains_segment(trip, origin, destination):
            return {
                "error": (
                    "The requested segment is not valid for this trip."
                )
            }, 400

        return get_trip_availability(
            trip,
            origin,
            destination,
        ), 200
