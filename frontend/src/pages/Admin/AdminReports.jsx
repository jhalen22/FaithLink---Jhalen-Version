import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../styles/Admin/AdminPage.module.css";

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
// MongoDB $dayOfWeek: 1 = Sunday … 7 = Saturday
const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const fmtMonth  = (year, month) => `${MONTHS[month - 1]} ${year}`;
const fmtDay    = (dow)         => DAYS[dow - 1] ?? "—";
const fmtAmount = (n)           => `₱${Number(n ?? 0).toLocaleString("en-PH")}`;

// ── Sub-components ────────────────────────────────────────────────────────────

// Reusable wrapper that gives each trend table the same card shell
function TrendCard({ title, children }) {
  return (
    <div className={styles.tableCard}>
      <div className={styles.tableCardHeader}>
        <h2 className={styles.tableCardTitle}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

// Colspan-spanning empty-state row
function EmptyRow({ cols, text = "No data yet." }) {
  return (
    <tr>
      <td
        colSpan={cols}
        style={{ textAlign: "center", color: "#94a3b8", padding: "20px", fontSize: "0.82rem" }}
      >
        {text}
      </td>
    </tr>
  );
}

// ── Static report card definitions (kept for future export/generate feature) ──
const REPORT_CARDS = [
  { id: 1, title: "Sacrament Bookings Report", desc: "Monthly breakdown of all sacrament booking requests and their statuses.", accent: "#326cd0", bg: "#eff6ff" },
  { id: 2, title: "Donation Summary Report",   desc: "Total donations collected, verified, and pending per month.",            accent: "#16a34a", bg: "#f0fdf4" },
  { id: 3, title: "Parishioner Registry",      desc: "Complete list of registered parishioners and membership statistics.",    accent: "#9333ea", bg: "#f3e8ff" },
  { id: 4, title: "Live Stream Analytics",     desc: "Viewership stats and engagement for all streamed Masses and events.",    accent: "#dc2626", bg: "#fee2e2" },
  { id: 5, title: "Mass Intentions Log",       desc: "All mass intention requests submitted and their approval status.",       accent: "#d97706", bg: "#fffbeb" },
  { id: 6, title: "Annual Parish Report",      desc: "Year-end summary of all parish activities, donations, and events.",     accent: "#0891b2", bg: "#ecfeff" },
];

// ── Section heading used twice on the page ────────────────────────────────────
function SectionHeading({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", margin: "0 0 4px" }}>
        {title}
      </h2>
      <p style={{ fontSize: "0.875rem", color: "#64748b", margin: 0 }}>{subtitle}</p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AdminReports() {
  const [trends, setTrends]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadTrends = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/trends", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrends(res.data);
      } catch {
        setFetchError("Failed to load trend data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    loadTrends();
  }, []);

  const {
    bookingsPerMonth       = [],
    donationsPerMonth      = [],
    activeBookingDays      = [],
    massIntentionsPerMonth = [],
  } = trends ?? {};

  return (
    <div>
      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Reports &amp; Analytics</h1>
          <p className={styles.pageSubtitle}>
            Trend analysis and parish activity reports
          </p>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Available Reports</p>
          <p className={styles.statValue}>{REPORT_CARDS.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Months of Booking Data</p>
          <p className={styles.statValue}>
            {loading ? "—" : bookingsPerMonth.length}
          </p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Export Format</p>
          <p className={styles.statValue}>PDF / CSV</p>
        </div>
      </div>

      {/* ── Trend Analysis section ── */}
      <SectionHeading
        title="Trend Analysis"
        subtitle="Time-based patterns computed from live MongoDB aggregations"
      />

      {loading ? (
        <p style={{ padding: "24px 0", color: "#64748b", fontSize: "0.875rem" }}>
          Loading trend data…
        </p>
      ) : fetchError ? (
        <p style={{ padding: "24px 0", color: "#dc2626", fontSize: "0.875rem" }}>
          {fetchError}
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          {/* 1 — Bookings per Month */}
          <TrendCard title="Bookings per Month">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Bookings</th>
                </tr>
              </thead>
              <tbody>
                {bookingsPerMonth.length === 0 ? (
                  <EmptyRow cols={2} />
                ) : (
                  bookingsPerMonth.map((r) => (
                    <tr key={`${r.year}-${r.month}`}>
                      <td>{fmtMonth(r.year, r.month)}</td>
                      <td>{r.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TrendCard>

          {/* 2 — Donations per Month */}
          <TrendCard title="Donations per Month">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Donations</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {donationsPerMonth.length === 0 ? (
                  <EmptyRow cols={3} />
                ) : (
                  donationsPerMonth.map((r) => (
                    <tr key={`${r.year}-${r.month}`}>
                      <td>{fmtMonth(r.year, r.month)}</td>
                      <td>{r.count}</td>
                      <td>{fmtAmount(r.totalAmount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TrendCard>

          {/* 3 — Most Active Booking Days (top 5 by day of week) */}
          <TrendCard title="Most Active Booking Days">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Day of Week</th>
                  <th>Total Bookings</th>
                </tr>
              </thead>
              <tbody>
                {activeBookingDays.length === 0 ? (
                  <EmptyRow cols={2} />
                ) : (
                  activeBookingDays.map((r) => (
                    <tr key={r.dayOfWeek}>
                      <td>{fmtDay(r.dayOfWeek)}</td>
                      <td>{r.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TrendCard>

          {/* 4 — Monthly Mass Intentions */}
          <TrendCard title="Monthly Mass Intentions">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Intentions</th>
                </tr>
              </thead>
              <tbody>
                {massIntentionsPerMonth.length === 0 ? (
                  <EmptyRow cols={2} text="No Mass Intentions submitted yet." />
                ) : (
                  massIntentionsPerMonth.map((r) => (
                    <tr key={`${r.year}-${r.month}`}>
                      <td>{fmtMonth(r.year, r.month)}</td>
                      <td>{r.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TrendCard>
        </div>
      )}

      {/* ── Available Reports (existing static cards kept intact) ── */}
      <SectionHeading
        title="Available Reports"
        subtitle="Generate and export detailed parish reports"
      />
      <div className={styles.streamGrid}>
        {REPORT_CARDS.map((r) => (
          <div
            key={r.id}
            className={styles.streamCard}
            style={{ borderTop: `3px solid ${r.accent}` }}
          >
            <div className={styles.streamCardHeader}>
              <div
                style={{ width: 36, height: 36, borderRadius: 8, background: r.bg, flexShrink: 0 }}
              />
              <span className={`${styles.badge} ${styles.badgeScheduled}`}>Report</span>
            </div>
            <h3 className={styles.streamTitle} style={{ marginTop: 10 }}>{r.title}</h3>
            <p className={styles.streamMeta}>{r.desc}</p>
            <div className={styles.streamActions}>
              <button
                className={styles.actionBtn}
                style={{ color: r.accent, borderColor: r.accent }}
              >
                Generate
              </button>
              <button className={styles.actionBtn}>Export</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
