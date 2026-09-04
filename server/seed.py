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


def refresh_today_trips():
    """
    Ensures that active vehicles exist and creates fresh scheduled trips
    for today and tomorrow across all routes without wiping existing database data.
    """
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day, 0, 0, 0)

    sacco1 = Sacco.query.filter_by(name="Super Metro").first()
    sacco2 = Sacco.query.filter_by(name="Citi Hoppa").first()
    if not sacco1 or not sacco2:
        return 0

    extra_vehicles = [
        {"plate": "KDA 123A", "sacco_id": sacco1.id, "capacity": 33, "active": True},
        {"plate": "KDB 456B", "sacco_id": sacco1.id, "capacity": 25, "active": True},
        {"plate": "KDE 111A", "sacco_id": sacco1.id, "capacity": 33, "active": True},
        {"plate": "KDE 222B", "sacco_id": sacco1.id, "capacity": 33, "active": True},
        {"plate": "KDF 333C", "sacco_id": sacco1.id, "capacity": 14, "active": True},
        {"plate": "KDG 444D", "sacco_id": sacco1.id, "capacity": 33, "active": True},
        {"plate": "KDC 789C", "sacco_id": sacco2.id, "capacity": 33, "active": True},
        {"plate": "KDE 555E", "sacco_id": sacco2.id, "capacity": 45, "active": True},
        {"plate": "KDF 666F", "sacco_id": sacco2.id, "capacity": 33, "active": True},
        {"plate": "KDG 777G", "sacco_id": sacco2.id, "capacity": 25, "active": True},
    ]

    all_vehicles = []
    for item in extra_vehicles:
        v = Vehicle.query.filter_by(number_plate=item["plate"]).first()
        if not v:
            v = Vehicle(
                sacco_id=item["sacco_id"],
                number_plate=item["plate"],
                capacity=item["capacity"],
                is_active=item["active"]
            )
            db.session.add(v)
            db.session.commit()
        else:
            v.is_active = item["active"]
            db.session.commit()
        all_vehicles.append(v)

    routes = Route.query.all()
    if not routes:
        return 0

    trips_created = 0
    # Clean up old past scheduled trips that don't have bookings
    old_scheduled = Trip.query.filter(
        Trip.status == "scheduled",
        Trip.start_time < today_start
    ).all()
    for ot in old_scheduled:
        if not ot.bookings:
            db.session.delete(ot)
    db.session.commit()

    # Time offsets for departures today & tomorrow
    today_offsets_minutes = [30, 60, 120, 180, 240, 360, 480, 600, 720]
    tomorrow_offsets_hours = [24 + 8, 24 + 11, 24 + 14, 24 + 17]

    for route in routes:
        stops = RouteStop.query.filter_by(route_id=route.id).order_by(RouteStop.sequence).all()
        if len(stops) < 2:
            continue
        origin_id = stops[0].id
        destination_id = stops[-1].id

        for i, offset_min in enumerate(today_offsets_minutes):
            start_dt = now + timedelta(minutes=offset_min)
            v = all_vehicles[(route.id + i) % len(all_vehicles)]
            trip = Trip(
                origin_routestop_id=origin_id,
                destination_routestop_id=destination_id,
                start_time=start_dt,
                vehicle_id=v.id,
                status="scheduled"
            )
            db.session.add(trip)
            trips_created += 1

        for j, offset_hr in enumerate(tomorrow_offsets_hours):
            start_dt = now + timedelta(hours=offset_hr)
            v = all_vehicles[(route.id + j + 2) % len(all_vehicles)]
            trip = Trip(
                origin_routestop_id=origin_id,
                destination_routestop_id=destination_id,
                start_time=start_dt,
                vehicle_id=v.id,
                status="scheduled"
            )
            db.session.add(trip)
            trips_created += 1

    db.session.commit()
    print(f"Refreshed trips: {trips_created} scheduled trips generated for today and tomorrow.")
    return trips_created


