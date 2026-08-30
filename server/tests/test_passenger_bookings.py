from datetime import datetime, timedelta
import pytest
from flask_jwt_extended import create_access_token
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
def test_setup():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

    with app.app_context():
        db.drop_all()
        db.create_all()

        sacco = Sacco(name="Super Metro", contact="0700111222", address="Nairobi CBD")
        db.session.add(sacco)
        db.session.flush()

        vehicle1 = Vehicle(sacco_id=sacco.id, number_plate="KDA 123A", capacity=2, is_active=True)
        vehicle_inactive = Vehicle(sacco_id=sacco.id, number_plate="KDB 456B", capacity=14, is_active=False)
        db.session.add_all([vehicle1, vehicle_inactive])
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
        trip1 = Trip(
            origin_routestop_id=rs1.id,
            destination_routestop_id=rs4.id,
            start_time=now + timedelta(hours=1),
            vehicle_id=vehicle1.id,
            status="scheduled",
        )
        trip_inactive = Trip(
            origin_routestop_id=rs1.id,
            destination_routestop_id=rs4.id,
            start_time=now + timedelta(hours=2),
            vehicle_id=vehicle_inactive.id,
            status="scheduled",
        )
        db.session.add_all([trip1, trip_inactive])
        db.session.flush()

        mary = Passenger(email="mary@example.com", phone_number="0722000111")
        mary.set_password("password123")
        susan = Passenger(email="susan@example.com", phone_number="0722000333")
        susan.set_password("password123")
        db.session.add_all([mary, susan])
        db.session.commit()

        mary_token = create_access_token(identity=str(mary.id))
        susan_token = create_access_token(identity=str(susan.id))

        with app.test_client() as client:
            yield {
                "client": client,
                "mary": mary,
                "susan": susan,
                "mary_headers": {"Authorization": f"Bearer {mary_token}"},
                "susan_headers": {"Authorization": f"Bearer {susan_token}"},
                "trip1": trip1,
                "trip_inactive": trip_inactive,
                "rs1": rs1,
                "rs3": rs3,
                "rs4": rs4,
            }


def test_create_booking_success(test_setup):
    client = test_setup["client"]
    headers = test_setup["mary_headers"]
    res = client.post(
        "/api/v1/bookings",
        headers=headers,
        json={
            "trip_id": 1,
            "origin_routestop_id": 1,
            "destination_routestop_id": 3,
        },
    )
    assert res.status_code == 201
    data = res.get_json()
    assert data["status"] == "active"
    assert data["user"]["email"] == "mary@example.com"


def test_create_booking_duplicate_overlap_rejected(test_setup):
    client = test_setup["client"]
    headers = test_setup["mary_headers"]
    # First booking
    client.post(
        "/api/v1/bookings",
        headers=headers,
        json={"trip_id": 1, "origin_routestop_id": 1, "destination_routestop_id": 3},
    )
    # Second booking by same passenger overlapping same trip
    res = client.post(
        "/api/v1/bookings",
        headers=headers,
        json={"trip_id": 1, "origin_routestop_id": 1, "destination_routestop_id": 4},
    )
    assert res.status_code == 409
    assert "already have an active booking" in res.get_json()["error"]


def test_create_booking_inactive_vehicle_rejected(test_setup):
    client = test_setup["client"]
    headers = test_setup["mary_headers"]
    res = client.post(
        "/api/v1/bookings",
        headers=headers,
        json={"trip_id": 2, "origin_routestop_id": 1, "destination_routestop_id": 4},
    )
    assert res.status_code == 409
    assert "not active" in res.get_json()["error"]


def test_my_bookings_listing(test_setup):
    client = test_setup["client"]
    headers = test_setup["mary_headers"]
    client.post(
        "/api/v1/bookings",
        headers=headers,
        json={"trip_id": 1, "origin_routestop_id": 1, "destination_routestop_id": 3},
    )
    res = client.get("/api/v1/me/bookings", headers=headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["total"] == 1
    assert len(data["items"]) == 1


def test_booking_detail_and_authorization(test_setup):
    client = test_setup["client"]
    mary_headers = test_setup["mary_headers"]
    susan_headers = test_setup["susan_headers"]

    create_res = client.post(
        "/api/v1/bookings",
        headers=mary_headers,
        json={"trip_id": 1, "origin_routestop_id": 1, "destination_routestop_id": 3},
    )
    booking_id = create_res.get_json()["id"]

    # Owner can view
    owner_res = client.get(f"/api/v1/bookings/{booking_id}", headers=mary_headers)
    assert owner_res.status_code == 200

    # Another passenger cannot view
    other_res = client.get(f"/api/v1/bookings/{booking_id}", headers=susan_headers)
    assert other_res.status_code == 403


def test_booking_cancellation(test_setup):
    client = test_setup["client"]
    mary_headers = test_setup["mary_headers"]

    create_res = client.post(
        "/api/v1/bookings",
        headers=mary_headers,
        json={"trip_id": 1, "origin_routestop_id": 1, "destination_routestop_id": 3},
    )
    booking_id = create_res.get_json()["id"]

    # First cancel
    cancel_res = client.patch(f"/api/v1/bookings/{booking_id}/cancel", headers=mary_headers)
    assert cancel_res.status_code == 200
    assert cancel_res.get_json()["booking"]["status"] == "cancelled"

    # Second cancel should return 409
    cancel_again = client.patch(f"/api/v1/bookings/{booking_id}/cancel", headers=mary_headers)
    assert cancel_again.status_code == 409
