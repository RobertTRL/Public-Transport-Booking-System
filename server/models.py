from config import db
from werkzeug.security import generate_password_hash, check_password_hash


class Route(db.Model):
    __tablename__ = 'routes'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    color = db.Column(db.String, unique=True, nullable=False)

    route_stops = db.relationship(
        'RouteStop',
        back_populates='route',
        order_by='RouteStop.sequence',
        cascade='all, delete-orphan'
    )


class Stop(db.Model):
    __tablename__ = 'stops'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)

    route_stops = db.relationship('RouteStop', back_populates='stop')


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

    route = db.relationship('Route', back_populates='route_stops')
    stop = db.relationship('Stop', back_populates='route_stops')

    origin_trips = db.relationship(
        'Trip',
        foreign_keys='Trip.origin_routestop_id',
        back_populates='origin_routestop'
    )

    destination_trips = db.relationship(
        'Trip',
        foreign_keys='Trip.destination_routestop_id',
        back_populates='destination_routestop'
    )

    booking_origins = db.relationship(
        'Booking',
        foreign_keys='Booking.origin_routestop_id',
        back_populates='origin_routestop'
    )

    booking_destinations = db.relationship(
        'Booking',
        foreign_keys='Booking.destination_routestop_id',
        back_populates='destination_routestop'
    )


class Sacco(db.Model):
    __tablename__ = 'saccos'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    contact = db.Column(db.String, nullable=False)
    address = db.Column(db.String)

    vehicles = db.relationship('Vehicle', back_populates='sacco')
    users = db.relationship('User', back_populates='sacco')


class Vehicle(db.Model):
    __tablename__ = 'vehicles'

    id = db.Column(db.Integer, primary_key=True)

    # Matches the DBML Table definition (`sacco_id integer [not null]`).
    # schemas.py previously treated this as optional based on a
    # nonstandard "?" annotation on the DBML Ref line, which contradicted
    # this column -- the schema has been fixed to match this constraint
    # rather than the other way around.
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

    sacco = db.relationship('Sacco', back_populates='vehicles')
    trips = db.relationship('Trip', back_populates='vehicle')


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)

    # Matches the DBML Table definition (`sacco_id integer [not null]`) --
    # see the note on Vehicle.sacco_id above.
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

    sacco = db.relationship('Sacco', back_populates='users')


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

    bookings = db.relationship('Booking', back_populates='user')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def authenticate(self, password):
        return check_password_hash(self.password_hash, password)


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
        back_populates='origin_trips'
    )

    destination_routestop = db.relationship(
        'RouteStop',
        foreign_keys=[destination_routestop_id],
        back_populates='destination_trips'
    )

    vehicle = db.relationship('Vehicle', back_populates='trips')

    bookings = db.relationship('Booking', back_populates='trip')


class Booking(db.Model):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('passengers.id'),
        nullable=False
    )

    # Back to not-null, matching the DBML Table definition
    # (`trip_id integer [not null]`). Cancellation used to be modeled by
    # setting this to None, which contradicted that constraint and threw
    # away the booking's trip history. Cancellation is now tracked with
    # `status` / `cancelled_at` below instead, so trip_id can stay a
    # permanent, required reference.
    trip_id = db.Column(
        db.Integer,
        db.ForeignKey('trips.id'),
        nullable=False
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

    # "active" | "cancelled" (see schemas.BOOKING_STATUSES).
    status = db.Column(db.String, nullable=False, default='active')

    made_at = db.Column(
        db.DateTime,
        nullable=False,
        default=db.func.now()
    )

    user = db.relationship('Passenger', back_populates='bookings')

    trip = db.relationship('Trip', back_populates='bookings')

    origin_routestop = db.relationship(
        'RouteStop',
        foreign_keys=[origin_routestop_id],
        back_populates='booking_origins'
    )

    destination_routestop = db.relationship(
        'RouteStop',
        foreign_keys=[destination_routestop_id],
        back_populates='booking_destinations'
    )