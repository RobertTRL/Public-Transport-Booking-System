import React from "react";
import SidebarButton from "./SidebarButton";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-profile">
        <div className="profile-placeholder">
          P
        </div>

        <div>
          <h3>Provider</h3>
          <p>Service Provider</p>
        </div>
      </div>

      <nav className="sidebar-navigation">
        <SidebarButton label="Dashboard" />
        <SidebarButton label="Routes" />
        <SidebarButton label="Bookings" />
        <SidebarButton label="Vehicles" />
        <SidebarButton label="Profile" />
      </nav>

      <div className="sidebar-footer">
        <SidebarButton label="Logout" />
      </div>
    </aside>
  );
}

export default Sidebar;