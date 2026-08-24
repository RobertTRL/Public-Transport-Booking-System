from flask import Flask
from flask_migrate import Migrate
from models import db, Route, Operator,User,Stop, Vehicle, Manager, Seat,Trip, Booking, Occupation
from schemas import DriverSchema

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tomashi-logistics.db'

# disable the modification tracking feature of SQLAlchemy to avoid unnecessary overhead
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

migrate = Migrate(app, db)

db.init_app(app)

if __name__ == '__main__':
    app.run(debug=True)  