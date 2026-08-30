# Booking section

a) Home.jsx 

- Retrieve data from /api/v1/stops . The endpoint retrieves data in the following format.

```
{
    { id: "1", name: "Nyayo Stadium", position: [-1.3096, 36.8226] },
    { id: "2", name: "South B", position: [-1.3182, 36.8324] },
    { id: "3", name: "Airport North Road", position: [-1.3220, 36.8843] },      
    { id: "4", name: "JKIA", position: [-1.3192, 36.9278] },
    { id: "5", name: "Syokimau", position: [-1.3766, 36.9436] },
    { id: "6", name: "Athi River", position: [-1.4557, 36.9770] },
}
```

- Implement a search route endpoint. This endpoint should be triggered when after search, no matches are made amongst the default values. The locationdropdown should show a loading state, meanwhile. if they are truly no matches, it then shows the text 'No matches'. Else, it retrieves all similar stops. See SearchUsersResource for guidance on search implementation. 

- Implement a general route information route, /api/v1/routes/generalinfo, which retrieves only the id, name and color of all routes, no stops info

- Implement a passenger route-stop route, similar to ProviderRouteStopsResource.get() implementation, to get both the route-stop and the stop information, no longitude and latitude

- Add a useEffect hook, which fetches from /api/v1/routes/generalinfo, only once, on page load. On route selection, an API call to /api/v1/routes/<int:route_id>/stops to get the specific info on that route. 
    
- Add the following functionality for handleFindVehicles function:
	a) Retrieve the origin_routestop_id and destination_routestop_id from the selected origin and destination's route_ids
	b) Make an API call to /api/v1/trips, sending origin_stop_id, destination_stop_id and the current day's date as args
  
- Move data, steps, stats and featues, into json file in data folder
- Remove routehighlights data and code from line 189 to 192, and line 195 to 211

b) FindVehicles.jsx

- Analyze current implementation of initialOrigin, initialDestination and getStopById in FindVehicles.jsx.

- Use GET /api/v1/routes/<int:route_id> to send API requests on origin and stop information on the specific stops

c) Activity.jsx

- Significantly reduce size of image, make image size relative to viewport width
- Make image and text view state for no booking data
- Add an useEffect hook which fetches to /api/v1/me/bookings, make a component which be dynamically used for each item in response data
- Add buttons, page number buttons and per_page input at bottom for pagination

d) ProfilePage.jsx

- Add an useEffect hook which fetches from /api/v1/me and populates all necessary input. 
Remove edit profile button.
- Logout button should delete access token, stop refreshing, and redirect to login page

e) Book a Ride CTA button & Go To Dashboard in Hero.jsx

- Add logic which checks if the user's access token is valid, using /api/v1/me endpoint. If ok, redirect to homepage/ dashboard. If not, redirect to login page, and show error message.

f) main.jsx, AccountCreation.jsx, DashAccountCreation.jsx, DashLogin.jsx, Login.jsx

- Delete DashAccountCreation.jsx - non-essential. therefore, accountcreation is strictly for Passengers
- Remove the /dashsignup and /dashlogin routes in main.jsx
- Make Login component dynamic, add a user type button after title and description, title and text will change based on the user type. For operator title and description, copy from DashLogin.jsx
- Send login request to POST /api/v1/auth/login, send signup request to GET /api/v1/auth/register, save access_token to localStroage, use it as an auth token for further requests.
- Delete DashLogin.jsx

g) Home.jsx
- Implement a refresh token functionality, and store in localStorage after successful response.(Exact details to be done later)
    
# Dashboard

a) Summary.jsx

- Add a useEffect hook to fetch overview metrics and SACCO details from GET /api/v1/provider/dashboard on mount.
- Replace hardcoded card values with dynamic data:
  - Total Routes: metrics.total_routes
  - Total Bookings: metrics.total_bookings
  - Available Vehicles: metrics.active_vehicles
  - Total Vehicles: metrics.total_vehicles
- Display the authenticated provider user's name and SACCO name in the header greeting.
- Render the recent trips and recent bookings list returned by the dashboard endpoint.
- Add loading indicator and error handling during data fetching.

b) Vehicles.jsx & AddVehicleModal.jsx

- In Vehicles.jsx, add a useEffect hook to fetch SACCO vehicles from GET /api/v1/provider/vehicles with pagination parameters (page, per_page) and search query (q).
- Replace mock seedVehicles import with API response items.
- Bind the search bar to query GET /api/v1/provider/vehicles?q=<query> and route filter GET /api/v1/provider/vehicles?route_id=<route_id>.
- In AddVehicleModal.jsx, add input fields for vehicle number plate, capacity, and status. Send POST /api/v1/provider/vehicles with payload:
```
{
    "number_plate": "KXX 123A",
    "capacity": 33,
    "is_active": true
}
```
- Implement edit/status toggle via PATCH /api/v1/provider/vehicles/<int:vehicle_id> and vehicle deactivation/deletion via DELETE /api/v1/provider/vehicles/<int:vehicle_id>.
- Add pagination controls (page navigation and per_page selector) using total and total_pages from the API response.

