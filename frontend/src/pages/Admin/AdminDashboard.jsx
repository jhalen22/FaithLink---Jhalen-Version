import { useNavigate } from "react-router-dom";
import styles from "../../styles/Admin/AdminDashboard.module.css";

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BroadcastIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <circle cx="12" cy="20" r="1" fill="currentColor" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const stats = [
  {
    label: "Pending Bookings",
    value: "12",
    icon: <CalendarIcon />,
    color: "#3b82f6",
    bg: "#eff6ff",
    route: "/admin/bookings",
    hoverShadow: "rgba(59, 130, 246, 0.22)",
  },
  {
    label: "Pending Donations",
    value: "8",
    icon: <DollarIcon />,
    color: "#22c55e",
    bg: "#f0fdf4",
    route: "/admin/donations",
    hoverShadow: "rgba(34, 197, 94, 0.22)",
  },
  {
    label: "Total Parishioners",
    value: "1,234",
    icon: <UsersIcon />,
    color: "#a855f7",
    bg: "#faf5ff",
    route: "/admin/parishioners",
    hoverShadow: "rgba(168, 85, 247, 0.22)",
  },
  {
    label: "Active Streams",
    value: "2",
    icon: <BroadcastIcon />,
    color: "#ef4444",
    bg: "#fef2f2",
    route: "/admin/streams",
    hoverShadow: "rgba(239, 68, 68, 0.22)",
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <button className={styles.menuBtn} aria-label="Menu">
            <MenuIcon />
          </button>
          <span className={styles.logo}>FaithLink</span>
        </div>
        <div className={styles.navRight}>
          <button className={styles.iconBtn} aria-label="Notifications">
            <BellIcon />
          </button>
          <div className={styles.avatar}>AD</div>
          <span className={styles.adminLabel}>Admin</span>
        </div>
      </nav>

      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Dashboard Overview</h1>

        <div className={styles.cardList}>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`${styles.card} ${styles.cardClickable}`}
              style={{ '--card-hover-shadow': stat.hoverShadow }}
              onClick={() => navigate(stat.route)}
            >
              <div className={styles.cardBody}>
                <p className={styles.cardLabel}>{stat.label}</p>
                <p className={styles.cardValue}>{stat.value}</p>
              </div>
              <div
                className={styles.cardIcon}
                style={{ backgroundColor: stat.bg, color: stat.color }}
              >
                {stat.icon}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
