from flask import request
from flask_restful import Resource
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity
from config import db
from schemas import RouteSchema
from provider.dashboard_endpoints import get_current_provider_user

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

route_schema = RouteSchema()
routes_schema = RouteSchema(many=True)

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
    
class ListCreateRouteResource(Resource):
    @jwt_required()
    def get(self):
        routes = Route.query.all()
        return routes_schema.dump(routes), 200

    @jwt_required()
    def post(self):
        data = request.get_json()

        if not data:
            return {
                "error": "Request body is required."
            }, 400

        try:
            validated_data = route_schema.load(data)
        except ValidationError as err:
            return {
                "errors": err.messages
            }, 400

        route = Route(**validated_data)
        db.session.add(route)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {
                "error": "Unable to create route. Color may already be in use."
            }, 400

        return route_schema.dump(route), 201


class UpdateRouteResource(Resource):
    """/api/v1/provider/routes/<int:route_id>"""
    @jwt_required()
    def patch(self, route_id):
        route = Route.query.get(route_id)

        if not route:
            return {
                "error": "Route not found."
            }, 404

        data = request.get_json()

        if not data:
            return {
                "error": "Request body is required."
            }, 400

        try:
            validated_data = route_schema.load(data, partial=True)
        except ValidationError as err:
            return {
                "errors": err.messages
            }, 400

        for key, value in validated_data.items():
            setattr(route, key, value)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {
                "error": "Unable to update route."
            }, 400

        return route_schema.dump(route), 200

class DeleteRouteResource(Resource):
    """/api/v1/provider/routes/<int:route_id>"""
    @jwt_required()
    def delete(self, route_id):
        route = Route.query.get(route_id)

        if not route:
            return {
                "error": "Route not found."
            }, 404

        try:
            db.session.delete(route)
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {
                "error": "Unable to delete route."
            }, 400

        return {
            "message": "Route deleted successfully."
        }, 200