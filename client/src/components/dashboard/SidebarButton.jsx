import { NavLink } from "react-router-dom";

function SidebarButton({ icon, route, text, end = false }) {
  return (
    <NavLink
      to={route}
      end={end}
      className={({ isActive }) =>
        `sidebar-button ${isActive ? "active" : ""}`
      }
    >
      <span className="sidebar-button-icon">{icon}</span>
      <span className="sidebar-button-text">{text}</span>
    </NavLink>
  );
}

export default SidebarButton;