import { useNavigate } from "react-router-dom";
import styles from "../../styles/Admin/AdminPage.module.css";

const bookings = [
  { id: 1, name: "Maria Santos", service: "Baptism", date: "May 10, 2026", status: "pending" },
  { id: 2, name: "Jose Reyes", service: "Wedding", date: "May 14, 2026", status: "approved" },
  { id: 3, name: "Ana Cruz", service: "Confirmation", date: "May 18, 2026", status: "pending" },
  { id: 4, name: "Pedro Lim", service: "Funeral Mass", date: "May 20, 2026", status: "pending" },
  { id: 5, name: "Rosa Garcia", service: "First Communion", date: "May 22, 2026", status: "approved" },
  { id: 6, name: "Carlos Mendoza", service: "Baptism", date: "May 25, 2026", status: "pending" },
];

const statusBadge = {
  pending: styles.badgePending,
  approved: styles.badgeApproved,
  rejected: styles.badgeRejected,
};

const SearchIcon = () => (
  <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function ManageBookings() {
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
            <h1 className={styles.pageTitle}>Booking Management</h1>
            <p className={styles.pageSubtitle}>Review and approve sacramental booking requests</p>
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
            <p className={styles.statLabel}>Pending</p>
            <p className={styles.statValue}>12</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Approved This Month</p>
            <p className={styles.statValue}>34</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Bookings</p>
            <p className={styles.statValue}>156</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <SearchIcon />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search bookings by name or service..."
            />
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader}>
            <h2 className={styles.tableCardTitle}>Pending Requests</h2>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Parishioner</th>
                <th>Service</th>
                <th>Requested Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td>{b.service}</td>
                  <td>{b.date}</td>
                  <td>
                    <span className={`${styles.badge} ${statusBadge[b.status]}`}>
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <button className={styles.actionBtn}>Review</button>
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
