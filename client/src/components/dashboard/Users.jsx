import { currentUser, users } from "../../data/dashboardData";

function Users() {
  const saccoUsers = users.filter(
    (user) => user.sacco_id === currentUser.sacco_id
  );

  return (
    <>
      <div className="dashboard-header users-header">
        <div>
          <h1>Sacco Users</h1>
          <p>Everyone registered under {currentUser.sacco}</p>
        </div>

        <button type="button" className="add-user-button">
          Add User
        </button>
      </div>

      <section className="dashboard-content users-grid">
        {saccoUsers.map((user) => (
          <article className="dashboard-card user-card" key={user.id}>
            <div className="user-avatar">
              {user.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <h2>{user.name}</h2>
            <p className="user-role">{user.role}</p>

            <div className="user-details">
              <span>{user.email}</span>
              <span>{user.phone_number}</span>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

export default Users;
