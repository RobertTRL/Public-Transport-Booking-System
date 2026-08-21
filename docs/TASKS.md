# Project Tasks

The project tasks will be divided into two main sections: Frontend and Backend(including hosting and database)

## 1. Frontend

**a) Dashboard** i.e Service provider Side

- Account creation page - Done
- Actual dashboard - Done
- Search bar - Done, not checked
- Logout button - Not done
- Sidebar panel - Done
- Profile (within sidebar) - not done within expectation
- Footer - Done
- Header - Done
- Main content - Done
- Buttons to specific items - Not done
- Dashboard header - Not done
- Overview - Not done
- Vehicles with info, schedule and route - Not done
- Routes with stops - view routes, buses going through specific routes - Not done
- Add/edit/remove stop(s) - Not done
- Bookings info - who booked, stop, when, vehicle booked etc - Not done
 
**b) Booking panel** i.e Passenger side

- Navbar - Not done
- Home page - Not done -> Banner, View map, Book a ride, search bar - 
               from search bar renders on search bar click.
               One enters values. Routes to map showing location on map,
               with options

- Map - Not done -> search bar with from and to inputs, on fills, shows location points on map.
        shows available buses going through that route, allows one to pick
        Once one picks that bus, displays relevant information, after 5 minutes tells 
        someone bus arrives.

- Activity - Not done -> Shows all bookings made by user
- Profile - Not done -> shows relevant user details
 
    
**c) Shared features**

- Frontend initialization - Done
- File Structure Setup i.e - Done
```
public/
├── data/
│   └── ...             # where data that one wants to expose will be placed
└── images/                  

src/
├── assets/                  
├── components/               
│   ├── SearchBar.jsx
│   └── ...
├── hooks/
│   ├── useInView.js
│   └── ...          
├── data/
│   ├── db.json                
│   └── ...         
├── styles/                    
│   ├── App.css
│   ├── index.css           # where common styles will be placed
│   └── ...
├── pages/                    
│   ├── App.jsx
│   └── ...
│
└── main.jsx                # entry point

```
- Authentication - Backend
- Continue with Google functionality - Backend
- Login page (passengers, service operators) - Not done well
## 2. Backend