import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../../styles/Admin/AdminDashboard.module.css";

// ── Icons ────────────────────────────────────────────────────────────────────
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const BroadcastIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

// ── Sacrament type colour config (all 6 known types always shown, count = 0 if none yet)
const SACRAMENT_CONFIG = [
  { label: "Baptism",                color: "#326cd0", bg: "#eff6ff" },
  { label: "First Communion",        color: "#22c55e", bg: "#f0fdf4" },
  { label: "Confirmation",           color: "#f59e0b", bg: "#fffbeb" },
  { label: "Wedding",                color: "#ec4899", bg: "#fdf2f8" },
  { label: "Anointing of the Sick",  color: "#64748b", bg: "#f8fafc" },
  { label: "Mass Intentions",        color: "#a855f7", bg: "#faf5ff" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const BADGE_MAP = {
  pending:   styles.badgePending,
  approved:  styles.badgeApproved,
  verified:  styles.badgeApproved,
  rejected:  styles.badgeRejected,
  active:    styles.badgeActive,
  inactive:  styles.badgeInactive,
  scheduled: styles.badgeScheduled,
  published: styles.badgeApproved,
  draft:     styles.badgeInactive,
  completed: styles.badgeApproved,
};

function StatusBadge({ status }) {
  return (
    <span className={`${styles.badge} ${BADGE_MAP[status] ?? ""}`}>
      {status}
    </span>
  );
}

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric", month: "short", day: "numeric",
  });
};

