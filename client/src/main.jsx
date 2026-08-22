import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./pages/App.jsx";
import Login from "./pages/Login.jsx";
import AccountCreation from "./pages/AccountCreation.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Bookings from "./components/dashboard/Bookings.jsx";
import RoutesPage from "./components/dashboard/Routes.jsx";
import Stops from "./components/dashboard/Stops.jsx";
import Vehicles from "./components/dashboard/Vehicles.jsx";

import ProfilePage from "./pages/ProfilePage.jsx";
import Home from "./pages/Home.jsx";
import DashboardSummary from "./components/dashboard/Summary.jsx";
// import Homepage from "./pages/Booking/Homepage.jsx"
// import BookingMap from "./pages/Booking/BookingMap.jsx"
// import Activity from "./pages/Booking/Activity.jsx"
// import Profile from "./pages/Booking/Profile.jsx"


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<AccountCreation />} />
        <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<DashboardSummary />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="routes" element={<RoutesPage />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="stops" element={<Stops />} />
        </Route>
        <Route path="/home" element={<Home />}/>
        <Route path="/booking" element={<Bookings />} >
        {/* booking sub routes */}
          {/* <Route index element={<Homepage />} />
          <Route path="map" element={<BookingMap />} /> 
          <Route path="activity" element={<Activity />} />
          <Route path="profile" element={<Profile />} /> */ }
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
