from flask import Flask
from flask_migrate import Migrate

from models import (
    db,
    User,
    Passenger,
    Route,
    Stop,
    Booking,
    Vehicle,
    Sacco,
    Trip
)

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = \
    'postgresql://postgres:postgres@localhost:5432/transport_booking_db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

migrate = Migrate(app, db)

db.init_app(app)

if __name__ == '__main__':
    app.run(debug=True)