const formatAmount = (amount) => {
  if (amount == null) return "—";
  return `₱${Number(amount).toLocaleString("en-PH")}`;
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashData(res.data);
      } catch {
        setFetchError("Failed to load dashboard data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <p style={{ padding: "32px", color: "#64748b", fontSize: "0.9rem" }}>
        Loading dashboard data…
      </p>
    );
  }

  if (fetchError) {
    return (
      <p style={{ padding: "32px", color: "#dc2626", fontSize: "0.9rem" }}>
        {fetchError}
      </p>
    );
  }

  const {
    counts = {},
    recentBookings = [],
    recentDonations = [],
    sacramentSummary = [],
  } = dashData;

  // Merge API sacrament counts with the full config list so every type always renders
  const sacraments = SACRAMENT_CONFIG.map((config) => {
    const hit = sacramentSummary.find((s) => s.label === config.label);
    return { ...config, count: hit ? hit.count : 0 };
  });

  const statCards = [
    {
      label: "Pending Bookings",
      value: counts.pendingBookings ?? 0,
      icon: <CalendarIcon />,
      color: "#326cd0", bg: "#dbeafe",
      hoverShadow: "rgba(50,108,208,0.22)",
      route: "/admin/bookings",
    },
    {
      label: "Pending Donations",
      value: counts.pendingDonations ?? 0,
      icon: <DollarIcon />,
      color: "#16a34a", bg: "#dcfce7",
      hoverShadow: "rgba(34,197,94,0.22)",
      route: "/admin/donations",
    },
    {
      label: "Total Parishioners",
      value: (counts.totalParishioners ?? 0).toLocaleString(),
      icon: <UsersIcon />,
      color: "#9333ea", bg: "#f3e8ff",
      hoverShadow: "rgba(168,85,247,0.22)",
      route: "/admin/parishioners",
    },
    {
      label: "Total Events",
      value: counts.totalEvents ?? 0,
      icon: <BroadcastIcon />,
      color: "#dc2626", bg: "#fee2e2",
      hoverShadow: "rgba(239,68,68,0.22)",
      route: "/admin/live-streams",
    },
  ];

  return (
    <>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard Overview</h1>
        <p className={styles.pageSubtitle}>
          Welcome back! Here&#39;s what&#39;s happening in your parish today.
        </p>
      </div>

      {/* ── Stat cards (real counts) ── */}
      <div className={styles.statsGrid}>
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={styles.statCard}
            style={{ "--hover-shadow": stat.hoverShadow }}
            onClick={() => navigate(stat.route)}
          >
            <div className={styles.statIconBox} style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div className={styles.statContent}>
              <p className={styles.statLabel}>{stat.label}</p>
              <p className={styles.statValue}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── 2-column section grid ── */}
      <div className={styles.sectionsGrid}>

        {/* Recent Bookings — real data */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Recent Bookings</h2>
            <button className={styles.linkBtn} onClick={() => navigate("/admin/bookings")}>
              Manage <ArrowRightIcon />
            </button>
          </div>
          <div className={styles.tableWrap}>
            {recentBookings.length === 0 ? (
              <p style={{ fontSize: "0.82rem", color: "#94a3b8", padding: "12px 0" }}>
                No bookings yet.
              </p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Parishioner</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b._id}>
                      <td>{b.parishioner?.fullName || "—"}</td>
                      <td>{b.sacramentType}</td>
                      <td>{formatDate(b.preferredDate)}</td>
                      <td><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Donation Overview — real data */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Donation Overview</h2>
            <button className={styles.linkBtn} onClick={() => navigate("/admin/donations")}>
              Manage <ArrowRightIcon />
            </button>
          </div>
          <div className={styles.donationSummaryRow}>
            <div className={styles.donationStat}>
              <p className={styles.donationStatLabel}>Verified Donations</p>
              <p className={styles.donationStatValue}>{counts.verifiedDonations ?? 0}</p>
            </div>
            <div className={styles.donationStat}>
              <p className={styles.donationStatLabel}>Pending Verification</p>
              <p className={styles.donationStatValue} style={{ color: "#f59e0b" }}>
                {counts.pendingDonations ?? 0}
              </p>
            </div>
          </div>
          {recentDonations.length === 0 ? (
            <p style={{ fontSize: "0.82rem", color: "#94a3b8", padding: "4px 0" }}>
              No donations yet.
            </p>
          ) : (
            <div className={styles.donationList}>
              {recentDonations.map((d) => (
                <div key={d._id} className={styles.donationRow}>
                  <div className={styles.donationRowLeft}>
                    <span className={styles.donorName}>{d.parishioner?.fullName || "—"}</span>
                    <span className={styles.donationType}>{d.purpose}</span>
                  </div>
                  <div className={styles.donationRowRight}>
                    <span className={styles.donationAmount}>{formatAmount(d.amount)}</span>
                    <StatusBadge status={d.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Announcements — static until an announcements route exists */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Announcements</h2>
            <button
              className={`${styles.linkBtn} ${styles.linkBtnGreen}`}
              onClick={() => navigate("/admin/announcements")}
            >
              <PlusIcon /> Create
            </button>
          </div>
          <div className={styles.announcementList}>
            {[
              { id: 1, title: "Holy Week Schedule",      date: "Apr 28, 2025", status: "published" },
              { id: 2, title: "Parish Fiesta Celebration", date: "May 01, 2025", status: "published" },
              { id: 3, title: "Youth Ministry Meeting",   date: "May 06, 2025", status: "draft"     },
              { id: 4, title: "Baptism Classes – May",    date: "May 03, 2025", status: "published" },
            ].map((a) => (
              <div key={a.id} className={styles.announcementRow}>
                <div className={styles.announcementRowLeft}>
                  <span className={styles.announceDot} />
                  <div>
                    <p className={styles.announceTitle}>{a.title}</p>
                    <p className={styles.announceDate}>{a.date}</p>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Live Streams — static until a live-stream route exists */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Live Streams</h2>
            <button className={styles.linkBtn} onClick={() => navigate("/admin/live-streams")}>
              Manage <ArrowRightIcon />
            </button>
          </div>
          <div className={styles.streamActivePill}>
            <span className={styles.pulseDot} />
            <span>Stream schedule managed separately</span>
          </div>
          <div className={styles.streamList}>
            {[
              { id: 1, title: "Sunday Mass",        schedule: "Every Sunday, 8:00 AM", status: "active",    viewers: 0 },
              { id: 2, title: "Novena to Our Lady", schedule: "Scheduled",             status: "scheduled", viewers: 0 },
              { id: 3, title: "Bible Study",        schedule: "Scheduled",             status: "scheduled", viewers: 0 },
            ].map((s) => (
              <div key={s.id} className={styles.streamRow}>
                <div className={styles.streamRowLeft}>
                  <p className={styles.streamName}>{s.title}</p>
                  <p className={styles.streamSchedule}>{s.schedule}</p>
                </div>
                <div className={styles.streamRowRight}>
                  {s.status === "active" && s.viewers > 0 && (
                    <span className={styles.viewerCount}>{s.viewers} viewers</span>
                  )}
                  <StatusBadge status={s.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sacrament Summary — real counts from booking aggregation ── */}
      <div className={styles.sacramentSection}>
        <h2 className={styles.sectionHeading}>Sacrament Summary</h2>
        <div className={styles.sacramentGrid}>
          {sacraments.map((s) => (
            <div
              key={s.label}
              className={styles.sacramentCard}
              style={{ borderTopColor: s.color }}
            >
              <div className={styles.sacramentIconBox} style={{ background: s.bg }} />
              <p className={styles.sacramentCount} style={{ color: s.color }}>{s.count}</p>
              <p className={styles.sacramentLabel}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
