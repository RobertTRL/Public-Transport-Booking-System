import { useEffect, useState } from "react";
import { Search } from "lucide-react";
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

      <div className="users-toolbar-top">
        <div className="users-search-box">
          <Search size={16} className="users-search-icon" />

          <input
            type="search"
            className="users-search-input"
            placeholder="Search users by name or email..."
            value={search}
            onChange={handleSearch}
            aria-label="Search users"
          />
        </div>
      </div>

      {loading && (
        <div className="users-loading-state">
          <p>Loading users...</p>
        </div>
      )}

      {error && <p className="vehicle-table-error">{error}</p>}

      {!loading && !error && userList.length === 0 && (
        <div className="users-empty-state">
          <p>No users found matching your search.</p>
        </div>
      )}

      {!loading && !error && userList.length > 0 && (
        <div className="users-cards-grid">
          {userList.map((user) => (
            <article
              className="user-card-item"
              key={user.id}
            >
              <div className="user-avatar">
                {getInitials(user.name)}
              </div>

              <div className="user-card-info">
                <h2>{user.name}</h2>
                <span className="user-role-badge">
                  {user.role}
                </span>

                <div className="user-details-list">
                  <span className="user-email-text">{user.email}</span>
                  <span className="user-phone-text">
                    {user.phone_number ?? user.phone ?? "—"}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!search && totalPages > 1 && (
        <div className="vehicle-pagination">
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

      {modalOpen && (
        <AddUserModal
          onClose={() => setModalOpen(false)}
          onSuccess={handleAddUser}
        />
      )}
    </>
  );
}

export default Users;
