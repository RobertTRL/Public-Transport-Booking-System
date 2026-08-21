import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./pages/App.jsx";
import Login from "./pages/Login.jsx";
import AccountCreation from "./pages/AccountCreation.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Bookings from "./pages/Bookings.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import Home from "./pages/Home.jsx";
import DashboardSummary from "./components/Summary.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<AccountCreation />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardSummary/>}/>
        </Route>
        <Route path="/bookings" element={<Bookings />} />
        {/* booking sub routes */}
        <Route index element={<Homepage />} />
        <Route path = "map" element={<BookingMap />}
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
