import { useCallback, useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Bus,
  Route,
  CalendarCheck,
  MapPin,
  Users,
  User,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SidebarButton from "./SidebarButton";
import { clearAccessToken } from "../../utils/auth";
import "../../styles/sidebar.css";

const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 420;
const COLLAPSED_WIDTH = 90;

function Sidebar({ isOpen = false, onClose }) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  const isResizing = useRef(false);
  const navigate = useNavigate();

  const stopResizing = useCallback(() => {
    if (!isResizing.current) return;

    isResizing.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const resize = useCallback((e) => {
    if (!isResizing.current || !sidebarRef.current) return;

    const { left } = sidebarRef.current.getBoundingClientRect();
    const nextWidth = e.clientX - left;

    if (nextWidth < MIN_WIDTH) {
      setIsCollapsed(true);
      setWidth(COLLAPSED_WIDTH);
      return;
    }

    setIsCollapsed(false);
    setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, nextWidth)));
  }, []);

  const startResizing = useCallback((e) => {
    e.preventDefault();

    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const resetWidth = useCallback(() => {
    setIsCollapsed(false);
    setWidth(DEFAULT_WIDTH);
  }, []);

  const handleLogout = () => {
    clearAccessToken();
    navigate("/login");
  };

  return (
    <aside
      className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
        isOpen ? "open" : ""
      }`}
      ref={sidebarRef}
      style={{ width }}
    >
      <nav className="sidebar-navigation">
        <span className="sidebar-nav-label">Menu</span>

        <SidebarButton
          icon={<LayoutDashboard size={18} />}
          route="/dashboard"
          text="Overview"
          end
          onClick={onClose}
        />

        <SidebarButton
          icon={<Bus size={18} />}
          route="/dashboard/vehicles"
          text="Vehicles"
          onClick={onClose}
        />

        <SidebarButton
          icon={<Route size={18} />}
          route="/dashboard/routes"
          text="Routes"
          onClick={onClose}
        />

        <SidebarButton
          icon={<CalendarCheck size={18} />}
          route="/dashboard/bookings"
          text="Bookings"
          onClick={onClose}
        />

        <SidebarButton
          icon={<MapPin size={18} />}
          route="/dashboard/stops"
          text="Stops"
          onClick={onClose}
        />

        <SidebarButton
          icon={<Users size={18} />}
          route="/dashboard/users"
          text="Users"
          onClick={onClose}
        />

        <SidebarButton
          icon={<User size={18} />}
          route="/dashboard/profile"
          text="Profile"
          onClick={onClose}
        />
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      <div
        className="sidebar-resize-handle"
        onMouseDown={startResizing}
        onDoubleClick={resetWidth}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
      />
    </aside>
  );
}

export default Sidebar;