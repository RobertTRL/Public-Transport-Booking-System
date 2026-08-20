import { useState } from "react";
import "../styles/user.css";
function Profile() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    console.log("Logout clicked");
    setIsOpen(false);
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

          <button type="button" className="profile-menu-item">
            My Profile
          </button>

          <button type="button" className="profile-menu-item">
            My Bookings
          </button>

          <button type="button" className="profile-menu-item">
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