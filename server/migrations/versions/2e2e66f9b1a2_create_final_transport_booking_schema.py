"""create final transport booking schema

Revision ID: 2e2e66f9b1a2
Revises:
Create Date: 2026-08-25 14:45:46.357476
"""

from alembic import op
import sqlalchemy as sa


revision = "2e2e66f9b1a2"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "passengers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column("phone_number", sa.String(), nullable=True),
    )

    op.create_table(
        "routes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("color", sa.String(), nullable=False, unique=True),
    )

    op.create_table(
        "saccos",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("contact", sa.String(), nullable=False),
        sa.Column("address", sa.String(), nullable=True),
    )

    op.create_table(
        "stops",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
    )

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("sacco_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False, unique=True),
        sa.Column("email", sa.String(), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column("phone_number", sa.String(), nullable=True),
        sa.Column("role", sa.String(), nullable=False),
        sa.ForeignKeyConstraint(["sacco_id"], ["saccos.id"]),
    )

    op.create_table(
        "vehicles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("sacco_id", sa.Integer(), nullable=False),
        sa.Column("number_plate", sa.String(), nullable=False, unique=True),
        sa.Column("capacity", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.ForeignKeyConstraint(["sacco_id"], ["saccos.id"]),
    )

    op.create_table(
        "route_stops",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("route_id", sa.Integer(), nullable=False),
        sa.Column("stop_id", sa.Integer(), nullable=False),
        sa.Column("sequence", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["route_id"], ["routes.id"]),
        sa.ForeignKeyConstraint(["stop_id"], ["stops.id"]),
        sa.UniqueConstraint(
            "route_id",
            "sequence",
            name="uq_route_stops_route_sequence",
        ),
        sa.UniqueConstraint(
            "route_id",
            "stop_id",
            name="uq_route_stops_route_stop",
        ),
    )

    op.create_table(
        "trips",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("origin_routestop_id", sa.Integer(), nullable=False),
        sa.Column("destination_routestop_id", sa.Integer(), nullable=False),
        sa.Column("start_time", sa.DateTime(), nullable=False),
        sa.Column("stop_time", sa.DateTime(), nullable=True),
        sa.Column("vehicle_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="scheduled"),
        sa.ForeignKeyConstraint(
            ["origin_routestop_id"],
            ["route_stops.id"],
        ),
        sa.ForeignKeyConstraint(
            ["destination_routestop_id"],
            ["route_stops.id"],
        ),
        sa.ForeignKeyConstraint(
            ["vehicle_id"],
            ["vehicles.id"],
        ),
    )

    op.create_table(
        "bookings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("trip_id", sa.Integer(), nullable=True),
        sa.Column("origin_routestop_id", sa.Integer(), nullable=False),
        sa.Column("destination_routestop_id", sa.Integer(), nullable=False),
        sa.Column("made_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["passengers.id"]),
        sa.ForeignKeyConstraint(["trip_id"], ["trips.id"]),
        sa.ForeignKeyConstraint(
            ["origin_routestop_id"],
            ["route_stops.id"],
        ),
        sa.ForeignKeyConstraint(
            ["destination_routestop_id"],
            ["route_stops.id"],
        ),
    )


def downgrade():
    op.drop_table("bookings")
    op.drop_table("trips")
    op.drop_table("route_stops")
    op.drop_table("vehicles")
    op.drop_table("users")
    op.drop_table("stops")
    op.drop_table("saccos")
    op.drop_table("routes")
    op.drop_table("passengers")