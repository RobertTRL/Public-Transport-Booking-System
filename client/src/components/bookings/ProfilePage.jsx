import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../api/client";
import { clearAccessToken, getAccessToken } from "../../utils/auth";
import "../../styles/user.css";

function ProfilePage() {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    accountType: "Passenger",
  });

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      if (!getAccessToken()) {
        navigate("/login", {
          replace: true,
          state: { error: "Please log in to continue." },
        });
        return;
      }

      try {
        const data = await getCurrentUser("passenger");

        if (!isActive) return;

        const formattedName =
          data?.name ||
          data?.email?.split("@")[0]?.replace(/[._-]+/g, " ") ||
          "Passenger";

        setProfile({
          name: formattedName
            .split(" ")
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" "),
          email: data?.email || "",
          phone: data?.phone_number || "",
          accountType: "Passenger",
        });
      } catch (err) {
        if (!isActive) return;

        if (err?.status === 401) {
          clearAccessToken();
          navigate("/login", {
            replace: true,
            state: { error: "Please log in to continue." },
          });
          return;
        }

        setError(err?.message || "Unable to load your profile.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((currentProfile) => ({
      ...currentProfile,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setIsEditing(false);

    console.log("Profile updated:", profile);
  };

  const handleLogout = () => {
    clearAccessToken();
    navigate("/login");
  };

  if (loading) {
    return (
      <main className="profile-page">
        <section className="profile-container">
          <p>Loading profile...</p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="profile-page">
        <section className="profile-container">
          <p>{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <section className="profile-container">
        <div className="profile-heading">
          <div>
            <h1>Profile</h1>
            <p>Manage your personal information and account settings.</p>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-top">
            <div className="profile-avatar">
              {profile.name ? profile.name.charAt(0).toUpperCase() : "P"}
            </div>

            <div className="profile-info">
              <h2>{profile.name}</h2>
              <p>{profile.email}</p>

              <span className="profile-badge">
                {profile.accountType}
              </span>
            </div>
          </div>

          <div className="profile-divider" />

          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="profile-form-group">
              <label htmlFor="name">Full name</label>

              <input
                id="name"
                name="name"
                type="text"
                value={profile.name}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="phone">Phone number</label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="accountType">Account type</label>

              <input
                id="accountType"
                type="text"
                value={profile.accountType}
                disabled
                readOnly
              />
            </div>

            <div className="profile-actions">
              <button
                type="button"
                className="profile-button danger"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          </form>
        </div>

        <div className="profile-card account-settings">
          <h2>Account Settings</h2>

          <p>Manage your account security and session.</p>

          <div className="settings-actions">
            <button
              type="button"
              className="profile-button secondary"
              onClick={() => console.log("Change password clicked")}
            >
              Change Password
            </button>

            <button
              type="button"
              className="profile-button danger"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProfilePage;