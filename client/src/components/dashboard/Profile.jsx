import { currentUser } from "../../data/dashboardData";

function Profile() {
  const initials = currentUser.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <div className="dashboard-header">
        <h1>My Profile</h1>
        <p>Your account information</p>
      </div>

      <section className="dashboard-card profile-card">
        <div className="profile-avatar">{initials}</div>

        <div className="profile-info">
          <h2>{currentUser.name}</h2>
          <p className="profile-role">
            {currentUser.role} &middot; {currentUser.sacco}
          </p>

          <dl className="profile-fields">
            <div>
              <dt>Email</dt>
              <dd>{currentUser.email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{currentUser.phone_number}</dd>
            </div>
            <div>
              <dt>Sacco</dt>
              <dd>{currentUser.sacco}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{currentUser.role}</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}

export default Profile;
