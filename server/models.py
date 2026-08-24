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

class Manager(db.Model):

    __tablename__ = 'managers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    operator_id = db.Column(
        db.Integer,
        db.ForeignKey('operators.id'),
        nullable=False
    )
    phone_number = db.Column(db.String)
    role = db.Column(db.String)

    operator = db.relationship('Operator', backref='managers')

class Seat(db.Model):

    __tablename__ = 'seats'

    id = db.Column(db.Integer, primary_key=True)
    seat_number = db.Column(db.Integer, nullable=False)
    vehicle_id = db.Column(
        db.Integer,
        db.ForeignKey('vehicles.id'),
        nullable=False
    )

    vehicle = db.relationship('Vehicle', backref='seats')

    __table_args__ = (
        db.UniqueConstraint(
            'vehicle_id',
            'seat_number',
            name='unique_vehicle_seat'
        ),
    )
class Trip(db.Model):

    __tablename__ = 'trips'

    id = db.Column(db.Integer, primary_key=True)

    origin_id = db.Column(
        db.Integer,
        db.ForeignKey('stops.id'),
        nullable=False
    )

    destination_id = db.Column(
        db.Integer,
        db.ForeignKey('stops.id'),
        nullable=False
    )

    vehicle_id = db.Column(
        db.Integer,
        db.ForeignKey('vehicles.id'),
        nullable=False
    )

    start_time = db.Column(
    db.DateTime,
    nullable=False,
    default=db.func.now()
    )
    stop_time = db.Column(db.DateTime)

    origin = db.relationship(
        'Stop',
        foreign_keys=[origin_id],
        backref='origin_trips'
    )

    destination = db.relationship(
        'Stop',
        foreign_keys=[destination_id],
        backref='destination_trips'
    )

    vehicle = db.relationship(
        'Vehicle',
        backref='trips'
    )

class Booking(db.Model):

    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=False
    )

    seat_id = db.Column(
        db.Integer,
        db.ForeignKey('seats.id'),
        nullable=False
    )

    trip_id = db.Column(
        db.Integer,
        db.ForeignKey('trips.id'),
        nullable=False
    )

    origin_id = db.Column(
        db.Integer,
        db.ForeignKey('stops.id'),
        nullable=False
    )

    destination_id = db.Column(
        db.Integer,
        db.ForeignKey('stops.id'),
        nullable=False
    )
    made_at = db.Column(
    db.DateTime,
    nullable=False,
    default=db.func.now()
    )


  

    user = db.relationship('User', backref='bookings')
    seat = db.relationship('Seat', backref='bookings')
    trip = db.relationship('Trip', backref='bookings')

    origin = db.relationship(
        'Stop',
        foreign_keys=[origin_id],
        backref='booking_origins'
    )

    destination = db.relationship(
        'Stop',
        foreign_keys=[destination_id],
        backref='booking_destinations'
    )

    __table_args__ = (
        db.UniqueConstraint(
            'seat_id',
            'trip_id',
            name='unique_seat_trip_booking'
        ),
    )
class Occupation(db.Model):

    __tablename__ = 'occupations'

    id = db.Column(db.Integer, primary_key=True)

    booking_id = db.Column(
        db.Integer,
        db.ForeignKey('bookings.id'),
        unique=True,
        nullable=False
    )

    made_at = db.Column(
    db.DateTime,
    nullable=False,
    default=db.func.now()
    )

    booking = db.relationship(
        'Booking',
        backref='occupation'
    )