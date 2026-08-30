# Public Transport Booking System

A full-stack transport management and seat booking application for passengers and SACCO fleet operators.

---

## Features

- **Authentication & IAM**: Dual-role JWT authentication supporting passengers and SACCO provider users with secure access tokens (15-minute validity) and token refreshing.
- **Passenger Endpoints**: Route search, stop exploration, scheduled trips availability, and booking lifecycle (create, view, and cancel).
- **Provider Dashboard & Fleet Management**: Route configuration, route stops sequencing, vehicle fleets, and booking analytics.

---

## Project Structure

```
├── server/
│   ├── app.py                     # Application entry point & API route registration
│   ├── config.py                  # App, database, and JWT configuration
│   ├── models.py                  # SQLAlchemy ORM models
│   ├── schemas.py                 # Marshmallow validation schemas
│   ├── seed.py                    # Seed database script
│   ├── resources/
│   │   ├── auth_endpoints.py      # Authentication & Token Refresh resources
│   │   ├── passenger/             # Passenger-side API endpoints & helpers
│   │   └── provider/              # Provider-side API endpoints & helpers
│   ├── migrations/                # Alembic migration scripts
│   └── tests/                     # Automated pytest test suites
└── docs/
    ├── passenger_api_postman_collection.json  # Postman collection
    └── passenger_testing_guide.md             # Testing guide
```

---

## Getting Started

### 1. Database Setup & Migrations
```bash
cd server
flask db upgrade
python seed.py
```

### 2. Running the API Server
```bash
python app.py
```
The server will start on `http://127.0.0.1:5000`.

### 3. Running Automated Tests
```bash
pytest
```

---

## Authentication & Token Refresh Flow

1. **Login**: `POST /api/v1/auth/login` returns an `access_token` and `refresh_token`.
2. **Accessing Endpoints**: Pass `Authorization: Bearer <access_token>` in request headers.
3. **Refreshing Tokens**: When access token nears expiration (after ~14 minutes), call `POST /api/v1/auth/refresh` with `Authorization: Bearer <refresh_token>` to obtain a fresh access token without re-entering credentials.
