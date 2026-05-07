import { useNavigate } from "react-router-dom";
import "../../styles/Parishioner/Events.css";

function Events() {
  const navigate = useNavigate();

  const events = [];

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            ←
          </button>
          <h2>Events</h2>
        </div>

        <div className="top-icons">
          <span>🔍</span>
          <span>🔔</span>
        </div>
      </div>

      <div className="events-page">
        {events.length === 0 ? (
          <div className="empty-bookings">
            <div className="empty-icon">📅</div>
            <h3>No Events Posted</h3>
            <p>Parish events and announcements will appear here once posted by the admin.</p>
          </div>
        ) : (
          events.map((event) => (
            <div className="event-card" key={event._id}>
              <div className="event-placeholder">⛪</div>

              <div className="event-content">
                <h3>{event.title}</h3>
                <p>📅 {event.date}</p>
                <p>⏰ {event.time}</p>
                <p>📍 {event.location}</p>
                <button className="event-btn">View Details</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bottom-nav">
        <div onClick={() => navigate("/dashboard")}>🏠<p>Home</p></div>
        <div onClick={() => navigate("/events")}>📅<p>Events</p></div>
        <div onClick={() => navigate("/bookings")}>📝<p>Bookings</p></div>
        <div onClick={() => navigate("/live-mass")}>📹<p>Live Mass</p></div>
        <div onClick={() => navigate("/profile")}>👤<p>Profile</p></div>
      </div>
    </div>
  );
}

export default Events;