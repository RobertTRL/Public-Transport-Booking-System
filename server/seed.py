from config import app, db
from models import Sacco, Vehicle, Route, Stop, RouteStop, Passenger, Trip


def seed_database():
    with app.app_context():
        print("Clearing existing data...")

        db.drop_all()
        db.create_all()

        # -------------------------
        # SACCO
        # -------------------------
        sacco = Sacco(
            name="BookVault Transport",
            contact="0712345678",
            address="Nairobi, Kenya"
        )

        db.session.add(sacco)
        db.session.flush()

        # -------------------------
        # VEHICLES
        # -------------------------
        vehicle1 = Vehicle(
            sacco_id=sacco.id,
            number_plate="KDA 123A",
            capacity=33,
            is_active=True
        )

        vehicle2 = Vehicle(
            sacco_id=sacco.id,
            number_plate="KDB 456B",
            capacity=45,
            is_active=True
        )

        db.session.add_all([vehicle1, vehicle2])

        # -------------------------
        # ROUTE
        # -------------------------
        route = Route(
            name="Nairobi - Thika",
            color="#2563EB"
        )

        db.session.add(route)
        db.session.flush()

        # -------------------------
        # STOPS
        # -------------------------
        stop1 = Stop(
            name="Nairobi CBD",
            longitude=36.8219,
            latitude=-1.2921
        )

        stop2 = Stop(
            name="Ruiru",
            longitude=36.9618,
            latitude=-1.1458
        )

        stop3 = Stop(
            name="Thika",
            longitude=37.0834,
            latitude=-1.0333
        )

        db.session.add_all([stop1, stop2, stop3])
        db.session.flush()

        # -------------------------
        # ROUTE STOPS
        # -------------------------
        route_stop1 = RouteStop(
            route_id=route.id,
            stop_id=stop1.id,
            sequence=1
        )

        route_stop2 = RouteStop(
            route_id=route.id,
            stop_id=stop2.id,
            sequence=2
        )

        route_stop3 = RouteStop(
            route_id=route.id,
            stop_id=stop3.id,
            sequence=3
        )

        db.session.add_all([
            route_stop1,
            route_stop2,
            route_stop3
        ])

        db.session.flush()

        # -------------------------
        # PASSENGER
        # -------------------------
        passenger = Passenger(
            email="passenger@example.com",
            password_hash="test-password",
            phone_number="0798765432"
        )

        db.session.add(passenger)

        # -------------------------
        # TRIP
        # -------------------------
        trip = Trip(
            origin_routestop_id=route_stop1.id,
            destination_routestop_id=route_stop3.id,
            vehicle_id=vehicle1.id,
            status="scheduled"
        )

        db.session.add(trip)

        db.session.commit()

        print("\nDatabase seeded successfully!")
        print(f"Sacco ID: {sacco.id}")
        print(f"Vehicle 1 ID: {vehicle1.id}")
        print(f"Vehicle 2 ID: {vehicle2.id}")
        print(f"Route ID: {route.id}")
        print(f"Trip ID: {trip.id}")


if __name__ == "__main__":
    seed_database()