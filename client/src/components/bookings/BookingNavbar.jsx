import { NavLink } from "react-router-dom";
import "../../styles/bookingnavbar.css";

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

       <NavLink to="/booking/activity" className="nav-btn">
        <span className="icon">📋</span>
        <span>Activity</span>
      </NavLink>

       <NavLink to="/booking/profile" className="nav-btn">
        <span className="icon">👤</span>
        <span>Profile</span>
      </NavLink>
    </nav>

    )
}

export default BookingNavbar