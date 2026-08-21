import { useCallback, useEffect, useRef, useState } from "react";
// import SidebarButton from "./SidebarButton";
import "./Sidebar.css";

const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 420;

function Sidebar() {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const sidebarRef = useRef(null);
  const isResizing = useRef(false);

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

  const resetWidth = useCallback(() => setWidth(DEFAULT_WIDTH), []);

  return (
    <aside className="sidebar" ref={sidebarRef} style={{ width }}>
      <div className="sidebar-profile">
        <div className="profile-placeholder">P</div>

        <div>
          <h3>Provider</h3>
          <p>Service Provider</p>
        </div>
      </div>

      <nav className="sidebar-navigation">
        <span className="sidebar-nav-label">Menu</span>
        {/* <SidebarButton label="Dashboard" />
        <SidebarButton label="Routes" />
        <SidebarButton label="Bookings" />
        <SidebarButton label="Vehicles" />
        <SidebarButton label="Profile" /> */}
      </nav>

      <div className="sidebar-footer">
        {/* <SidebarButton label="Logout" /> */}
      </div>

      {/* Drag to resize. Double-click resets to the default width. */}
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