import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search, Bell, Clock, GraduationCap, BookOpen,
  ClipboardList, CalendarDays, Clock3, MapPin, CheckCircle2
} from "lucide-react";
import BottomNav from "../../components/BottomNav";
import "../../styles/Priest/PriestDashboard.css";
import { useToast } from "../../context/ToastContext";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
  });
};

function PriestDashboard() {
  const navigate = useNavigate();
  const { showError, showInfo } = useToast();
  const [upcoming, setUpcoming]     = useState([]);
  const [confirming, setConfirming] = useState(null);

  const fullName =
    localStorage.getItem("fullName") && localStorage.getItem("fullName") !== "undefined"
      ? localStorage.getItem("fullName")
      : "Father";

  const token = localStorage.getItem("token");

  const fetchUpcoming = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings/priest/approved", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpcoming(res.data.bookings || []);
    } catch { /* silently fail */ }
  };

  useEffect(() => { fetchUpcoming(); }, []);

  const confirmAvailability = async (id) => {
    setConfirming(id);
    try {
      await axios.put(
  `http://localhost:5000/api/bookings/${id}/priest-accept`,
  {},
  { headers: { Authorization: `Bearer ${token}` } }
);
      await fetchUpcoming();
    } catch {
      showError("Failed to confirm. Please try from the Bookings page.");
    } finally {
      setConfirming(null);
    }
  };

  const rejectBooking = async (id) => {
  try {
    await axios.put(
      `http://localhost:5000/api/bookings/${id}/priest-reject`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    await fetchUpcoming();
  } catch {
    showError("Failed to reject booking.");
  }
};

  return (
    <div className="mobile-dashboard">
      {/* ── Top bar ── */}
      <div className="top-bar">
        <div className="brand">
          <div className="logo-box">
            <span style={{ fontSize: 18, fontWeight: 700 }}>✝</span>
          </div>
          <h2>FaithLink</h2>
        </div>
        <div className="top-actions">
          <button className="top-icon-btn" onClick={() => showInfo("Search coming soon")}>
            <Search size={18} strokeWidth={2} />
          </button>
          <button className="top-icon-btn" onClick={() => navigate("/priest-alerts")}>
            <Bell size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── Hero welcome (gradient + gold accent line) ── */}
      <div className="priest-hero">
        <h2>Welcome, {fullName}</h2>
        <p>Manage your assigned schedules and bookings.</p>
      </div>


      {/* ── Upcoming bookings (gold-accented cards) ── */}
      <div
        className="content-card priest-dashboard-card"
        style={{ marginBottom: "calc(var(--nav-h) + 14px)" }}
      >
        <div className="church-header">
          <div className="church-logo">
            <ClipboardList size={22} strokeWidth={1.8} />
          </div>
          <div>
            <h3>Upcoming Bookings</h3>
            <p>Approved sacrament assignments</p>
          </div>
        </div>

        <div className="priest-schedule-list">
          {upcoming.length === 0 ? (
            <div className="empty-bookings" style={{ padding: "24px 0" }}>
              <div className="empty-icon">
                <CalendarDays size={28} strokeWidth={1.5} />
              </div>
              <p>No approved bookings yet.</p>
            </div>
          ) : (
            upcoming.map((b) => (
              <div className="priest-schedule-card" key={b._id}>
                <h4>{b.sacramentType}</h4>
                <p><CalendarDays size={14} strokeWidth={2} />{formatDate(b.preferredDate)}</p>
                <p><Clock3 size={14} strokeWidth={2} />{b.preferredTime}</p>
                {b.address && <p><MapPin size={14} strokeWidth={2} />{b.address}</p>}

                {b.priestConfirmationStatus === "accepted" ? (
                  <span className="status-badge status-badge-accepted">
                    <CheckCircle2 size={12} strokeWidth={2.5} />
                    Accepted
                  </span>
                ) : (
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
  <button
    className="priest-confirm-btn"
    disabled={confirming === b._id}
    style={{ opacity: confirming === b._id ? 0.6 : 1, flex: 1 }}
    onClick={() => confirmAvailability(b._id)}
  >
    {confirming === b._id ? "Confirming…" : "Accept"}
  </button>

  <button
    className="priest-reject-btn"
    style={{
      flex: 1,
      background: "#ef4444",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      fontWeight: "600",
      padding: "12px",
      cursor: "pointer",
    }}
    onClick={() => rejectBooking(b._id)}
  >
    Reject
  </button>
</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav type="priest" />
    </div>
  );
}

export default PriestDashboard;
