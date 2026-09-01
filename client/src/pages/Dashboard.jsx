import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";
import { getAccessToken, clearTokens } from "../utils/auth";
import { getCurrentUser } from "../api/client";
import "../styles/dashboard.css";

const PROVIDER_ROLES = ["driver", "admin", "manager"];

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function verifyProviderSession() {
      if (!getAccessToken()) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const user = await getCurrentUser();

        if (!PROVIDER_ROLES.includes(user.role)) {
          clearTokens();
          navigate("/login", { replace: true });
          return;
        }

        if (mounted) {
          setCheckingAuth(false);
        }
      } catch {
        clearTokens();
        navigate("/login", { replace: true });
      }
    }

    verifyProviderSession();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="dashboard-shell">
        <main className="dashboard-main">
          <p>Checking your session...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar">
        <button
          type="button"
          className="sidebar-toggle"
          aria-label="Toggle sidebar"
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <Menu size={20} />
        </button>

        <h1>Hop On Dashboard</h1>
      </header>

      <div className="dashboard">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;