import { useNavigate } from "react-router-dom";
import styles from "../../styles/Admin/AdminPage.module.css";

const donations = [
  { id: 1, donor: "Juan dela Cruz", amount: "₱5,000", date: "May 1, 2026", type: "Tithe", status: "completed" },
  { id: 2, donor: "Maria Santos", amount: "₱2,500", date: "May 2, 2026", type: "Offering", status: "pending" },
  { id: 3, donor: "Anonymous", amount: "₱10,000", date: "May 3, 2026", type: "Fundraising", status: "completed" },
  { id: 4, donor: "Pedro Reyes", amount: "₱1,200", date: "May 4, 2026", type: "Tithe", status: "completed" },
  { id: 5, donor: "Ana Cruz", amount: "₱3,000", date: "May 5, 2026", type: "Special Collection", status: "pending" },
  { id: 6, donor: "Rosa Villanueva", amount: "₱800", date: "May 5, 2026", type: "Offering", status: "completed" },
];

const SearchIcon = () => (
  <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function ManageDonations() {
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
            <h1 className={styles.pageTitle}>Donation Management</h1>
            <p className={styles.pageSubtitle}>Track fundraising transactions and donor records</p>
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
            <p className={styles.statValue}>8</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>This Month</p>
            <p className={styles.statValue}>&#8369;21,700</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Donors</p>
            <p className={styles.statValue}>342</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <SearchIcon />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search donors or transactions..."
            />
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader}>
            <h2 className={styles.tableCardTitle}>Donation Records</h2>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Donor</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d.id}>
                  <td>{d.donor}</td>
                  <td>{d.amount}</td>
                  <td>{d.date}</td>
                  <td>{d.type}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        d.status === "completed"
                          ? styles.badgeApproved
                          : styles.badgePending
                      }`}
                    >
                      {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                    </span>
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
