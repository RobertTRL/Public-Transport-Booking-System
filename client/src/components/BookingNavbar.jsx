import { NavLink } from "react-router-dom";
import "../styles/bookings.css";

function BookingNavbar(){
    return(
    <nav className="booking-navbar">
      <NavLink to="/booking" end className="nav-btn">
        <span className="icon">🏠</span>
        <span>Home</span>
      </NavLink>

      <NavLink to="/booking/map" className="nav-btn">
        <span className="icon">🗺️</span>
        <span>Map</span>
      </NavLink>
    </nav>

    )
}