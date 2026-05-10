import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Search, Bell, CalendarDays, X } from "lucide-react";
import BottomNav from "../../components/BottomNav";
import "../../styles/Parishioner/Events.css";
import NotificationBell from "../../components/NotificationBell";

const STATUS_CONFIG = {
  upcoming: { label: "Upcoming", color: "#1d4ed8", bg: "#eff6ff" },
  ongoing: { label: "Ongoing", color: "#166534", bg: "#dcfce7" },
  completed: { label: "Completed", color: "#64748b", bg: "#f1f5f9" },
};

function Events() {
  const navigate = useNavigate();
  const goBack = (fallback = "/dashboard") => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback);
  };
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredEvents = events.filter((event) => {
    const searchableText = `
      ${event.title || ""}
      ${event.description || ""}
      ${event.date || ""}
      ${event.time || ""}
      ${event.location || ""}
      ${event.status || ""}
    `.toLowerCase();

    return searchableText.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => goBack("/dashboard")}>
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h2>Events</h2>
        </div>

        <div className="top-actions">
          <button
            className="top-icon-btn"
            onClick={() => setShowSearch((prev) => !prev)}
          >
            {showSearch ? <X size={18} /> : <Search size={18} />}
          </button>

          <NotificationBell />
        </div>
      </div>

      {showSearch && (
        <div className="page-search-area">
          <input
            type="text"
            placeholder="Search events by title, date, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
      )}

      <div className="events-page">
        {loading ? (
          <div className="empty-bookings">
            <p style={{ color: "#64748b" }}>Loading events…</p>
          </div>
        ) : error ? (
          <div className="empty-bookings">
            <p style={{ color: "#dc2626" }}>{error}</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-bookings">
            <div className="empty-icon">
              <CalendarDays size={34} strokeWidth={1.5} />
            </div>
            <h3>No Events Found</h3>
            <p>
              {searchTerm
                ? "No events match your search."
                : "Parish events and announcements will appear here once posted by the admin."}
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const cfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming;

            return (
              <div className="event-card" key={event._id}>
                <div className="event-placeholder">⛪</div>

                <div className="event-content">
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