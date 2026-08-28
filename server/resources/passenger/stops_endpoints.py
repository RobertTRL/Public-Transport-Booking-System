from flask import request
from flask_restful import Resource

from config import api
from models import Stop
from schemas import StopSchema

class StopsResource(Resource):
    """List all available passenger boarding stops."""

    def get(self):
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 5, type=int)

        pagination = (
            Stop.query
            .order_by(Stop.name.asc())
            .paginate(page=page, per_page=per_page, error_out=False)
        )

        stops = pagination.items

        return {
            "page": page,
            "per_page": per_page,
            "total": pagination.total,
            "total_pages": pagination.pages,
            "items": StopSchema(many=True).dump(stops),
        }, 200


api.add_resource(
    StopsResource,
    "/api/v1/stops",
)