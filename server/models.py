from config import db


class Route(db.Model):
    __tablename__ = 'routes'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    color = db.Column(db.String, unique=True, nullable=False)

    route_stops = db.relationship(
        'RouteStop',
        backref='route',
        order_by='RouteStop.sequence',
        cascade='all, delete-orphan'
    )


class Stop(db.Model):
    __tablename__ = 'stops'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)

    route_stops = db.relationship('RouteStop', backref='stop')


class RouteStop(db.Model):
    __tablename__ = 'route_stops'

    id = db.Column(db.Integer, primary_key=True)

    route_id = db.Column(
        db.Integer,
        db.ForeignKey('routes.id'),
        nullable=False
    )

    stop_id = db.Column(
        db.Integer,
        db.ForeignKey('stops.id'),
        nullable=False
    )

    sequence = db.Column(db.Integer, nullable=False)

    __table_args__ = (
        db.UniqueConstraint(
            'route_id', 'sequence',
            name='uq_route_stops_route_sequence'
        ),
        db.UniqueConstraint(
            'route_id', 'stop_id',
            name='uq_route_stops_route_stop'
        ),
    )


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

    capacity = db.Column(db.Integer, nullable=False)
    is_active = db.Column(db.Boolean, nullable=False, default=True)

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

    origin_routestop_id = db.Column(
        db.Integer,
        db.ForeignKey('route_stops.id'),
        nullable=False
    )

    destination_routestop_id = db.Column(
        db.Integer,
        db.ForeignKey('route_stops.id'),
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

    status = db.Column(db.String, nullable=False, default='scheduled')

    origin_routestop = db.relationship(
        'RouteStop',
        foreign_keys=[origin_routestop_id],
        backref='origin_trips'
    )

    destination_routestop = db.relationship(
        'RouteStop',
        foreign_keys=[destination_routestop_id],
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
        nullable=True
    )

    origin_routestop_id = db.Column(
        db.Integer,
        db.ForeignKey('route_stops.id'),
        nullable=False
    )

    destination_routestop_id = db.Column(
        db.Integer,
        db.ForeignKey('route_stops.id'),
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

    origin_routestop = db.relationship(
        'RouteStop',
        foreign_keys=[origin_routestop_id],
        backref='booking_origins'
    )

    destination_routestop = db.relationship(
        'RouteStop',
        foreign_keys=[destination_routestop_id],
        backref='booking_destinations'
    )