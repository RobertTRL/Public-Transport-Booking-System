# Project Tasks

The project tasks will be divided into two main sections: Frontend and Backend(including hosting and database)

## 1. Frontend

**a) Dashboard** i.e Service provider Side

- Account creation page
- Actual dashboard
- Search bar
- Logout button
- Sidebar panel
- Profile (within sidebar)
- Footer
- Header 
- Main content
- Buttons to specific items
- Delete route
- Create route (map)
- View routes (map)
- View bookings
- View specific route
- Homepage - display data
- Routes, no. of customers who've booked, vehicle availability, number of vehicles, map showing all routes with stops 
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
- Authentication
- Continue with Google functionality
- Login page (passengers, service operators)
## 2. Backend