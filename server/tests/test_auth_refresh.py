import pytest
from app import app
from config import db
from models import Passenger, User, Sacco


@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

    with app.app_context():
        db.drop_all()
        db.create_all()

        sacco = Sacco(name="Test Sacco", contact="0700000000", address="Nairobi")
        db.session.add(sacco)
        db.session.flush()

        passenger = Passenger(email="mary@example.com", phone_number="0722000111")
        passenger.set_password("password123")
        db.session.add(passenger)

        user = User(
            sacco_id=sacco.id,
            name="Peter Mwangi",
            email="peter@supermetro.co.ke",
            role="admin",
        )
        user.set_password("password123")
        db.session.add(user)

        db.session.commit()

        with app.test_client() as test_client:
            yield test_client


def test_login_returns_access_and_refresh_tokens(client):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "user_type": "passenger",
            "email": "mary@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 200
    data = response.get_json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_register_returns_access_and_refresh_tokens(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "user_type": "passenger",
            "email": "newpassenger@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 201
    data = response.get_json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_token_refresh_generates_new_access_token(client):
    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "user_type": "passenger",
            "email": "mary@example.com",
            "password": "password123",
        },
    )
    refresh_token = login_res.get_json()["refresh_token"]

    refresh_res = client.post(
        "/api/v1/auth/refresh",
        headers={"Authorization": f"Bearer {refresh_token}"},
    )
    assert refresh_res.status_code == 200
    data = refresh_res.get_json()
    assert "access_token" in data


def test_token_refresh_rejects_access_token(client):
    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "user_type": "passenger",
            "email": "mary@example.com",
            "password": "password123",
        },
    )
    access_token = login_res.get_json()["access_token"]

    refresh_res = client.post(
        "/api/v1/auth/refresh",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    # Using an access token where a refresh token is required returns 422
    assert refresh_res.status_code == 422


def test_token_refresh_rejects_unauthenticated(client):
    refresh_res = client.post("/api/v1/auth/refresh")
    assert refresh_res.status_code == 401
