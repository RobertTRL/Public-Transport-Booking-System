import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import "../styles/dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">
      {/* To do: Add dashboard header, spans across screens, stays on top */}
      <Sidebar />

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}

export default Dashboard;