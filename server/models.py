from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData


metadata = MetaData()

db = SQLAlchemy(metadata=metadata)


class Route(db.Model):

    __tablename__ = 'routes'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    color = db.Column(db.String, unique=True, nullable=False)

class Operator(db.Model):

    __tablename__ = 'operators'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    address = db.Column(db.String)
    contact = db.Column(db.String, nullable=False)

class User(db.Model):

    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    phone_number = db.Column(db.String)

class Stop(db.Model):

    __tablename__ = 'stops'

    id = db.Column(db.Integer, primary_key=True)
    route_id = db.Column(db.Integer, db.ForeignKey('routes.id'), nullable=False)
    name = db.Column(db.String, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)

    route = db.relationship('Route', backref='stops')

class Vehicle(db.Model):

    __tablename__ = 'vehicles'

    id = db.Column(db.Integer, primary_key=True)
    number_plate = db.Column(db.String, unique=True, nullable=False)
    route_id = db.Column(db.Integer, db.ForeignKey('routes.id'), nullable=False)
    capacity = db.Column(db.Integer)
    operator_id = db.Column(db.Integer, db.ForeignKey('operators.id'), nullable=False)

    route = db.relationship('Route', backref='vehicles')
    operator = db.relationship('Operator', backref='vehicles')