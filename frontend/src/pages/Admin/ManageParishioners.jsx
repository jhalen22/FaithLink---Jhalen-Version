import { useNavigate } from "react-router-dom";
import styles from "../../styles/Admin/AdminPage.module.css";

const parishioners = [
  { id: 1, name: "Maria Santos", email: "maria.santos@email.com", joined: "Jan 12, 2025", status: "active" },
  { id: 2, name: "Jose Reyes", email: "jose.reyes@email.com", joined: "Feb 3, 2025", status: "active" },
  { id: 3, name: "Ana Cruz", email: "ana.cruz@email.com", joined: "Mar 20, 2025", status: "inactive" },
  { id: 4, name: "Pedro Lim", email: "pedro.lim@email.com", joined: "Apr 5, 2025", status: "active" },
  { id: 5, name: "Rosa Garcia", email: "rosa.garcia@email.com", joined: "Apr 18, 2025", status: "active" },
  { id: 6, name: "Carlos Mendoza", email: "carlos.m@email.com", joined: "May 1, 2026", status: "active" },
  { id: 7, name: "Elena Bautista", email: "elena.b@email.com", joined: "May 3, 2026", status: "active" },
];

const SearchIcon = () => (
  <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function ManageParishioners() {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <button
            className={styles.backBtn}
            onClick={() => navigate("/admin/dashboard")}
            aria-label="Back to dashboard"
          >
            &#8592;
          </button>
          <span className={styles.logo}>FaithLink</span>
        </div>
        <div className={styles.navRight}>
          <div className={styles.avatar}>AD</div>
          <span className={styles.adminLabel}>Admin</span>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Parishioner Management</h1>
            <p className={styles.pageSubtitle}>View and manage registered parish members</p>
          </div>
          <button
            className={styles.dashboardBackBtn}
            onClick={() => navigate("/admin/dashboard")}
          >
            &#8592; Back to Dashboard
          </button>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Members</p>
            <p className={styles.statValue}>1,234</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Active</p>
            <p className={styles.statValue}>1,198</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>New This Month</p>
            <p className={styles.statValue}>28</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <SearchIcon />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search parishioners by name or email..."
            />
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader}>
            <h2 className={styles.tableCardTitle}>Parish Member Records</h2>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Date Joined</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {parishioners.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{p.joined}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        p.status === "active"
                          ? styles.badgeActive
                          : styles.badgeInactive
                      }`}
                    >
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <button className={styles.actionBtn}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
