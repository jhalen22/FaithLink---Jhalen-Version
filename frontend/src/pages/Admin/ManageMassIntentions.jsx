import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "../../styles/Admin/AdminPage.module.css";
import modal from "../../styles/Admin/ManageBookings.module.css";
import { useToast } from "../../context/ToastContext";

// ── Mass schedule rules (mirrors backend validation) ──────────────────────
const WEEKDAY_TIMES = ["06:00", "18:00"];
const SUNDAY_TIMES  = ["06:00", "08:00", "09:30", "16:30", "18:00"];
const getMassTimes  = (dayOfWeek) => (dayOfWeek === 0 ? SUNDAY_TIMES : WEEKDAY_TIMES);

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const FIELD_LABELS = {
  requesterName: "Requested By",
  intentionFor:  "Intention For",
  intentionType: "Intention Type",
};

// ── Formatters ────────────────────────────────────────────────────────────
const formatTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};
const formatDateLong = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-PH", {
    year: "numeric", month: "long", day: "numeric",
  });
};

// ── Build a flat lookup map: "YYYY-MM-DD||HH:MM" → group object ───────────
const buildIntentionMap = (list) => {
  const map = {};
  list.forEach((i) => {
    const dateKey = new Date(i.preferredDate).toISOString().split("T")[0];
    const gKey    = `${dateKey}||${i.preferredTime}`;
    if (!map[gKey]) {
      map[gKey] = { gKey, dateKey, date: i.preferredDate, time: i.preferredTime, intentions: [] };
    }
    map[gKey].intentions.push(i);
  });
  Object.values(map).forEach((g) => {
    g.allDone = g.intentions.length > 0 && g.intentions.every((i) => i.intentionStatus === "done");
  });
  return map;
};

// ── Generate calendar cells for a given year/month ────────────────────────
// Returns an array of {day, dateKey} objects; day is null for filler cells.
const buildCalendarGrid = (year, month) => {
  const firstDow    = new Date(year, month, 1).getDay();       // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push({ day: null, dateKey: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, dateKey });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, dateKey: null });
  return cells;
};

// ── Shared badge styles (cohesive with FaithLink palette) ─────────────────
const doneBadge = {
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "#dcfce7", color: "#166534",
  fontSize: "0.76rem", fontWeight: 700,
  padding: "4px 12px", borderRadius: 20,
};
const scheduledBadge = {
  display: "inline-flex", alignItems: "center", gap: 4,
  background: "#EBF1FD", color: "#2F5FBF",
  fontSize: "0.76rem", fontWeight: 700,
  padding: "4px 12px", borderRadius: 20,
};
const smallDoneBadge  = { ...doneBadge,      fontSize: "0.68rem", padding: "2px 8px" };
const smallSchedBadge = { ...scheduledBadge, fontSize: "0.68rem", padding: "2px 8px" };

