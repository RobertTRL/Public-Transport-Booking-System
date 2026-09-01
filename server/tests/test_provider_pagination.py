from datetime import datetime, timedelta

import pytest
from flask_jwt_extended import create_access_token

from config import db
from app import app
from models import (
    Booking,
    Passenger,
    Route,
    RouteStop,
    Sacco,
    Stop,
    Trip,
    User,
    Vehicle,
)


@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

    with app.app_context():
        db.drop_all()
        db.create_all()

        sacco = Sacco(
            name="Test Sacco",
            contact="0700000000",
            address="Nairobi",
        )
        db.session.add(sacco)
        db.session.flush()

        provider = User(
            sacco_id=sacco.id,
            name="Test Provider",
            email="provider@test.com",
            password_hash="test-password",
            role="provider",
        )
        db.session.add(provider)

        passenger = Passenger(
            email="passenger@test.com",
            password_hash="test-password",
            phone_number="0711111111",
        )
        db.session.add(passenger)

        route = Route(
            name="Test Route",
            color="#123456",
        )
        db.session.add(route)
        db.session.flush()

        stops = []
        for index in range(6):
            stop = Stop(
                name=f"Stop {index + 1}",
                latitude=-1.28 + index * 0.01,
                longitude=36.82 + index * 0.01,
            )
            db.session.add(stop)
            db.session.flush()

            route_stop = RouteStop(
                route_id=route.id,
                stop_id=stop.id,
                sequence=index + 1,
            )
            db.session.add(route_stop)
            stops.append(route_stop)

        vehicle1 = Vehicle(
            sacco_id=sacco.id,
            number_plate="KAA001A",
            capacity=20,
            is_active=True,
        )
        vehicle2 = Vehicle(
            sacco_id=sacco.id,
            number_plate="KBB002B",
            capacity=25,
            is_active=True,
        )
        vehicle3 = Vehicle(
            sacco_id=sacco.id,
            number_plate="KCC003C",
            capacity=30,
            is_active=True,
        )
        db.session.add_all([vehicle1, vehicle2, vehicle3])
        db.session.flush()

        base_time = datetime(2026, 8, 20, 8, 0, 0)

        trips = []
        for index in range(6):
            trip = Trip(
                origin_routestop_id=stops[0].id,
                destination_routestop_id=stops[-1].id,
                vehicle_id=[vehicle1.id, vehicle2.id, vehicle3.id][index % 3],
                start_time=base_time + timedelta(hours=index),
                stop_time=base_time + timedelta(hours=index, minutes=45),
                status="scheduled",
            )
            db.session.add(trip)
            trips.append(trip)

        db.session.flush()

        for index in range(6):
            booking = Booking(
                user_id=passenger.id,
                trip_id=trips[index].id,
                origin_routestop_id=stops[0].id,
                destination_routestop_id=stops[-1].id,
                status="active" if index < 4 else "cancelled",
                made_at=base_time + timedelta(hours=index),
            )
            db.session.add(booking)

        db.session.commit()

        token = create_access_token(identity=str(provider.id))

        client = app.test_client()
        client.environ_base["HTTP_AUTHORIZATION"] = f"Bearer {token}"

        yield client

        db.session.remove()
        db.drop_all()


def assert_pagination(data):
    assert "page" in data
    assert "per_page" in data
    assert "total" in data
    assert "total_pages" in data
    assert "items" in data


def test_route_stops_pagination(client):
    response = client.get(
        "/api/v1/provider/routes/1/stops?page=1&per_page=2"
    )

    assert response.status_code == 200

    data = response.get_json()
    assert_pagination(data)
    assert data["page"] == 1
    assert data["per_page"] == 2
    assert data["total"] == 6
    assert data["total_pages"] == 3
    assert len(data["items"]) == 2


def test_vehicle_pagination(client):
    response = client.get(
        "/api/v1/provider/vehicles?page=1&per_page=2"
    )

    assert response.status_code == 200

    data = response.get_json()
    assert_pagination(data)
    assert data["total"] == 3
    assert data["total_pages"] == 2
    assert len(data["items"]) == 2


def test_vehicle_filters_and_pagination(client):
    response = client.get(
        "/api/v1/provider/vehicles"
        "?route_id=1&q=KAA&page=1&per_page=5"
    )

    assert response.status_code == 200

    data = response.get_json()
    assert_pagination(data)
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["number_plate"] == "KAA001A"


def test_route_trips_pagination_and_date_filters(client):
    response = client.get(
        "/api/v1/provider/routes/1/trips"
        "?from=2026-08-20T09:00:00"
        "&to=2026-08-20T12:00:00"
        "&page=1&per_page=2"
    )

    assert response.status_code == 200

    data = response.get_json()
    assert_pagination(data)
    assert data["total"] == 4
    assert data["total_pages"] == 2
    assert len(data["items"]) == 2


def test_provider_bookings_pagination_and_filters(client):
    response = client.get(
        "/api/v1/provider/bookings"
        "?trip_id=1"
        "&route_id=1"
        "&from=2026-08-20T08:00:00"
        "&to=2026-08-20T08:00:00"
        "&page=1&per_page=5"
    )

    assert response.status_code == 200

    data = response.get_json()
    assert_pagination(data)
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["trip_id"] == 1


def test_provider_bookings_status_filter_and_pagination(client):
    response = client.get(
        "/api/v1/provider/bookings"
        "?status=active&page=1&per_page=2"
    )

    assert response.status_code == 200

    data = response.get_json()
    assert_pagination(data)
    assert data["total"] == 4
    assert data["total_pages"] == 2
    assert len(data["items"]) == 2


def test_trip_bookings_pagination(client):
    response = client.get(
        "/api/v1/provider/trips/1/bookings?page=1&per_page=2"
    )

    assert response.status_code == 200

    data = response.get_json()
    assert_pagination(data)
    assert data["total"] == 1
    assert data["total_pages"] == 1
    assert len(data["items"]) == 1
