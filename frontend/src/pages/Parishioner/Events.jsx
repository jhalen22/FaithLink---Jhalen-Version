import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Search, Bell, CalendarDays } from "lucide-react";
import BottomNav from "../../components/BottomNav";
import "../../styles/Parishioner/Events.css";

// Status label and colour mapping
const STATUS_CONFIG = {
  upcoming:  { label: "Upcoming",  color: "#1d4ed8", bg: "#eff6ff" },
  ongoing:   { label: "Ongoing",   color: "#166534", bg: "#dcfce7" },
  completed: { label: "Completed", color: "#64748b", bg: "#f1f5f9" },
};

function Events() {
  const navigate = useNavigate();
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/events");
        setEvents(res.data || []);
      } catch {
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h2>Events</h2>
        </div>
        <div className="top-actions">
          <button className="top-icon-btn" onClick={() => alert("Search coming soon")}>
            <Search size={18} strokeWidth={2} />
          </button>
          <button className="top-icon-btn" onClick={() => navigate("/notifications")}>
            <Bell size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="events-page">
        {loading ? (
          <div className="empty-bookings">
            <p style={{ color: "#64748b" }}>Loading events…</p>
          </div>
        ) : error ? (
          <div className="empty-bookings">
            <p style={{ color: "#dc2626" }}>{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-bookings">
            <div className="empty-icon">
              <CalendarDays size={34} strokeWidth={1.5} />
            </div>
            <h3>No Events Posted</h3>
            <p>Parish events and announcements will appear here once posted by the admin.</p>
          </div>
        ) : (
          events.map((event) => {
            const cfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming;
            return (
              <div className="event-card" key={event._id}>
                <div className="event-placeholder">⛪</div>

                <div className="event-content">
                  {/* Status badge */}
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: cfg.color,
                      background: cfg.bg,
                      padding: "2px 8px",
                      borderRadius: 20,
                      marginBottom: 6,
                    }}
                  >
                    {cfg.label}
                  </span>

                  <h3>{event.title}</h3>

                  {event.description && (
                    <p style={{ color: "#4f5f76", fontSize: "13px", marginBottom: 4 }}>
                      {event.description}
                    </p>
                  )}

                  <p>📅 {event.date}</p>
                  <p>⏰ {event.time}</p>
                  <p>📍 {event.location}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default Events;
