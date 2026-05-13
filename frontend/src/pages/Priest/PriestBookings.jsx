import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, Bell, CalendarDays, CalendarX, Clock3, MapPin,
  User, Phone, CheckCircle2, Clock
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

function PriestBookings() {
  const navigate = useNavigate();
  const { showError } = useToast();
  const goBack = (fallback = "/priest-dashboard") => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback);
  };
  const [bookings, setBookings]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [confirming, setConfirming] = useState(null);

  const token = localStorage.getItem("token");

  const fetchBookings = async () => {
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

  useEffect(() => { fetchBookings(); }, []);

  const confirmAvailability = async (id) => {
    setConfirming(id);
    try {
      await axios.put(
  `http://localhost:5000/api/bookings/${id}/priest-accept`,
  {},
  { headers: { Authorization: `Bearer ${token}` } }
);
      await fetchBookings();
    } catch {
      showError("Failed to confirm availability. Please try again.");
    } finally {
      setConfirming(null);
    }
  };

  const rejectBooking = async (id) => {
  try {
    await axios.put(
      `http://localhost:5000/api/bookings/${id}/priest-reject`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await fetchBookings();
  } catch {
    showError("Failed to reject booking.");
  }
};

  return (
    <div className="mobile-dashboard">
      {/* ── Top bar ── */}
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => goBack("/priest-dashboard")}>
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h2>Bookings</h2>
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
            <CalendarDays size={22} strokeWidth={1.8} />
          </div>
          <div>
            <h3>Approved Sacrament Bookings</h3>
            <p>Assigned services ready for confirmation</p>
          </div>
        </div>

        <div className="priest-schedule-list">
          {loading ? (
            <div className="empty-bookings" style={{ padding: "24px 0" }}>
              <p>Loading bookings…</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="empty-bookings" style={{ padding: "24px 0" }}>
              <div className="empty-icon">
                <CalendarX size={28} strokeWidth={1.5} />
              </div>
              <h3>No Approved Bookings</h3>
              <p>There are no approved bookings assigned at this time.</p>
            </div>
          ) : (
            bookings.map((b) => (
              <div className="priest-schedule-card" key={b._id}>
                <h4>{b.sacramentType}</h4>

                <p><User size={14} strokeWidth={2} />{b.parishioner?.fullName || "—"}</p>
                {b.contactNumber && <p><Phone size={14} strokeWidth={2} />{b.contactNumber}</p>}
                <p><CalendarDays size={14} strokeWidth={2} />{formatDate(b.preferredDate)}</p>
                <p><Clock3 size={14} strokeWidth={2} />{b.preferredTime}</p>
                {b.address && <p><MapPin size={14} strokeWidth={2} />{b.address}</p>}

                {b.priestConfirmationStatus === "accepted" ? (
                  <span className="status-badge status-badge-accepted">
                    <CheckCircle2 size={12} strokeWidth={2.5} />
                    Availability Accepted
                  </span>
                ) : (
                  <>
                    <span className="status-badge status-badge-pending">
                      <Clock size={12} strokeWidth={2.5} />
                      Awaiting Confirmation
                    </span>
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
                  </>
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

export default PriestBookings;
