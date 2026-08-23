import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import "../styles/dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar">
        <h1>Hop On Dashboard</h1>
      </header>

      <div className="dashboard">
        <Sidebar />

        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;