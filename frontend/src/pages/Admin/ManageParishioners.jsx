import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../styles/Admin/AdminPage.module.css";

const ROLE_BADGE = {
  parishioner: styles.badgeActive,
  priest:      styles.badgeScheduled,
  admin:       styles.badgePending,
};

const SearchIcon = () => (
  <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
  });
};

const isThisMonth = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

export default function ManageParishioners() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch]       = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data.users || []);
      } catch {
        setFetchError("Failed to load members. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Show all users; admin can see the full registry
  const filtered = users.filter(
    (u) =>
      (u.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.role || "").toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    total:      users.filter((u) => u.role === "parishioner").length,
    newMonth:   users.filter((u) => u.role === "parishioner" && isThisMonth(u.createdAt)).length,
    priests:    users.filter((u) => u.role === "priest").length,
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Parishioner Management</h1>
          <p className={styles.pageSubtitle}>View and manage registered parish members</p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Parishioners</p>
          <p className={styles.statValue}>{loading ? "—" : counts.total}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>New This Month</p>
          <p className={styles.statValue}>{loading ? "—" : counts.newMonth}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Priests</p>
          <p className={styles.statValue}>{loading ? "—" : counts.priests}</p>
        </div>
      </div>

      {/* ── Search ── */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <SearchIcon />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by name, email, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h2 className={styles.tableCardTitle}>Parish Member Records</h2>
        </div>

        {loading ? (
          <p style={{ padding: "24px", color: "#64748b", fontSize: "0.875rem" }}>
            Loading members…
          </p>
        ) : fetchError ? (
          <p style={{ padding: "24px", color: "#dc2626", fontSize: "0.875rem" }}>
            {fetchError}
          </p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Date Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id}>
                  <td>{u.fullName || "—"}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`${styles.badge} ${ROLE_BADGE[u.role] || ""}`}>
                      {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </span>
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{ textAlign: "center", color: "#94a3b8", padding: "32px" }}
                  >
                    {users.length === 0
                      ? "No registered members yet."
                      : "No members match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
