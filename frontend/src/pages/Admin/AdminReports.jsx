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

// ── CSV export utility ────────────────────────────────────────────────────────
function exportToCSV(data, columns, filename) {
  if (!data || data.length === 0) return;
  const headers = columns.map((c) => c.label);
  const rows = data.map((row) =>
    columns
      .map((c) => `"${String(row[c.key] ?? "").replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

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

// ── Report card definitions ───────────────────────────────────────────────────
// `type` maps to the /api/admin/reports/:reportType endpoint.
const REPORT_CARDS = [
  { id: 1, type: "sacrament-bookings", title: "Sacrament Bookings Report", desc: "Monthly breakdown of all sacrament booking requests and their statuses.", accent: "#326cd0", bg: "#eff6ff" },
  { id: 2, type: "donations",          title: "Donation Summary Report",   desc: "Total donations collected, verified, and pending per month.",            accent: "#16a34a", bg: "#f0fdf4" },
  { id: 3, type: "parishioners",       title: "Parishioner Registry",      desc: "Complete list of registered parishioners and membership statistics.",    accent: "#9333ea", bg: "#f3e8ff" },
  { id: 4, type: "livestream",         title: "Live Stream Analytics",     desc: "Viewership stats and engagement for all streamed Masses and events.",    accent: "#dc2626", bg: "#fee2e2" },
  { id: 5, type: "mass-intentions",    title: "Mass Intentions Log",       desc: "All mass intention requests submitted and their approval status.",       accent: "#d97706", bg: "#fffbeb" },
  { id: 6, type: "annual",             title: "Annual Parish Report",      desc: "Year-end summary of all parish activities, donations, and events.",     accent: "#0891b2", bg: "#ecfeff" },
];

// Column definitions for each report type (used for table headers and CSV export)
const REPORT_COLUMNS = {
  "sacrament-bookings": [
    { key: "parishioner",   label: "Parishioner" },
    { key: "sacramentType", label: "Sacrament Type" },
    { key: "preferredDate", label: "Preferred Date" },
    { key: "preferredTime", label: "Time" },
    { key: "status",        label: "Status" },
    { key: "submittedOn",   label: "Submitted On" },
  ],
  "donations": [
    { key: "parishioner", label: "Parishioner" },
    { key: "amount",      label: "Amount" },
    { key: "purpose",     label: "Purpose" },
    { key: "method",      label: "Method" },
    { key: "status",      label: "Status" },
    { key: "submittedOn", label: "Submitted On" },
  ],
  "parishioners": [
    { key: "fullName",     label: "Full Name" },
    { key: "email",        label: "Email" },
    { key: "registeredOn", label: "Registered On" },
  ],
  "livestream": [
    { key: "title",           label: "Title" },
    { key: "status",          label: "Status" },
    { key: "totalViews",      label: "Total Views" },
    { key: "peakViewers",     label: "Peak Viewers" },
    { key: "replayViews",     label: "Replay Views" },
    { key: "durationSeconds", label: "Duration (s)" },
    { key: "date",            label: "Date" },
  ],
  "mass-intentions": [
    { key: "parishioner",    label: "Parishioner" },
    { key: "preferredDate",  label: "Preferred Date" },
    { key: "preferredTime",  label: "Time" },
    { key: "status",         label: "Status" },
    { key: "intentionStatus", label: "Intention Status" },
    { key: "message",        label: "Message" },
    { key: "submittedOn",    label: "Submitted On" },
  ],
  "annual": [
    { key: "metric", label: "Metric" },
    { key: "value",  label: "Value" },
  ],
};

const CSV_FILENAMES = {
  "sacrament-bookings": "sacrament-bookings-report.csv",
  "donations":          "donation-summary-report.csv",
  "parishioners":       "parishioner-registry.csv",
  "livestream":         "livestream-analytics.csv",
  "mass-intentions":    "mass-intentions-log.csv",
  "annual":             "annual-parish-report.csv",
};

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
  const [trends, setTrends]         = useState(null);
  const [summary, setSummary]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Report generation state
  const [generatingId, setGeneratingId] = useState(null);
  const [exportingId, setExportingId]   = useState(null);
  const [reportData, setReportData]     = useState(null); // { type, data, title }
  const [reportError, setReportError]   = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trendsRes, summaryRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/trends", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/admin/reports/summary", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setTrends(trendsRes.data);
        setSummary(summaryRes.data);
      } catch {
        setFetchError("Failed to load trend data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const {
    bookingsPerMonth       = [],
    donationsPerMonth      = [],
    activeBookingDays      = [],
    massIntentionsPerMonth = [],
  } = trends ?? {};

  // ── Generate handler ───────────────────────────────────────────────────────
  const handleGenerate = async (card) => {
    setGeneratingId(card.id);
    setReportError("");
    setReportData(null);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/reports/${card.type}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReportData({ type: card.type, data: res.data.data, title: card.title });
    } catch {
      setReportError("Failed to generate report. Please try again.");
    } finally {
      setGeneratingId(null);
    }
  };

  // ── Export handler ─────────────────────────────────────────────────────────
  const handleExport = async (card) => {
    setExportingId(card.id);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/reports/${card.type}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const columns  = REPORT_COLUMNS[card.type] ?? [];
      const filename = CSV_FILENAMES[card.type]  ?? `${card.type}-report.csv`;
      exportToCSV(res.data.data, columns, filename);
    } catch {
      // no-op — export silently fails; user can retry
    } finally {
      setExportingId(null);
    }
  };

  const generatedColumns = reportData ? (REPORT_COLUMNS[reportData.type] ?? []) : [];

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
          <p className={styles.statValue}>
            {summary ? summary.availableReports : REPORT_CARDS.length}
          </p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Months of Booking Data</p>
          <p className={styles.statValue}>
            {loading ? "—" : summary ? summary.monthsOfBookingData : bookingsPerMonth.length}
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
                onClick={() => handleGenerate(r)}
                disabled={generatingId === r.id || exportingId === r.id}
              >
                {generatingId === r.id ? "Generating…" : "Generate"}
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => handleExport(r)}
                disabled={exportingId === r.id || generatingId === r.id}
              >
                {exportingId === r.id ? "Exporting…" : "Export"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Generated Report Display Area ── */}
      {reportError && (
        <p style={{ color: "#dc2626", fontSize: "0.875rem", margin: "8px 0" }}>
          {reportError}
        </p>
      )}
      {reportData && (
        <div className={styles.tableCard} style={{ marginTop: 8 }}>
          <div className={styles.tableCardHeader}>
            <h2 className={styles.tableCardTitle}>{reportData.title}</h2>
          </div>
          {reportData.data.length === 0 ? (
            <p style={{ padding: "20px 24px", color: "#94a3b8", fontSize: "0.875rem", margin: 0 }}>
              No data available.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {generatedColumns.map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.map((row, i) => (
                    <tr key={i}>
                      {generatedColumns.map((c) => (
                        <td key={c.key}>{row[c.key] ?? "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
