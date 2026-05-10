import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, Bell, CalendarDays, Clock3, MapPin, User,
  Church, CheckCircle2, Clock
} from "lucide-react";
import BottomNav from "../../components/BottomNav";
import "../../styles/Priest/PriestDashboard.css";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
  });
};

function PriestSchedules() {
  const navigate = useNavigate();
  const goBack = (fallback = "/priest-dashboard") => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback);
  };
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/bookings/priest/approved",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBookings(res.data.bookings || []);
      } catch {
        // Show empty state on error
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  return (
    <div className="mobile-dashboard">
      {/* ── Top bar ── */}
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => goBack("/priest-dashboard")}>
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h2>Mass Schedules</h2>
        </div>
        <div className="top-actions">
          <button className="top-icon-btn" onClick={() => navigate("/priest-alerts")}>
            <Bell size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── Content card ── */}
      <div className="content-card" style={{ marginBottom: "calc(var(--nav-h) + 14px)" }}>
        <div className="church-header">
          <div className="church-logo">
            <Church size={22} strokeWidth={1.8} />
          </div>
          <div>
            <h3>Assigned Sacrament Schedule</h3>
            <p>Approved bookings — read only</p>
          </div>
        </div>

        <div className="priest-schedule-list">
          {loading ? (
            <div className="empty-bookings" style={{ padding: "24px 0" }}>
              <p>Loading schedule…</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="empty-bookings" style={{ padding: "24px 0" }}>
              <div className="empty-icon">
                <Church size={28} strokeWidth={1.5} />
              </div>
              <h3>No Assigned Schedules</h3>
              <p>No approved bookings have been assigned yet.</p>
            </div>
          ) : (
            bookings.map((b) => (
              <div className="priest-schedule-card" key={b._id}>
                <h4>{b.sacramentType}</h4>
                <p><User size={14} strokeWidth={2} />{b.parishioner?.fullName || "—"}</p>
                <p><CalendarDays size={14} strokeWidth={2} />{formatDate(b.preferredDate)}</p>
                <p><Clock3 size={14} strokeWidth={2} />{b.preferredTime}</p>
                {b.address && <p><MapPin size={14} strokeWidth={2} />{b.address}</p>}

                {b.priestConfirmationStatus === "confirmed" ? (
                  <span className="status-badge status-badge-confirmed">
                    <CheckCircle2 size={12} strokeWidth={2.5} />
                    Confirmed
                  </span>
                ) : (
                  <span className="status-badge status-badge-pending">
                    <Clock size={12} strokeWidth={2.5} />
                    Awaiting Confirmation
                  </span>
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

export default PriestSchedules;