c) Routes.jsx, RouteCard.jsx & RouteDetail.jsx

- In Routes.jsx, add a useEffect hook to fetch all routes from GET /api/v1/provider/routes (supports search query q and color filter). Remove mock routes from routesData.js.
- In RouteCard.jsx, display dynamic route name, color badge, description, and total assigned vehicles. Update card link to route by ID (/dashboard/routes/<int:route_id>).
- In RouteDetail.jsx, add a useEffect hook to fetch route details and ordered route stops from GET /api/v1/provider/routes/<int:route_id>.
- In RouteDetail.jsx, fetch vehicles assigned to this route using GET /api/v1/provider/vehicles?route_id=<int:route_id>.
- Fetch route trips using GET /api/v1/provider/routes/<int:route_id>/trips?from=&to=.
- Add trip creation functionality sending POST /api/v1/provider/routes/<int:route_id>/trips with payload:
```
{
    "origin_routestop_id": 1,
    "destination_routestop_id": 4,
    "vehicle_id": 2,
    "start_time": "2026-08-30T08:00:00Z",
    "stop_time": "2026-08-30T09:30:00Z",
    "status": "scheduled"
}
```
- Implement trip cancellation using PATCH /api/v1/provider/trips/<int:trip_id>/cancel.
- Allow viewing passenger bookings for a scheduled trip via GET /api/v1/provider/trips/<int:trip_id>/bookings.

d) Stops.jsx & AddStopModal.jsx

- In Stops.jsx, add a useEffect hook to fetch all stops using GET /api/v1/provider/stops (or GET /api/v1/stops). Remove seedStops mock data.
- In AddStopModal.jsx, replace mockApi call with POST /api/v1/provider/stops sending payload:
```
{
    "name": "CBD Stage",
    "latitude": -1.286389,
    "longitude": 36.817223
}
```
- Implement Edit button action to update stop details using PATCH /api/v1/provider/stops/<int:stop_id>.
- Implement Remove button action using DELETE /api/v1/provider/stops/<int:stop_id> with error handling if stop is attached to existing routes.

e) Users.jsx & AddUserModal.jsx

- In Users.jsx, add a useEffect hook to fetch SACCO staff using GET /api/v1/users with pagination (page, per_page). Remove static currentUser and seedUsers.
- Add search functionality using GET /api/v1/users/search?name=&email=.
- In AddUserModal.jsx, add password field and role selector (driver, conductor, manager). Send POST /api/v1/users with payload:
```
{
    "name": "Jane Kamau",
    "email": "jane@hopon.co.ke",
    "password": "TemporaryPassword123!",
    "phone_number": "+254712345678",
    "role": "driver"
}
```
- Add edit/delete support for users using PATCH /api/v1/users/<int:user_id> and DELETE /api/v1/users/<int:user_id>.
- Add pagination controls based on total and pages from GET /api/v1/users response.

f) Bookings.jsx

- Add a useEffect hook to fetch daily booking statistics from GET /api/v1/provider/booking-statistics?group_by=day (optionally sending from and to ISO datetime query parameters).
- Dynamically populate statistics cards:
  - Today's Bookings: count for current date
  - Total This Week: sum of 7-day bookings
  - Average Per Day: calculated average over the retrieved range
  - Busiest Day: day with highest booking count
- Update Chart.js dataset with dates and counts returned from the booking-statistics endpoint.
- Add a table section to fetch and display recent SACCO bookings using GET /api/v1/provider/bookings?page=1&per_page=5 (supports filtering by status, trip_id, route_id).

g) Profile.jsx

- Add a useEffect hook to fetch the authenticated provider user profile from GET /api/v1/me.
- Remove static currentUser import and populate avatar initials, full name, email, phone number, role, and SACCO name dynamically from response.
- Add error handling and redirect to login if user session is invalid.

h) Dashboard.jsx, Sidebar.jsx & API Client

- In Dashboard.jsx, add authentication verification on mount via GET /api/v1/me:
  - If token is missing, expired, or user role is not a provider ('driver', 'admin', 'manager'), redirect to /login.
- In Sidebar.jsx, update handleLogout to remove access_token and refresh_token from localStorage and navigate to /login.
- Create an API client helper in client/src/api to automatically attach Authorization: Bearer <access_token> header to all provider requests and handle 401 token refresh via POST /api/v1/auth/refresh.