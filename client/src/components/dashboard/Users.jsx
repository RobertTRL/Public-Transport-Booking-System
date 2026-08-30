import { useState } from "react";
import { currentUser, users as seedUsers } from "../../data/dashboardData";
import AddUserModal from "./AddUserModal";

function Users() {
  const [userList, setUserList] = useState(() =>
    seedUsers.filter((user) => user.sacco_id === currentUser.sacco_id)
  );
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddUser = (user) => {
    setUserList((list) => [
      {
        id: `user-${Date.now()}`,
        sacco_id: currentUser.sacco_id,
        ...user,
      },
      ...list,
    ]);
  };

  return (
    <>
      <div className="dashboard-header users-header">
        <div>
          <h1>Sacco Users</h1>
          <p>Everyone registered under {currentUser.sacco}</p>
        </div>

        <button
          type="button"
          className="add-user-button"
          onClick={() => setModalOpen(true)}
        >
          Add User
        </button>
      </div>

      <section className="dashboard-content users-grid">
        {userList.map((user) => (
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
              <span>{user.phone_number ?? user.phone}</span>
            </div>
          </article>
        ))}
      </section>

      {modalOpen && (
        <AddUserModal
          onClose={() => setModalOpen(false)}
          onCreated={handleAddUser}
        />
      )}
    </>
  );
}

export default Users;
