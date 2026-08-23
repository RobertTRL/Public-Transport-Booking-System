import { NavLink } from "react-router-dom";
import "../../styles/bookingnavbar.css";

import homeFilled from "../../assets/home-fill.webp";
import homeOutline from "../../assets/home-outline.webp";
import mapFilled from "../../assets/map-fill.webp";
import mapOutline from "../../assets/map-outline.webp";
import activityFilled from "../../assets/bus-fill.webp";
import activityOutline from "../../assets/bus-outline.webp";
import profileFilled from "../../assets/user-fill.webp";
import profileOutline from "../../assets/user-outline.webp";

const navItems = [
  { to: "/home", end: true, label: "Home", filled: homeFilled, outline: homeOutline },
  { to: "/home/map", label: "Map", filled: mapFilled, outline: mapOutline },
  { to: "/home/activity", label: "Activity", filled: activityFilled, outline: activityOutline },
  { to: "/home/profile", label: "Profile", filled: profileFilled, outline: profileOutline },
];

function BookingNavbar() {
  return (
    <nav className="booking-navbar">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `nav-btn${isActive ? " nav-btn--active" : ""}`
          }
        >
          {({ isActive }) => (
            <>
              <img
                src={isActive ? item.outline : item.filled}
                alt=""
                className="nav-btn__icon"
              />
              <span className="nav-btn__label">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default BookingNavbar;