// ── Component ─────────────────────────────────────────────────────────────
export default function ManageMassIntentions() {
  const { showError } = useToast();
  const [intentions,    setIntentions]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [fetchError,    setFetchError]    = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [marking,       setMarking]       = useState(false);

  // Calendar navigation state
  const today     = new Date();
  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth()); // 0-indexed

  const token = localStorage.getItem("token");

  // ── Data fetching ──────────────────────────────────────────────────────
  const fetchIntentions = useCallback(async () => {
    try {
      setLoading(true);
      setFetchError("");
      const res = await axios.get("http://localhost:5000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const all = res.data.bookings || [];
      setIntentions(all.filter((b) => b.sacramentType === "Mass Intentions"));
    } catch {
      setFetchError("Failed to load Mass Intentions. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchIntentions(); }, [fetchIntentions]);

  // ── Derived calendar data ──────────────────────────────────────────────
  const intentionMap  = buildIntentionMap(intentions);
  const calendarGrid  = buildCalendarGrid(calYear, calMonth);

  // Stats reflect ALL months, not just the displayed one
  const totalCount     = intentions.length;
  const scheduledCount = intentions.filter((i) => (i.intentionStatus || "scheduled") !== "done").length;
  const doneCount      = intentions.filter((i) => i.intentionStatus === "done").length;

  // ── Month navigation ───────────────────────────────────────────────────
  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(calYear - 1); setCalMonth(11); }
    else setCalMonth(calMonth - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(calYear + 1); setCalMonth(0); }
    else setCalMonth(calMonth + 1);
  };
  const goToToday = () => {
    setCalYear(today.getFullYear());
    setCalMonth(today.getMonth());
  };

  // ── Mark-as-done ───────────────────────────────────────────────────────
  const markGroupDone = async (group) => {
    if (marking) return;
    setMarking(true);
    try {
      await axios.patch(
        "http://localhost:5000/api/bookings/mass-intentions/mark-done-group",
        { preferredDate: group.date, preferredTime: group.time },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchIntentions();
      setSelectedGroup(null);
    } catch {
      showError("Failed to mark as done. Please try again.");
    } finally {
      setMarking(false);
    }
  };

  // Keep the panel in sync after a refetch (intentions list may have changed)
  const panelGroup = selectedGroup
    ? (intentionMap[selectedGroup.gKey] ?? selectedGroup)
    : null;

  // For "today" cell highlighting
  const todayYear  = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay   = today.getDate();

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Mass Intentions</h1>
        </div>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Intentions</p>
          <p className={styles.statValue}>{totalCount}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Scheduled</p>
          <p className={styles.statValue} style={{ color: "#5B8DEF" }}>{scheduledCount}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Completed</p>
          <p className={styles.statValue} style={{ color: "#16a34a" }}>{doneCount}</p>
        </div>
      </div>

      {/* Calendar card */}
      <div style={{
        background: "#ffffff",
        borderRadius: 14,
        border: "1px solid #e8edf5",
        boxShadow: "0 2px 16px rgba(91,141,239,0.08)",
        overflow: "hidden",
      }}>

        {/* Calendar navigation header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          background: "#1a2e4a",
        }}>
          <button
            onClick={prevMonth}
            aria-label="Previous month"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "none", color: "#fff",
              width: 34, height: 34, borderRadius: 8,
              cursor: "pointer", fontSize: "1.15rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "inherit", transition: "background 0.15s",
            }}
          >‹</button>

          <span style={{ color: "#fff", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "0.3px" }}>
            {MONTH_NAMES[calMonth]} {calYear}
          </span>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={goToToday}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "none", color: "#fff",
                padding: "6px 14px", borderRadius: 8,
                cursor: "pointer", fontSize: "0.78rem", fontWeight: 600,
                fontFamily: "inherit", transition: "background 0.15s",
              }}
            >Today</button>
            <button
              onClick={nextMonth}
              aria-label="Next month"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "none", color: "#fff",
                width: 34, height: 34, borderRadius: 8,
                cursor: "pointer", fontSize: "1.15rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "inherit", transition: "background 0.15s",
              }}
            >›</button>
          </div>
        </div>

        {loading ? (
          <p style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            Loading mass intentions…
          </p>
        ) : fetchError ? (
          <p style={{ padding: "40px", textAlign: "center", color: "#dc2626" }}>
            {fetchError}
          </p>
        ) : (
          <>
            {/* Day-of-week header row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
              {DAY_LABELS.map((label) => (
                <div
                  key={label}
                  style={{
                    padding: "10px 4px",
                    textAlign: "center",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.6px",
                    textTransform: "uppercase",
                    color: label === "Sun" ? "#5B8DEF" : "#64748b",
                    borderRight: "1px solid #f1f5f9",
                    borderBottom: "1px solid #e8edf5",
                    background: "#f8fafc",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Calendar day cells */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
              {calendarGrid.map((cell, idx) => {
                // Filler cells outside the current month
                if (!cell.day) {
                  return (
                    <div
                      key={idx}
                      style={{
                        minHeight: 110,
                        background: "#f8fafc",
                        borderRight: "1px solid #f1f5f9",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    />
                  );
                }

                const dow         = new Date(calYear, calMonth, cell.day).getDay(); // 0 = Sun
                const massTimes   = getMassTimes(dow);
                const isSunday    = dow === 0;
                const isTodayCell =
                  calYear === todayYear &&
                  calMonth === todayMonth &&
                  cell.day === todayDay;

                return (
                  <div
                    key={idx}
                    style={{
                      minHeight: 110,
                      padding: "5px 4px 6px",
                      borderRight: "1px solid #f1f5f9",
                      borderBottom: "1px solid #f1f5f9",
                      background: isTodayCell ? "#f0f4ff" : "#ffffff",
                      position: "relative",
                    }}
                  >
                    {/* Day number badge */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
                      <span style={{
                        width: 22, height: 22,
                        borderRadius: "50%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.72rem",
                        fontWeight: isTodayCell ? 700 : 500,
                        background: isTodayCell ? "#5B8DEF" : "transparent",
                        color: isTodayCell ? "#fff" : isSunday ? "#5B8DEF" : "#334155",
                        flexShrink: 0,
                      }}>
                        {cell.day}
                      </span>
                    </div>

                    {/* Mass time slots for this day */}
                    {massTimes.map((time) => {
                      const gKey         = `${cell.dateKey}||${time}`;
                      const group        = intentionMap[gKey];
                      const hasIntentions = Boolean(group);
                      const isDone       = group?.allDone;

                      return (
                        <div
                          key={time}
                          role={hasIntentions ? "button" : undefined}
                          tabIndex={hasIntentions ? 0 : undefined}
                          onClick={hasIntentions ? () => setSelectedGroup(group) : undefined}
                          onKeyDown={hasIntentions
                            ? (e) => e.key === "Enter" && setSelectedGroup(group)
                            : undefined}
                          title={
                            hasIntentions
                              ? `${formatTime(time)} · ${group.intentions.length} intention${group.intentions.length !== 1 ? "s" : ""}${isDone ? " · Completed" : ""}`
                              : formatTime(time)
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 2,
                            padding: "2px 4px",
                            borderRadius: 5,
                            marginBottom: 2,
                            fontSize: "0.59rem",
                            fontWeight: hasIntentions ? 700 : 400,
                            lineHeight: 1.35,
                            cursor: hasIntentions ? "pointer" : "default",
                            userSelect: "none",
                            background: isDone
                              ? "#dcfce7"
                              : hasIntentions
                              ? "#EBF1FD"
                              : "transparent",
                            color: isDone
                              ? "#166534"
                              : hasIntentions
                              ? "#2F5FBF"
                              : "#d1d5db",
                            transition: "opacity 0.12s",
                          }}
                        >
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {formatTime(time)}
                          </span>
                          {hasIntentions && (
                            <span style={{
                              background: isDone ? "#16a34a" : "#5B8DEF",
                              color: "#fff",
                              borderRadius: 10,
                              padding: "0 4px",
                              fontSize: "0.56rem",
                              fontWeight: 800,
                              minWidth: 14,
                              textAlign: "center",
                              lineHeight: "1.55",
                              flexShrink: 0,
                            }}>
                              {isDone ? "✓" : group.intentions.length}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 18, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
        {[
          { bg: "transparent", border: "#d1d5db", label: "No intentions" },
          { bg: "#EBF1FD",     border: "#5B8DEF", label: "Has intentions (click to view)" },
          { bg: "#dcfce7",     border: "#16a34a", label: "Completed" },
        ].map(({ bg, border, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 12, height: 12, borderRadius: 3,
              background: bg, border: `1.5px solid ${border}`,
              flexShrink: 0,
            }} />
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Detail side panel */}
      {panelGroup && (
        <div className={modal.overlay} onClick={() => setSelectedGroup(null)}>
          <div className={modal.panel} style={{ width: "min(860px, 95vw)" }} onClick={(e) => e.stopPropagation()}>

            {/* Panel header */}
            <div className={modal.panelHeader}>
              <div>
                <h2 className={modal.panelTitle}>{formatTime(panelGroup.time)}</h2>
                <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: 2 }}>
                  {formatDateLong(panelGroup.date)}
                </div>
                <div style={{ marginTop: 8 }}>
                  {panelGroup.allDone
                    ? <span style={doneBadge}>✓ Completed</span>
                    : <span style={scheduledBadge}>● Scheduled</span>
                  }
                </div>
              </div>
              <button className={modal.closeBtn} onClick={() => setSelectedGroup(null)}>✕</button>
            </div>

            {/* Panel body */}
            <div className={modal.panelBody}>

              {/* Mark as Done button */}
              {!panelGroup.allDone && (
                <div style={{ marginBottom: 18 }}>
                  <button
                    disabled={marking}
                    onClick={() => markGroupDone(panelGroup)}
                    style={{
                      width: "100%", padding: "11px",
                      borderRadius: 8, border: "none",
                      background: marking
                        ? "#94a3b8"
                        : "linear-gradient(135deg,#5B8DEF,#2F5FBF)",
                      color: "#fff",
                      fontSize: "0.875rem", fontWeight: 600,
                      cursor: marking ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {marking
                      ? "Marking as Done…"
                      : `Mark All ${panelGroup.intentions.length} Intention${panelGroup.intentions.length !== 1 ? "s" : ""} as Done`
                    }
                  </button>
                </div>
              )}

              {/* Intentions count label */}
              <div style={{
                fontSize: "0.72rem", fontWeight: 700,
                color: "#64748b", textTransform: "uppercase",
                letterSpacing: "0.6px", marginBottom: 12,
              }}>
                {panelGroup.intentions.length} Intention{panelGroup.intentions.length !== 1 ? "s" : ""}
              </div>

              {/* Intentions table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.85rem",
                }}>
                  <thead>
                    <tr>
                      {["#", "Requested By", "Intention Type", "Intention For", "Notes"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "10px 14px",
                            textAlign: "left",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: "#64748b",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            background: "#f8fafc",
                            borderBottom: "2px solid #e2e8f0",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {panelGroup.intentions.map((i, idx) => {
                      const data   = i.sacramentSpecificData || {};
                      const isDone = i.intentionStatus === "done";
                      const tdBase = {
                        padding: "11px 14px",
                        color: "#334155",
                        borderBottom: "1px solid #f1f5f9",
                        verticalAlign: "top",
                        background: isDone ? "#f0fdf4" : "transparent",
                      };
                      return (
                        <tr key={i._id}>
                          <td style={{ ...tdBase, color: "#94a3b8", fontWeight: 600, width: 36 }}>
                            {idx + 1}
                          </td>
                          <td style={{ ...tdBase, fontWeight: 500 }}>
                            {data.requesterName || "—"}
                          </td>
                          <td style={tdBase}>
                            {data.intentionType || "—"}
                          </td>
                          <td style={tdBase}>
                            {data.intentionFor || "—"}
                          </td>
                          <td style={{ ...tdBase, fontStyle: "italic", color: "#64748b" }}>
                            {i.message || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
