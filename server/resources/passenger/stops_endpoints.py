from flask_restful import Resource

from config import api
from models import Stop
from schemas import StopSchema


# =========================================================
# Stop resources
# =========================================================

class StopsResource(Resource):
    """List all available passenger boarding stops."""

    def get(self):
        stops = Stop.query.order_by(Stop.name.asc()).all()

        return StopSchema(many=True).dump(stops), 200