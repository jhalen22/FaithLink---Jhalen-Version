import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/Admin/AdminPage.module.css";

const intentions = [
  { id: 1, requestor: "Maria Santos", intention: "For the soul of Juan Santos",       date: "May 10, 2025", status: "approved" },
  { id: 2, requestor: "Ana Cruz",     intention: "Thanksgiving for family blessings", date: "May 12, 2025", status: "pending"  },
  { id: 3, requestor: "Pedro Lim",    intention: "For healing of Rosa Lim",           date: "May 13, 2025", status: "pending"  },
  { id: 4, requestor: "Lita Reyes",   intention: "Special intention for the sick",    date: "May 08, 2025", status: "approved" },
  { id: 5, requestor: "Ben Torres",   intention: "For the repose of Elena Torres",    date: "May 09, 2025", status: "approved" },
];

const SearchIcon = () => (
  <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

export default function ManageMassIntentions() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = intentions.filter(
    (i) =>
      i.requestor.toLowerCase().includes(search.toLowerCase()) ||
      i.intention.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Mass Intentions</h1>
          <p className={styles.pageSubtitle}>Review and manage mass intention requests from parishioners</p>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total</p>
          <p className={styles.statValue}>{intentions.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Approved</p>
          <p className={styles.statValue}>{intentions.filter((i) => i.status === "approved").length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Pending</p>
          <p className={styles.statValue}>{intentions.filter((i) => i.status === "pending").length}</p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <SearchIcon />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by requestor or intention..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h2 className={styles.tableCardTitle}>Mass Intention Requests</h2>
        </div>
        <table className={styles.table}>
          <thead>
            <tr><th>Requestor</th><th>Intention</th><th>Date</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filtered.map((i) => (
              <tr key={i.id}>
                <td>{i.requestor}</td>
                <td>{i.intention}</td>
                <td>{i.date}</td>
                <td>
                  <span className={`${styles.badge} ${i.status === "approved" ? styles.badgeApproved : styles.badgePending}`}>
                    {i.status.charAt(0).toUpperCase() + i.status.slice(1)}
                  </span>
                </td>
                <td><button className={styles.actionBtn}>Review</button></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "#94a3b8", padding: "32px" }}>No records match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
