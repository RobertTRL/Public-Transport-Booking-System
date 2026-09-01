from datetime import datetime, timedelta
import pytest
from app import app
from config import db
from models import (
    Booking,
    Passenger,
    Route,
    RouteStop,
    Sacco,
    Stop,
    Trip,
    Vehicle,
)


@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

    with app.app_context():
        db.drop_all()
        db.create_all()

        sacco = Sacco(name="Super Metro", contact="0700111222", address="Nairobi CBD")
        db.session.add(sacco)
        db.session.flush()

        vehicle = Vehicle(sacco_id=sacco.id, number_plate="KDA 123A", capacity=33, is_active=True)
        db.session.add(vehicle)
        db.session.flush()

        stop1 = Stop(name="Archives", longitude=36.8172, latitude=-1.2833)
        stop2 = Stop(name="Railways", longitude=36.8280, latitude=-1.2864)
        stop3 = Stop(name="Westlands", longitude=36.8038, latitude=-1.2648)
        stop4 = Stop(name="Kikuyu", longitude=36.6667, latitude=-1.2469)
        db.session.add_all([stop1, stop2, stop3, stop4])
        db.session.flush()

        route = Route(name="Route 46 - Kikuyu Line", color="#FFC107")
        db.session.add(route)
        db.session.flush()

        rs1 = RouteStop(route_id=route.id, stop_id=stop1.id, sequence=0)
        rs2 = RouteStop(route_id=route.id, stop_id=stop2.id, sequence=1)
        rs3 = RouteStop(route_id=route.id, stop_id=stop3.id, sequence=2)
        rs4 = RouteStop(route_id=route.id, stop_id=stop4.id, sequence=3)
        db.session.add_all([rs1, rs2, rs3, rs4])
        db.session.flush()

        now = datetime.utcnow()
        trip = Trip(
            origin_routestop_id=rs1.id,
            destination_routestop_id=rs4.id,
            start_time=now + timedelta(hours=1),
            vehicle_id=vehicle.id,
            status="scheduled",
        )
        db.session.add(trip)
        db.session.flush()

        passenger = Passenger(email="mary@example.com", phone_number="0722000111")
        passenger.set_password("password123")
        db.session.add(passenger)
        db.session.flush()

        booking = Booking(
            user_id=passenger.id,
            trip_id=trip.id,
            origin_routestop_id=rs1.id,
            destination_routestop_id=rs3.id,
            status="active",
        )
        db.session.add(booking)
        db.session.commit()

        with app.test_client() as test_client:
            yield test_client


def test_available_trips_success(client):
    today = datetime.utcnow().strftime("%Y-%m-%d")
    res = client.get(f"/api/v1/trips?origin_routestop_id=1&destination_routestop_id=3&date={today}")
    assert res.status_code == 200
    data = res.get_json()
    assert data["total"] == 1
    assert data["items"][0]["status"] == "scheduled"
    assert data["items"][0]["vehicle"]["number_plate"] == "KDA 123A"


def test_available_trips_missing_params(client):
    res = client.get("/api/v1/trips?origin_routestop_id=1")
    assert res.status_code == 400


def test_available_trips_invalid_date_format(client):
    res = client.get("/api/v1/trips?origin_routestop_id=1&destination_routestop_id=3&date=30-08-2026")
    assert res.status_code == 400
    assert "YYYY-MM-DD" in res.get_json()["error"]


def test_trip_detail_success(client):
    res = client.get("/api/v1/trips/1")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "scheduled"
    assert data["vehicle"]["capacity"] == 33


def test_trip_detail_not_found(client):
    res = client.get("/api/v1/trips/999")
    assert res.status_code == 404


def test_trip_availability_success(client):
    res = client.get("/api/v1/trips/1/availability?origin_routestop_id=1&destination_routestop_id=3")
    assert res.status_code == 200
    data = res.get_json()
    assert data["trip_id"] == 1
    assert data["capacity"] == 33
    assert data["booked_seats"] == 1
    assert data["available_seats"] == 32


def test_trip_availability_invalid_segment(client):
    # Destination before origin is invalid
    res = client.get("/api/v1/trips/1/availability?origin_routestop_id=3&destination_routestop_id=1")
    assert res.status_code == 400
