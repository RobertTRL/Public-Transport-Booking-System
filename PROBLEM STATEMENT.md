# Problem Statement - Public Transport Booking System

Public transport systems in Nairobi, primarily ran by *matatus* and buses, are quite informal, haphazard and chaotic. Passengers have no reliable methods of reserving seats, planning and inspecting routes, especially during rush hours. They mostly rely on informal knowledge and hearsay from other passengers on routes, arrival times and stops. 

In the same light, most public transport operators have no formal methods of displaying transport routes, schedules, stops and vehicle availability. They therefore resort to using their informal systems, which is inefficient, borderline misleading, and raises dissatisfaction to passengers, especially to new ones.

Most solutions only address one of the problems mentioned, whether providing route maps with stops, touts verbally announcing vehicle availability, passengers queueing to take seats on vehicle arrival and control backlog, or passengers manually checking said routes on platforms like Google Maps.

This project fills that gap with a simple and lightweight MVP: a public transport booking system where passengers can view route maps and stops, look up and reserve seats for available routes.

Service providers can add routes with stops and manage the routes they operate in.

## Objectives (for MVP)

1. Let a passenger search for a trip between an origin and a destination and see matching routes.
2. Let a passenger book a specific trip on a route.
3. Let a service provider register, then add/edit/remove their own routes, with stops and a schedule.
4. Give a service provider a simple dashboard to see bookings made on their routes.
5. Use an external map provider for place search and route visualization.

## Project Scope
### 1. Passenger side
- Search by origin/destination
- View matching route(s) with stops, on a map
- View available trips for a route (date/time, price if applicable)
- Book a trip (creates a booking record tied to passenger + trip)
- View own booking history/status

### 2. Service Provider side
- Provider account (register/login)
- Dashboard to add a new route: name, list of stops and schedule (departure times/frequency)
- Dashboard to edit/deactivate an existing route
- Dashboard to view bookings made against their routes

## Tech Stack

- React - Frontend
- Flask - Backend
- PostgreSQL - Database
- External API - ?
- Vercel - Hosting