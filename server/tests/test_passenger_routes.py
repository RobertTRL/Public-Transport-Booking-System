import pytest
from app import app
from config import db
from models import Route, RouteStop, Stop


@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

    with app.app_context():
        db.drop_all()
        db.create_all()

        stop_archives = Stop(name="Archives", longitude=36.8172, latitude=-1.2833)
        stop_railways = Stop(name="Railways", longitude=36.8280, latitude=-1.2864)
        stop_westlands = Stop(name="Westlands", longitude=36.8038, latitude=-1.2648)
        stop_kikuyu = Stop(name="Kikuyu", longitude=36.6667, latitude=-1.2469)
        db.session.add_all([stop_archives, stop_railways, stop_westlands, stop_kikuyu])
        db.session.flush()

        route_kikuyu = Route(name="Route 46 - Kikuyu Line", color="#FFC107")
        db.session.add(route_kikuyu)
        db.session.flush()

        rs1 = RouteStop(route_id=route_kikuyu.id, stop_id=stop_archives.id, sequence=0)
        rs2 = RouteStop(route_id=route_kikuyu.id, stop_id=stop_railways.id, sequence=1)
        rs3 = RouteStop(route_id=route_kikuyu.id, stop_id=stop_westlands.id, sequence=2)
        rs4 = RouteStop(route_id=route_kikuyu.id, stop_id=stop_kikuyu.id, sequence=3)
        db.session.add_all([rs1, rs2, rs3, rs4])

        db.session.commit()

        with app.test_client() as test_client:
            yield test_client


def test_route_search_success(client):
    res = client.get("/api/v1/routes/search?origin_stop_id=1&destination_stop_id=3")
    assert res.status_code == 200
    data = res.get_json()
    assert len(data) == 1
    assert data[0]["name"] == "Route 46 - Kikuyu Line"
    assert len(data[0]["route_stops"]) == 4


def test_route_search_missing_params(client):
    res = client.get("/api/v1/routes/search?origin_stop_id=1")
    assert res.status_code == 400
    assert "error" in res.get_json()


def test_route_search_same_stops(client):
    res = client.get("/api/v1/routes/search?origin_stop_id=1&destination_stop_id=1")
    assert res.status_code == 400
    assert "Origin and destination stops must be different." in res.get_json()["error"]


def test_route_search_nonexistent_stops(client):
    res = client.get("/api/v1/routes/search?origin_stop_id=1&destination_stop_id=999")
    assert res.status_code == 404


def test_route_search_reversed_sequence(client):
    # Origin after destination in sequence should return no matching routes
    res = client.get("/api/v1/routes/search?origin_stop_id=3&destination_stop_id=1")
    assert res.status_code == 200
    assert res.get_json() == []


def test_route_detail_success(client):
    res = client.get("/api/v1/routes/1")
    assert res.status_code == 200
    data = res.get_json()
    assert data["name"] == "Route 46 - Kikuyu Line"
    assert data["color"] == "#FFC107"
    assert len(data["route_stops"]) == 4


def test_route_detail_not_found(client):
    res = client.get("/api/v1/routes/999")
    assert res.status_code == 404
