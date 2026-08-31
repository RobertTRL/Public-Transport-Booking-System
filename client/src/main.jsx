import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import apiClient from "./api/axios";

import App from "./pages/App.jsx";
import DashLogin from "./pages/DashLogin.jsx";
import DashAccountCreation from "./pages/DashAccountCreation.jsx";
import Login from "./pages/Login.jsx";
import AccountCreation from "./pages/AccountCreation.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import DashboardSummary from "./components/dashboard/Summary.jsx";
import Bookings from "./components/dashboard/Bookings.jsx";

import RoutesPage from "./pages/Routes.jsx";
import Stops from "./pages/Stops.jsx";
import Vehicles from "./pages/Vehicles.jsx";
import RouteDetail from "./pages/RouteDetail.jsx";

import Users from "./components/dashboard/Users.jsx";
import Profile from "./components/dashboard/Profile.jsx";

import ProfilePage from "./components/bookings/ProfilePage.jsx";
import Home from "./components/bookings/Home.jsx";
import Homepage from "./pages/Homepage.jsx";
import FindVehicles from "./components/bookings/FindVehicles.jsx";
import Activity from "./components/bookings/Activity.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        <Route path="/dashlogin" element={<DashLogin />} />
        <Route path="/dashsignup" element={<DashAccountCreation />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<AccountCreation />} />

        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardSummary />} />

          <Route
            path="vehicles"
            element={<Vehicles apiClient={apiClient} />}
          />

          <Route
            path="routes"
            element={<RoutesPage apiClient={apiClient} />}
          />

          <Route
            path="routes/:routeId"
            element={<RouteDetail apiClient={apiClient} />}
          />

          <Route path="bookings" element={<Bookings />} />

          <Route
            path="stops"
            element={<Stops apiClient={apiClient} />}
          />

          <Route path="users" element={<Users />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/home" element={<Homepage />}>
          <Route index element={<Home />} />
          <Route path="map" element={<FindVehicles />} />
          <Route path="activity" element={<Activity />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);