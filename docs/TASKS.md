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