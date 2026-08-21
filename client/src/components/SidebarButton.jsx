import { NavLink } from "react-router-dom";

function SidebarButton({ label, to }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `sidebar-button ${isActive ? "active" : ""}`
      }
    >
      {label}
    </NavLink>
  );
}

export default SidebarButton;