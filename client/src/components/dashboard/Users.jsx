import { useEffect, useState } from "react";
import AddUserModal from "./AddUserModal";
import { apiGet } from "../../api/client";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Users() {
  const [userList, setUserList] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchUsers() {
      setLoading(true);
      setError("");

      try {
        let data;

        if (search.trim()) {
          const params = new URLSearchParams({
            name: search.trim(),
            email: search.trim(),
          });

          data = await apiGet(`/api/v1/users/search?${params.toString()}`);
        } else {
          const params = new URLSearchParams({
            page: String(page),
            per_page: "10",
          });

          data = await apiGet(`/api/v1/users?${params.toString()}`);
        }

        if (cancelled) return;

        const users = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
            ? data.data
            : Array.isArray(data.users)
              ? data.users
              : [];

        const total =
          data?.meta?.total_pages ||
          data?.total_pages ||
          Math.max(1, Math.ceil(users.length / 10));

        setUserList(users);
        setTotalPages(total);
      } catch (err) {
        if (cancelled) return;

        setUserList([]);
        setTotalPages(1);
        setError(err.message || "Unable to load users.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleAddUser = (user) => {
    setUserList((list) => [user, ...list]);
  };

  return (
    <>
      <div className="dashboard-header users-header">
        <div>
          <h1>Sacco Users</h1>
          <p>Manage users registered under your SACCO.</p>
        </div>

        <button
          type="button"
          className="add-user-button"
          onClick={() => setModalOpen(true)}
        >
          Add User
        </button>
      </div>

      <section className="dashboard-content">
        <div className="users-toolbar">
          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={handleSearch}
            aria-label="Search users"
          />
        </div>

        {loading && <p>Loading users...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && userList.length === 0 && (
          <p>No users found.</p>
        )}

        {!loading && !error && userList.length > 0 && (
          <div className="users-grid">
            {userList.map((user) => (
              <article
                className="dashboard-card user-card"
                key={user.id}
              >
                <div className="user-avatar">
                  {getInitials(user.name)}
                </div>

                <h2>{user.name}</h2>

                <p className="user-role">
                  {user.role}
                </p>

                <div className="user-details">
                  <span>{user.email}</span>
                  <span>
                    {user.phone_number ?? user.phone ?? "—"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        {!search && totalPages > 1 && (
          <div className="pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        )}
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
