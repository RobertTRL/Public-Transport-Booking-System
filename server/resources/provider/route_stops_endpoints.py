from flask import request
from flask_jwt_extended import jwt_required
from flask_restful import Resource
from marshmallow import ValidationError

from config import db
from models import Route, RouteStop, Stop
from schemas import RouteStopDetailSchema, RouteStopUpdateSchema
from .helpers import get_current_provider_user

route_stop_detail_schema = RouteStopDetailSchema()
route_stop_update_schema = RouteStopUpdateSchema()


class ProviderRouteStopsResource(Resource):
    """/api/v1/provider/routes/<int:route_id>/stops"""

    @jwt_required()
    def get(self, route_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        route = db.session.get(Route, route_id)
        if not route:
            return {'error': 'Route not found'}, 404

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 5, type=int)

        pagination = (
            RouteStop.query
            .filter_by(route_id=route_id)
            .order_by(RouteStop.sequence.asc())
            .paginate(
                page=page,
                per_page=per_page,
                error_out=False
            )
        )

        route_stops = pagination.items

        return {
            'page': page,
            'per_page': per_page,
            'total': pagination.total,
            'total_pages': pagination.pages,
            'items': [
                {
                    'id': rs.id,
                    'stop_id': rs.stop_id,
                    'sequence': rs.sequence,
                    'name': rs.stop.name if rs.stop else None,
                    'latitude': rs.stop.latitude if rs.stop else None,
                    'longitude': rs.stop.longitude if rs.stop else None
                }
                for rs in route_stops
            ]
        }, 200

    @jwt_required()
    def post(self, route_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        route = db.session.get(Route, route_id)
        if not route:
            return {'error': 'Route not found'}, 404

        data = request.get_json() or {}
        stop_id = data.get('stop_id')
        if not stop_id:
            return {'error': 'stop_id is required'}, 400

        stop = db.session.get(Stop, stop_id)
        if not stop:
            return {'error': 'Stop not found'}, 404

        existing_route_stop = RouteStop.query.filter_by(route_id=route.id, stop_id=stop.id).first()
        if existing_route_stop:
            return {'error': f"Stop '{stop.name}' is already attached to this route"}, 409

        if 'sequence' in data and data['sequence'] is not None:
            sequence = int(data['sequence'])
            conflicting_stops = RouteStop.query.filter(RouteStop.route_id == route.id, RouteStop.sequence >= sequence).all()
            for cs in conflicting_stops:
                cs.sequence += 1
        else:
            max_seq = db.session.query(db.func.max(RouteStop.sequence)).filter_by(route_id=route.id).scalar()
            sequence = (max_seq or 0) + 1

        route_stop = RouteStop(route_id=route.id, stop_id=stop.id, sequence=sequence)
        db.session.add(route_stop)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {'error': 'Unable to add stop to route.'}, 400

        return {
            'id': route_stop.id,
            'route_id': route_stop.route_id,
            'stop_id': route_stop.stop_id,
            'sequence': route_stop.sequence,
            'name': stop.name,
            'latitude': stop.latitude,
            'longitude': stop.longitude
        }, 201

    @jwt_required()
    def put(self, route_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        route = db.session.get(Route, route_id)
        if not route:
            return {'error': 'Route not found'}, 404

        data = request.get_json() or {}
        stops_input = data.get('stops')
        if not isinstance(stops_input, list):
            return {'error': "'stops' must be a list of stop objects"}, 400

        parsed_stops = []
        seen_stop_ids = set()
        for idx, item in enumerate(stops_input, start=1):
            stop_id = item.get('stop_id') if isinstance(item, dict) else item
            sequence = item.get('sequence', idx) if isinstance(item, dict) else idx
            if not stop_id:
                return {'error': f"Missing stop_id at index {idx}"}, 400
            if stop_id in seen_stop_ids:
                return {'error': f"Duplicate stop_id '{stop_id}' provided in payload"}, 400
            seen_stop_ids.add(stop_id)
            stop = db.session.get(Stop, stop_id)
            if not stop:
                return {'error': f"Stop with id '{stop_id}' does not exist"}, 404
            parsed_stops.append((stop, sequence))

        RouteStop.query.filter_by(route_id=route.id).delete()

        created_stops = []
        for stop, sequence in parsed_stops:
            new_rs = RouteStop(route_id=route.id, stop_id=stop.id, sequence=sequence)
            db.session.add(new_rs)
            created_stops.append({
                'stop_id': stop.id,
                'sequence': sequence,
                'name': stop.name,
                'latitude': stop.latitude,
                'longitude': stop.longitude
            })

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {'error': 'Unable to replace route stops.'}, 400

        return created_stops, 200


class UpdateRouteStopResource(Resource):
    """/api/v1/provider/routes/<int:route_id>/stops/<int:stop_id>"""

    @jwt_required()
    def patch(self, route_id, stop_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        route_stop = RouteStop.query.filter_by(route_id=route_id, stop_id=stop_id).first()
        if not route_stop:
            return {'error': 'Route stop not found.'}, 404

        data = request.get_json()
        if not data:
            return {'error': 'Request body is required.'}, 400

        try:
            validated_data = route_stop_update_schema.load(data)
        except ValidationError as err:
            return {'errors': err.messages}, 400

        route_stop.sequence = validated_data['sequence']

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {'error': 'Unable to update route stop.'}, 400

        return route_stop_detail_schema.dump(route_stop), 200


class DeleteRouteStopResource(Resource):
    """/api/v1/provider/routes/<int:route_id>/stops/<int:stop_id>"""

    @jwt_required()
    def delete(self, route_id, stop_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        route_stop = RouteStop.query.filter_by(route_id=route_id, stop_id=stop_id).first()
        if not route_stop:
            return {'error': 'Route stop not found.'}, 404

        try:
            db.session.delete(route_stop)
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {'error': 'Unable to delete route stop.'}, 400

        return {'message': 'Route stop deleted successfully.'}, 200