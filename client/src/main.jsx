import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import { getAccessToken, clearTokens } from "./utils/auth";
import { getCurrentUser } from "./api/client";

import App from "./pages/App.jsx";
import Login from "./pages/Login.jsx";
import AccountCreation from "./pages/AccountCreation.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import DashboardSummary from "./components/dashboard/Summary.jsx";
import Bookings from "./components/dashboard/Bookings.jsx";
import Users from "./components/dashboard/Users.jsx";
import Profile from "./components/dashboard/Profile.jsx";
import RoutesPage from "./components/dashboard/Routes.jsx";
import RouteDetail from "./components/dashboard/RouteDetail.jsx";
import Stops from "./components/dashboard/Stops.jsx";
import Vehicles from "./components/dashboard/Vehicles.jsx";

import ProfilePage from "./components/bookings/ProfilePage.jsx";
import Home from "./components/bookings/Home.jsx";
import Homepage from "./pages/Homepage.jsx";
import FindVehicles from "./components/bookings/FindVehicles.jsx";
import Activity from "./components/bookings/Activity.jsx";

function RequireAuth({ children, userType = "passenger" }) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function checkAuth() {
      const token = getAccessToken();

      if (!token) {
        navigate("/login", {
          replace: true,
          state: { error: "Please log in to continue." },
        });
        return;
      }

      try {
        await getCurrentUser(userType);

        if (isActive) {
          setReady(true);
        }
      } catch (error) {
        clearTokens();

        if (isActive) {
          navigate("/login", {
            replace: true,
            state: { error: "Please log in to continue." },
          });
        }
      }
    }

    checkAuth();

    return () => {
      isActive = false;
    };
  }, [navigate, userType]);

  if (!ready) {
    return <div>Checking your session...</div>;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<AccountCreation />} />

      <Route
        path="/dashboard"
        element={
          <RequireAuth userType="user">
            <Dashboard />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardSummary />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="routes" element={<RoutesPage />} />
        <Route path="routes/:routeId" element={<RouteDetail />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="stops" element={<Stops />} />
        <Route path="users" element={<Users />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route
        path="/home"
        element={
          <RequireAuth userType="passenger">
            <Homepage />
          </RequireAuth>
        }
      >
        <Route index element={<Home />} />
        <Route path="map" element={<FindVehicles />} />
        <Route path="activity" element={<Activity />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>
);
