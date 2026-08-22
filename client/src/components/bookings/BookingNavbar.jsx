import { NavLink } from "react-router-dom";
import "../../styles/bookingnavbar.css";

// Placeholder paths — swap these for your real icon files
import homeFilled from "../../assets/icons/home-filled.svg";
import homeOutline from "../../assets/icons/home-outline.svg";
import mapFilled from "../../assets/icons/map-filled.svg";
import mapOutline from "../../assets/icons/map-outline.svg";
import activityFilled from "../../assets/icons/activity-filled.svg";
import activityOutline from "../../assets/icons/activity-outline.svg";
import profileFilled from "../../assets/icons/profile-filled.svg";
import profileOutline from "../../assets/icons/profile-outline.svg";

const navItems = [
  { to: "/booking", end: true, label: "Home", filled: homeFilled, outline: homeOutline },
  { to: "/booking/map", label: "Map", filled: mapFilled, outline: mapOutline },
  { to: "/booking/activity", label: "Activity", filled: activityFilled, outline: activityOutline },
  { to: "/booking/profile", label: "Profile", filled: profileFilled, outline: profileOutline },
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