def seed(force=False):
    db.create_all()
    if not force and Sacco.query.first():
        print("Database already contains data. Refreshing vehicles & today's trips...")
        refresh_today_trips()
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

    # ---- Trips (Scheduled throughout today and tomorrow so vehicles appear!) ----
    now = datetime.utcnow()
    trips = [
        # Kikuyu Line Trips (Today)
        Trip(origin_routestop_id=kikuyu_stops[0].id, destination_routestop_id=kikuyu_stops[-1].id,
             start_time=now + timedelta(minutes=30), vehicle_id=vehicles[0].id, status="scheduled"),
        Trip(origin_routestop_id=kikuyu_stops[0].id, destination_routestop_id=kikuyu_stops[-1].id,
             start_time=now + timedelta(hours=1, minutes=30), vehicle_id=vehicles[2].id, status="scheduled"),
        Trip(origin_routestop_id=kikuyu_stops[0].id, destination_routestop_id=kikuyu_stops[-1].id,
             start_time=now + timedelta(hours=3), vehicle_id=vehicles[3].id, status="scheduled"),
        Trip(origin_routestop_id=kikuyu_stops[0].id, destination_routestop_id=kikuyu_stops[-1].id,
             start_time=now + timedelta(hours=5), vehicle_id=vehicles[4].id, status="scheduled"),

        # Rongai Line Trips (Today)
        Trip(origin_routestop_id=rongai_stops[0].id, destination_routestop_id=rongai_stops[-1].id,
             start_time=now + timedelta(minutes=45), vehicle_id=vehicles[1].id, status="scheduled"),
        Trip(origin_routestop_id=rongai_stops[0].id, destination_routestop_id=rongai_stops[-1].id,
             start_time=now + timedelta(hours=2), vehicle_id=vehicles[5].id, status="scheduled"),
        Trip(origin_routestop_id=rongai_stops[0].id, destination_routestop_id=rongai_stops[-1].id,
             start_time=now + timedelta(hours=4), vehicle_id=vehicles[6].id, status="scheduled"),

        # Thika Road Trips (Today & history)
        Trip(origin_routestop_id=thika_stops[0].id, destination_routestop_id=thika_stops[-1].id,
             start_time=now + timedelta(hours=1), vehicle_id=vehicles[7].id, status="scheduled"),
        Trip(origin_routestop_id=thika_stops[0].id, destination_routestop_id=thika_stops[-1].id,
             start_time=now + timedelta(hours=3, minutes=30), vehicle_id=vehicles[8].id, status="scheduled"),
        Trip(origin_routestop_id=thika_stops[0].id, destination_routestop_id=thika_stops[-1].id,
             start_time=now - timedelta(hours=2), stop_time=now - timedelta(hours=1),
             vehicle_id=vehicles[9].id, status="completed"),

        # Tomorrow Trips
        Trip(origin_routestop_id=kikuyu_stops[0].id, destination_routestop_id=kikuyu_stops[-1].id,
             start_time=now + timedelta(days=1, hours=2), vehicle_id=vehicles[0].id, status="scheduled"),
        Trip(origin_routestop_id=rongai_stops[0].id, destination_routestop_id=rongai_stops[-1].id,
             start_time=now + timedelta(days=1, hours=4), vehicle_id=vehicles[1].id, status="scheduled"),
        Trip(origin_routestop_id=thika_stops[0].id, destination_routestop_id=thika_stops[-1].id,
             start_time=now + timedelta(days=1, hours=3), vehicle_id=vehicles[7].id, status="scheduled"),
    ]
    db.session.add_all(trips)
    db.session.commit()

    # ---- Bookings ----
    bookings = [
        Booking(user_id=passengers[0].id, trip_id=trips[0].id,
                origin_routestop_id=kikuyu_stops[0].id,
                destination_routestop_id=kikuyu_stops[3].id, made_at=now),
        Booking(user_id=passengers[1].id, trip_id=trips[4].id,
                origin_routestop_id=rongai_stops[0].id,
                destination_routestop_id=rongai_stops[-1].id, made_at=now),
        Booking(user_id=passengers[2].id, trip_id=trips[7].id,
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