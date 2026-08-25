from config import db


class Route(db.Model):
    __tablename__ = 'routes'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    color = db.Column(db.String, unique=True, nullable=False)


class Stop(db.Model):
    __tablename__ = 'stops'

    id = db.Column(db.Integer, primary_key=True)

    route_id = db.Column(
        db.Integer,
        db.ForeignKey('routes.id'),
        nullable=False
    )

    name = db.Column(db.String, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)

    route = db.relationship('Route', backref='stops')


class Sacco(db.Model):
    __tablename__ = 'saccos'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    contact = db.Column(db.String, nullable=False)
    address = db.Column(db.String)


class Vehicle(db.Model):
    __tablename__ = 'vehicles'

    id = db.Column(db.Integer, primary_key=True)

    sacco_id = db.Column(
        db.Integer,
        db.ForeignKey('saccos.id'),
        nullable=False
    )

    number_plate = db.Column(
        db.String,
        unique=True,
        nullable=False
    )

    capacity = db.Column(db.Integer)

    sacco = db.relationship('Sacco', backref='vehicles')


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)

    sacco_id = db.Column(
        db.Integer,
        db.ForeignKey('saccos.id'),
        nullable=False
    )

    name = db.Column(db.String, unique=True, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    phone_number = db.Column(db.String)
    role = db.Column(db.String, nullable=False)

    sacco = db.relationship('Sacco', backref='users')


class Passenger(db.Model):
    __tablename__ = 'passengers'

    id = db.Column(db.Integer, primary_key=True)

    email = db.Column(
        db.String,
        unique=True,
        nullable=False
    )

    password_hash = db.Column(
        db.String,
        nullable=False
    )

    phone_number = db.Column(db.String)


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

    start_time = db.Column(
        db.DateTime,
        nullable=False,
        default=db.func.now()
    )

    stop_time = db.Column(db.DateTime)

    vehicle_id = db.Column(
        db.Integer,
        db.ForeignKey('vehicles.id'),
        nullable=False
    )

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
        db.ForeignKey('passengers.id'),
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

    user = db.relationship(
        'Passenger',
        backref='bookings'
    )

    trip = db.relationship(
        'Trip',
        backref='bookings'
    )

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