import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, apiGet } from "../../api/client";
import { clearTokens } from "../../utils/auth";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [saccoName, setSaccoName] = useState("—");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const [profile, dashboard] = await Promise.all([
          getCurrentUser(),
          apiGet("/api/v1/provider/dashboard"),
        ]);

        if (!mounted) return;

        setUser(profile);
        setSaccoName(dashboard.provider?.sacco?.name || "—");
      } catch (err) {
        if (!mounted) return;

        if (err.status === 401) {
          clearTokens();
          navigate("/login", { replace: true });
          return;
        }

        setError(err.message || "Unable to load your profile.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="dashboard-header">
        <h1>My Profile</h1>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-header">
        <h1>My Profile</h1>
        <p>{error}</p>
      </div>
    );
  }

  const initials = getInitials(user?.name);

  return (
    <>
      <div className="dashboard-header">
        <h1>My Profile</h1>
        <p>Your account information</p>
      </div>

      <section className="dashboard-card profile-card">
        <div className="profile-avatar">{initials}</div>

        <div className="profile-info">
          <h2>{user?.name}</h2>

          <p className="profile-role">
            {user?.role} &middot; {saccoName}
          </p>

          <dl className="profile-fields">
            <div>
              <dt>Email</dt>
              <dd>{user?.email || "—"}</dd>
            </div>

            <div>
              <dt>Phone</dt>
              <dd>{user?.phone_number || "—"}</dd>
            </div>

            <div>
              <dt>Sacco</dt>
              <dd>{saccoName}</dd>
            </div>

            <div>
              <dt>Role</dt>
              <dd>{user?.role || "—"}</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}

export default Profile;