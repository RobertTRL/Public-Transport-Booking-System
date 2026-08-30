import pytest
from app import app
from config import db
from models import Stop


@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

    with app.app_context():
        db.drop_all()
        db.create_all()

        stop_names = ["Westlands", "Archives", "Kikuyu", "Railways", "Pangani", "Globe", "Bomas"]
        stops = [Stop(name=name, longitude=36.8, latitude=-1.2) for name in stop_names]
        db.session.add_all(stops)
        db.session.commit()

        with app.test_client() as test_client:
            yield test_client


def test_stops_default_pagination(client):
    res = client.get("/api/v1/stops")
    assert res.status_code == 200
    data = res.get_json()
    assert data["page"] == 1
    assert data["per_page"] == 5
    assert data["total"] == 7
    assert data["total_pages"] == 2
    assert len(data["items"]) == 5
    # Alphabetical order: Archives, Bomas, Globe, Kikuyu, Pangani
    assert data["items"][0]["name"] == "Archives"
    assert data["items"][1]["name"] == "Bomas"


def test_stops_custom_pagination(client):
    res = client.get("/api/v1/stops?page=2&per_page=3")
    assert res.status_code == 200
    data = res.get_json()
    assert data["page"] == 2
    assert data["per_page"] == 3
    assert data["total"] == 7
    assert data["total_pages"] == 3
    assert len(data["items"]) == 3
