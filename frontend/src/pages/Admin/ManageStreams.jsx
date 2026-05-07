import { useNavigate } from "react-router-dom";
import styles from "../../styles/Admin/AdminPage.module.css";

const streams = [
  {
    id: 1,
    title: "Sunday Mass",
    description: "Weekly Sunday Eucharistic Celebration",
    schedule: "Every Sunday, 8:00 AM",
    status: "active",
    viewers: 245,
  },
  {
    id: 2,
    title: "Novena to Our Lady",
    description: "9-Day Novena Prayer Service",
    schedule: "Daily, 6:00 PM",
    status: "active",
    viewers: 98,
  },
  {
    id: 3,
    title: "Bible Study Session",
    description: "Interactive Online Bible Study",
    schedule: "Every Wednesday, 7:00 PM",
    status: "scheduled",
    viewers: 0,
  },
  {
    id: 4,
    title: "Youth Ministry Live",
    description: "Youth Fellowship and Praise Night",
    schedule: "Every Saturday, 4:00 PM",
    status: "inactive",
    viewers: 0,
  },
];

const badgeClass = {
  active: styles.badgeActive,
  scheduled: styles.badgeScheduled,
  inactive: styles.badgeInactive,
};

const actionLabel = {
  active: "Stop Stream",
  scheduled: "Start Now",
  inactive: "Schedule",
};

export default function ManageStreams() {
  const navigate = useNavigate();

  const liveCount = streams.filter((s) => s.status === "active").length;
  const scheduledCount = streams.filter((s) => s.status === "scheduled").length;
  const totalViewers = streams.reduce((sum, s) => sum + s.viewers, 0);

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
            <h1 className={styles.pageTitle}>Stream Management</h1>
            <p className={styles.pageSubtitle}>
              Manage livestreams, broadcast status, and stream schedules
            </p>
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
            <p className={styles.statLabel}>Live Now</p>
            <p className={styles.statValue}>{liveCount}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Scheduled</p>
            <p className={styles.statValue}>{scheduledCount}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Viewers</p>
            <p className={styles.statValue}>{totalViewers}</p>
          </div>
        </div>

        <div className={styles.streamGrid}>
          {streams.map((s) => (
            <div key={s.id} className={styles.streamCard}>
              <div className={styles.streamCardHeader}>
                <h3 className={styles.streamTitle}>{s.title}</h3>
                <span className={`${styles.badge} ${badgeClass[s.status]}`}>
                  {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                </span>
              </div>
              <p className={styles.streamMeta}>{s.description}</p>
              <p className={styles.streamMeta}>Schedule: {s.schedule}</p>
              {s.status === "active" && (
                <p
                  className={styles.streamMeta}
                  style={{ color: "#16a34a", fontWeight: 600, marginTop: 6 }}
                >
                  {s.viewers} viewers watching
                </p>
              )}
              <div className={styles.streamActions}>
                <button className={styles.actionBtn}>{actionLabel[s.status]}</button>
                <button className={styles.actionBtn}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
