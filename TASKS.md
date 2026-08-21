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

- Overview - Not done
- Vehicles with info, schedule and route - Not done
- Routes with stops - view routes, buses going through specific routes - Not done
- Add/edit/remove stop(s) - Not done
- Bookings info - who booked, stop, when, vehicle booked etc - Not done
 
**b) Booking panel** i.e Passenger side

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