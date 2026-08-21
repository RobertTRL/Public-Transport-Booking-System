import SidebarButton from "./SidebarButton";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-profile">
        <div className="profile-placeholder">
          P
        </div>

        <div>
          <h3>Passenger</h3>
          <p>Passenger Account</p>
        </div>
      </div>

      <nav className="sidebar-navigation">
        <SidebarButton label="Dashboard" to="/dashboard" />
        <SidebarButton label="Routes" to="/routes" />
        <SidebarButton label="Bookings" to="/bookings" />
        <SidebarButton label="Profile" to="/profile" />
      </nav>

      <div className="sidebar-footer">
        <SidebarButton label="Logout" to="/login" />
      </div>
    </aside>
  );
}

export default Sidebar;