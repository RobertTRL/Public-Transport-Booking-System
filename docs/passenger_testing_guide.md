# Passenger Endpoints & JWT Token Refresh Testing Guide

This guide outlines how to run, seed, and test all Passenger-side endpoints and JWT Token Refresh functionality.

---

## 1. Setup & Seeding

1. **Activate Virtual Environment & Run Migrations**:
   ```bash
   flask db upgrade
   ```
2. **Seed the SQLite Database with Nairobi Transport Data**:
   ```bash
   python seed.py
   ```
3. **Start the API Server**:
   ```bash
   python app.py
   ```
   The server runs by default at `http://127.0.0.1:5000`.

---

## 2. Seed Data Test Credentials

| Role | Name | Email | Password | ID |
| :--- | :--- | :--- | :--- | :--- |
| **Passenger 1** | Mary | `mary@example.com` | `password123` | 1 |
| **Passenger 2** | James | `james@example.com` | `password123` | 2 |
| **Passenger 3** | Susan | `susan@example.com` | `password123` | 3 |
| **Provider (Admin)** | Peter Mwangi | `peter@supermetro.co.ke` | `password123` | 1 |

---

## 3. Postman / cURL Test Scenarios

### Authentication & Token Refresh Flow

#### 1. Passenger Login (`POST /api/v1/auth/login`)
- **Request Body**:
  ```json
  {
    "user_type": "passenger",
    "email": "mary@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access_token": "<jwt_access_token>",
    "refresh_token": "<jwt_refresh_token>"
  }
  ```

#### 2. Token Refresh (`POST /api/v1/auth/refresh`)
- **Headers**: `Authorization: Bearer <refresh_token>`
- **Response (200 OK)**:
  ```json
  {
    "access_token": "<new_jwt_access_token>"
  }
  ```
- *Note: Recommended to request every 14 minutes to maintain valid access.*

---

### Route Endpoints

#### 3. Search Routes (`GET /api/v1/routes/search`)
- **Query Parameters**:
  - `origin_stop_id=1` (Archives)
  - `destination_stop_id=4` (Westlands)
- **Response (200 OK)**:
  Returns list of routes covering the segment in sequence (Route 46 - Kikuyu Line).

#### 4. Route Detail (`GET /api/v1/routes/<route_id>`)
- **URL**: `http://127.0.0.1:5000/api/v1/routes/1`
- **Response (200 OK)**:
  Returns Route 46 with ordered `route_stops` (Archives, Railways, Museum Hill, Westlands, Kangemi, Kikuyu).

---

### Stops Endpoint

#### 5. List Boarding Stops (`GET /api/v1/stops`)
- **Query Parameters**:
  - `page=1`
  - `per_page=5`
- **Response (200 OK)**:
  Returns paginated list of stops alphabetically sorted (`total: 16`, `total_pages: 4`).

---

### Trip Endpoints

#### 6. Search Available Trips (`GET /api/v1/trips`)
- **Query Parameters**:
  - `origin_routestop_id=1`
  - `destination_routestop_id=4`
  - `date=YYYY-MM-DD` (e.g. today's date)
- **Response (200 OK)**:
  Returns scheduled trips along with assigned vehicle capacity and details.

#### 7. Trip Detail (`GET /api/v1/trips/<trip_id>`)
- **URL**: `http://127.0.0.1:5000/api/v1/trips/1`
- **Response (200 OK)**:
  Returns single trip details.

#### 8. Trip Seat Availability (`GET /api/v1/trips/<trip_id>/availability`)
- **Query Parameters**:
  - `origin_routestop_id=1`
  - `destination_routestop_id=4`
- **Response (200 OK)**:
  ```json
  {
    "trip_id": 1,
    "capacity": 33,
    "booked_seats": 1,
    "available_seats": 32
  }
  ```

---

### Booking Endpoints

#### 9. Create Booking (`POST /api/v1/bookings`)
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "trip_id": 2,
    "origin_routestop_id": 7,
    "destination_routestop_id": 10
  }
  ```
- **Response (201 Created)**:
  Returns created booking with passenger, trip, and stop information.

#### 10. List My Bookings (`GET /api/v1/me/bookings`)
- **Headers**: `Authorization: Bearer <access_token>`
- **Query Parameters**: `page=1`, `per_page=5`
- **Response (200 OK)**:
  Returns all bookings belonging to the authenticated passenger.

#### 11. Booking Detail (`GET /api/v1/bookings/<booking_id>`)
- **Headers**: `Authorization: Bearer <access_token>`
- **Response (200 OK)**:
  Returns booking details for the authorized owner (returns 403 if accessed by another user).

#### 12. Cancel Booking (`PATCH /api/v1/bookings/<booking_id>/cancel`)
- **Headers**: `Authorization: Bearer <access_token>`
- **Response (200 OK)**:
  ```json
  {
    "message": "Booking cancelled successfully.",
    "booking": {
      "id": 1,
      "status": "cancelled"
    }
  }
  ```
