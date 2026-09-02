import pytest
from app import app
from config import db
from models import Passenger, User, Sacco, Route, Stop, RouteStop, Vehicle, Trip, Booking
from datetime import datetime, timedelta


@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

    with app.app_context():
        db.drop_all()
        db.create_all()

        # Seed Sacco
        sacco = Sacco(name="Super Metro", contact="0711000111", address="Nairobi")
        db.session.add(sacco)
        db.session.flush()

        # Seed Provider User (Admin) with id matching passenger fixture later
        provider = User(
            sacco_id=sacco.id,
            name="Peter Mwangi",
            email="peter@supermetro.co.ke",
            role="admin",
        )
        provider.set_password("password123")
        db.session.add(provider)

        # Seed Passenger
        passenger = Passenger(
            email="jane@example.com",
            phone_number="0722334455",
        )
        passenger.set_password("password123")
        db.session.add(passenger)

        # Seed Route, Stops, Vehicle, Trip
        route = Route(name="Route 105", color="#2563eb")
        db.session.add(route)
        db.session.flush()

        stop1 = Stop(name="Odeon Cinema", latitude=-1.2825, longitude=36.8240)
        stop2 = Stop(name="Westlands", latitude=-1.2675, longitude=36.8080)
        db.session.add_all([stop1, stop2])
        db.session.flush()

        rs1 = RouteStop(route_id=route.id, stop_id=stop1.id, sequence=1)
        rs2 = RouteStop(route_id=route.id, stop_id=stop2.id, sequence=2)
        db.session.add_all([rs1, rs2])
        db.session.flush()

        vehicle = Vehicle(
            sacco_id=sacco.id,
            number_plate="KDA 001A",
            capacity=14,
            is_active=True,
        )
        db.session.add(vehicle)
        db.session.flush()

        start = datetime.now() + timedelta(hours=1)
        trip = Trip(
            origin_routestop_id=rs1.id,
            destination_routestop_id=rs2.id,
            vehicle_id=vehicle.id,
            start_time=start,
            status="scheduled",
        )
        db.session.add(trip)
        db.session.commit()

        with app.test_client() as test_client:
            yield test_client


def test_passenger_registration_post(client):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "user_type": "passenger",
            "name": "Alice Commuter",
            "email": "alice@example.com",
            "phone_number": "0799887766",
            "password": "password123",
        },
    )
    assert res.status_code == 201
    data = res.get_json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_cross_role_isolation_passenger_cannot_access_provider_endpoints(client):
    # Log in as passenger
    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "user_type": "passenger",
            "email": "jane@example.com",
            "password": "password123",
        },
    )
    assert login_res.status_code == 200
    passenger_token = login_res.get_json()["access_token"]

    # Attempt to access provider bookings
    res = client.get(
        "/api/v1/provider/bookings",
        headers={"Authorization": f"Bearer {passenger_token}"},
    )
    # Must fail because passenger is not a provider user
    assert res.status_code == 401
    assert "Unauthorized" in res.get_json().get("error", "")


def test_cross_role_isolation_provider_cannot_book_as_passenger(client):
    # Log in as provider
    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "user_type": "user",
            "email": "peter@supermetro.co.ke",
            "password": "password123",
        },
    )
    assert login_res.status_code == 200
    provider_token = login_res.get_json()["access_token"]

    # Attempt to access passenger my-bookings
    res = client.get(
        "/api/v1/me/bookings",
        headers={"Authorization": f"Bearer {provider_token}"},
    )
    assert res.status_code in (401, 403, 404)


def test_provider_booking_response_enrichment_and_cancellation(client):
    # 1. Login as passenger and create a booking
    p_login = client.post(
        "/api/v1/auth/login",
        json={
            "user_type": "passenger",
            "email": "jane@example.com",
            "password": "password123",
        },
    )
    p_token = p_login.get_json()["access_token"]

    with app.app_context():
        trip = Trip.query.first()
        rs1 = trip.origin_routestop_id
        rs2 = trip.destination_routestop_id

    book_res = client.post(
        "/api/v1/bookings",
        headers={"Authorization": f"Bearer {p_token}"},
        json={
            "trip_id": trip.id,
            "origin_routestop_id": rs1,
            "destination_routestop_id": rs2,
        },
    )
    assert book_res.status_code == 201
    booking_id = book_res.get_json()["id"]

    # 2. Login as provider and check enriched booking data
    u_login = client.post(
        "/api/v1/auth/login",
        json={
            "user_type": "user",
            "email": "peter@supermetro.co.ke",
            "password": "password123",
        },
    )
    u_token = u_login.get_json()["access_token"]

    prov_res = client.get(
        "/api/v1/provider/bookings",
        headers={"Authorization": f"Bearer {u_token}"},
    )
    assert prov_res.status_code == 200
    p_data = prov_res.get_json()
    assert "items" in p_data
    assert len(p_data["items"]) >= 1

    first_booking = p_data["items"][0]
    assert first_booking["passenger_name"] == "jane@example.com"
    assert first_booking["route_name"] == "Route 105"
    assert first_booking["origin_name"] == "Odeon Cinema"
    assert first_booking["destination_name"] == "Westlands"
    assert first_booking["vehicle_plate"] == "KDA 001A"

    # 3. Cancel booking as passenger
    cancel_res = client.patch(
        f"/api/v1/bookings/{booking_id}/cancel",
        headers={"Authorization": f"Bearer {p_token}"},
    )
    assert cancel_res.status_code == 200
    assert cancel_res.get_json()["booking"]["status"] == "cancelled"
