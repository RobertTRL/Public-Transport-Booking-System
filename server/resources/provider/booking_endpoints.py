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


class ProviderRouteStopsResource(Resource):
    @jwt_required()
    def get(self, route_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        route = Route.query.get(route_id)
        if not route:
            return {'error': 'Route not found'}, 404

        route_stops = RouteStop.query.filter_by(route_id=route_id).order_by(RouteStop.sequence.asc()).all()
        return [
            {
                'id': rs.id,
                'stop_id': rs.stop_id,
                'sequence': rs.sequence,
                'name': rs.stop.name if rs.stop else None,
                'latitude': rs.stop.latitude if rs.stop else None,
                'longitude': rs.stop.longitude if rs.stop else None
            }
            for rs in route_stops
        ], 200

    @jwt_required()
    def post(self, route_id):
        user = get_current_provider_user()
        if not user:
            return {'error': 'Unauthorized provider access'}, 401

        route = Route.query.get(route_id)
        if not route:
            return {'error': 'Route not found'}, 404

        data = request.get_json() or {}
        stop_id = data.get('stop_id')
        if not stop_id:
            return {'error': 'stop_id is required'}, 400

        stop = Stop.query.get(stop_id)
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
        db.session.commit()


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

        route = Route.query.get(route_id)
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
            stop = Stop.query.get(stop_id)
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

        db.session.commit()
        return created_stops, 200


api.add_resource(ProviderDashboardResource, '/api/v1/provider/dashboard')
api.add_resource(ProviderRoutesResource, '/api/v1/provider/routes')
api.add_resource(ProviderRouteDetailResource, '/api/v1/provider/routes/<int:route_id>')
api.add_resource(ProviderRouteStopsResource, '/api/v1/provider/routes/<int:route_id>/stops')
db.init_app(app)





if __name__ == '__main__':
    app.run(debug=True)