import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/user.css";

function Profile() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleProfile = () => {
    setIsOpen(false);
    navigate("/profile");
  };

  const handleBookings = () => {
    setIsOpen(false);
    navigate("/bookings");
  };

  const handleSettings = () => {
    setIsOpen(false);
    console.log("Settings clicked");
  };

  const handleLogout = () => {
    setIsOpen(false);
    navigate("/login");
  };

  return (
    <div className="profile">
      <button
        type="button"
        className="profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Open profile menu"
      >
        <span className="profile-avatar">S</span>

        <span className="profile-info">
          <strong>Stephen Muasya</strong>
          <small>Passenger</small>
        </span>

        <span className="profile-chevron">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && (
        <div className="profile-menu">
          <div className="profile-menu-header">
            <span className="profile-avatar profile-avatar-large">
              S
            </span>

            <div>
              <strong>Stephen Muasya</strong>
              <small>Passenger account</small>
            </div>
          </div>

          <div className="profile-menu-divider" />

          <button
            type="button"
            className="profile-menu-item"
            onClick={handleProfile}
          >
            My Profile
          </button>

          <button
            type="button"
            className="profile-menu-item"
            onClick={handleBookings}
          >
            My Bookings
          </button>

          <button
            type="button"
            className="profile-menu-item"
            onClick={handleSettings}
          >
            Settings
          </button>

          <div className="profile-menu-divider" />

          <button
            type="button"
            className="profile-menu-item logout"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default Profile;