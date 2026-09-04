"""
Seed script for the public transport booking system.
Populates SACCOs, Vehicles, Users (providers), Passengers, Routes, Stops,
RouteStops, Trips, and Bookings with sample Nairobi matatu data.

Adjust the imports below (app, model class names) to match your actual
app.py / models.py — these are guesses based on the ERD and the auth
code you shared, not your real class names.

Run with:
    python seed.py
"""

import os
import sys
from datetime import datetime, timedelta

from config import app, db
from models import (
    Sacco, Vehicle, User, Passenger, Route, Stop, RouteStop, Trip, Booking
)


def clear_data():
    Booking.query.delete()
    Trip.query.delete()
    RouteStop.query.delete()
    Stop.query.delete()
    Route.query.delete()
    Vehicle.query.delete()
    User.query.delete()
    Passenger.query.delete()
    Sacco.query.delete()
    db.session.commit()


def seed(force=False):
    db.create_all()
    if not force and Sacco.query.first():
        print("Database already contains data. Skipping seed (pass --force to override).")
        return

    clear_data()

    # ---- SACCOs ----
    super_metro = Sacco(name="Super Metro", contact="0700111222", address="Nairobi CBD")
    citihoppa = Sacco(name="Citi Hoppa", contact="0700333444", address="Nairobi CBD")
    db.session.add_all([super_metro, citihoppa])
    db.session.commit()

    # ---- Vehicles (Diverse active fleet per SACCO) ----
    vehicles = [
        # Super Metro Fleet
        Vehicle(sacco_id=super_metro.id, number_plate="KDA 123A", capacity=33, is_active=True),
        Vehicle(sacco_id=super_metro.id, number_plate="KDB 456B", capacity=25, is_active=True),
        Vehicle(sacco_id=super_metro.id, number_plate="KDE 111A", capacity=33, is_active=True),
        Vehicle(sacco_id=super_metro.id, number_plate="KDE 222B", capacity=33, is_active=True),
        Vehicle(sacco_id=super_metro.id, number_plate="KDF 333C", capacity=14, is_active=True),
        Vehicle(sacco_id=super_metro.id, number_plate="KDG 444D", capacity=33, is_active=True),
        # Citi Hoppa Fleet
        Vehicle(sacco_id=citihoppa.id, number_plate="KDC 789C", capacity=33, is_active=True),
        Vehicle(sacco_id=citihoppa.id, number_plate="KDE 555E", capacity=45, is_active=True),
        Vehicle(sacco_id=citihoppa.id, number_plate="KDF 666F", capacity=33, is_active=True),
        Vehicle(sacco_id=citihoppa.id, number_plate="KDG 777G", capacity=25, is_active=True),
        Vehicle(sacco_id=citihoppa.id, number_plate="KDD 012D", capacity=14, is_active=False),
    ]
    db.session.add_all(vehicles)
    db.session.commit()

    # ---- Providers (Users) ----
    # plaintext passwords below are for Postman login testing — never stored
    provider_passwords = {
        "peter@supermetro.co.ke": "password123",
        "grace@supermetro.co.ke": "password123",
        "kevin@supermetro.co.ke": "password123",
        "john@citihoppa.co.ke": "password123",
    }
    providers = [
        User(sacco_id=super_metro.id, name="Peter Mwangi", email="peter@supermetro.co.ke",
             phone_number="0711000111", role="admin"),
        User(sacco_id=super_metro.id, name="Grace Wanjiru", email="grace@supermetro.co.ke",
             phone_number="0711000222", role="dispatcher"),
        User(sacco_id=super_metro.id, name="Kevin Otieno", email="kevin@supermetro.co.ke",
             phone_number="0711000444", role="driver"),
        User(sacco_id=citihoppa.id, name="John Otieno", email="john@citihoppa.co.ke",
             phone_number="0711000333", role="admin"),
    ]
    for provider in providers:
        provider.set_password(provider_passwords[provider.email])
    db.session.add_all(providers)
    db.session.commit()

    # ---- Passengers ----
    passengers = [
        Passenger(email="mary@example.com", phone_number="0722000111"),
        Passenger(email="james@example.com", phone_number="0722000222"),
        Passenger(email="susan@example.com", phone_number="0722000333"),
        Passenger(email="johnkarani@gmail.com", phone_number="0723659321"),
    ]
    for passenger in passengers:
        passenger.set_password("password123")
    db.session.add_all(passengers)
    db.session.commit()

    # ---- Stops (Archives shared as the terminus across all routes) ----
    stop_coords = {
        "Archives":         (36.8172, -1.2833),
        "Railways":         (36.8280, -1.2864),
        "Museum Hill":      (36.8129, -1.2680),
        "Westlands":        (36.8038, -1.2648),
        "Kangemi":          (36.7477, -1.2649),
        "Kikuyu":           (36.6667, -1.2469),
        "Kencom":           (36.8225, -1.2841),
        "Bomas":            (36.7601, -1.3140),
        "Karen":            (36.7076, -1.3193),
        "Rongai":           (36.7461, -1.3963),
        "Globe Roundabout": (36.8258, -1.2790),
        "Pangani":          (36.8280, -1.2640),
        "Allsops":          (36.8460, -1.2530),
        "Kasarani":         (36.8990, -1.2230),
        "Githurai":         (36.9280, -1.1850),
        "Thika":            (37.0834, -1.0332),
    }
    stops = {name: Stop(name=name, longitude=lon, latitude=lat)
             for name, (lon, lat) in stop_coords.items()}
    db.session.add_all(stops.values())
    db.session.commit()

    # ---- Routes ----
    route_kikuyu = Route(name="Route 46 - Kikuyu Line", color="#FFC107")
    route_rongai = Route(name="Route 24 - Rongai Line", color="#E53935")
    route_thika = Route(name="Route 58 - Thika Road Line", color="#43A047")
    db.session.add_all([route_kikuyu, route_rongai, route_thika])
    db.session.commit()

    # ---- RouteStops (ordered stops per route; Archives is stop 0 on every route) ----
    def add_route_stops(route, stop_names):
        route_stops = []
        for i, name in enumerate(stop_names):
            rs = RouteStop(route_id=route.id, stop_id=stops[name].id, sequence=i)
            db.session.add(rs)
            route_stops.append(rs)
        db.session.commit()
        return route_stops

    kikuyu_stops = add_route_stops(route_kikuyu, [
        "Archives", "Railways", "Museum Hill", "Westlands", "Kangemi", "Kikuyu"
    ])
    rongai_stops = add_route_stops(route_rongai, [
        "Archives", "Kencom", "Bomas", "Karen", "Rongai"
    ])
    thika_stops = add_route_stops(route_thika, [
        "Archives", "Globe Roundabout", "Pangani", "Allsops", "Kasarani", "Githurai", "Thika"
    ])

    # ---- Trips ----
    now = datetime.utcnow()
    trips = [
        Trip(origin_routestop_id=kikuyu_stops[0].id, destination_routestop_id=kikuyu_stops[-1].id,
             start_time=now + timedelta(minutes=30), vehicle_id=vehicles[0].id, status="scheduled"),
        Trip(origin_routestop_id=rongai_stops[0].id, destination_routestop_id=rongai_stops[-1].id,
             start_time=now + timedelta(minutes=45), vehicle_id=vehicles[1].id, status="scheduled"),
        Trip(origin_routestop_id=thika_stops[0].id, destination_routestop_id=thika_stops[-1].id,
             start_time=now - timedelta(hours=1), stop_time=now - timedelta(minutes=10),
             vehicle_id=vehicles[2].id, status="completed"),
    ]
    db.session.add_all(trips)
    db.session.commit()

    # ---- Bookings ----
    # NOTE: per your ERD, Booking.user_id references Passengers.id, not Users.id —
    # despite the column name, only passengers make bookings.
    bookings = [
        Booking(user_id=passengers[0].id, trip_id=trips[0].id,
                origin_routestop_id=kikuyu_stops[0].id,
                destination_routestop_id=kikuyu_stops[3].id, made_at=now),
        Booking(user_id=passengers[1].id, trip_id=trips[1].id,
                origin_routestop_id=rongai_stops[0].id,
                destination_routestop_id=rongai_stops[-1].id, made_at=now),
        Booking(user_id=passengers[2].id, trip_id=trips[2].id,
                origin_routestop_id=thika_stops[0].id,
                destination_routestop_id=thika_stops[2].id, made_at=now),
    ]
    db.session.add_all(bookings)
    db.session.commit()

    print("Seed data created successfully.")


if __name__ == "__main__":
    force_seed = (
        "--force" in sys.argv
        or "-f" in sys.argv
        or os.getenv("FORCE_SEED", "").lower() in ("true", "1")
    )
    with app.app_context():
        seed(force=force_seed)