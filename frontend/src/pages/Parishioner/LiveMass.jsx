import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Parishioner/LiveMass.css";

function LiveMass() {
  const navigate = useNavigate();

  return (
    <div className="live-page">
      <div className="live-header">
  <button className="live-back" onClick={() => navigate("/dashboard")}>
    ←
  </button>
  <h1>Live Mass</h1>
</div>

      <div className="live-content">
        <div className="live-card">
          <div className="live-video">
            <iframe
              src="https://www.youtube.com/embed/jfKfPfyJRdk"
              title="Live Mass"
              allowFullScreen
            ></iframe>

            <span className="live-badge">LIVE NOW</span>
          </div>

          <div className="live-info">
            <h2>Sunday Holy Mass</h2>
            <p>
              Join the live celebration of the Holy Mass and participate online
              with the parish community.
            </p>
          </div>
        </div>

        <div className="schedule-card">
          <h3>Mass Schedule</h3>
          <p>Sunday Mass: 8:00 AM / 10:00 AM / 5:00 PM</p>
          <p>Weekday Mass: 6:00 AM</p>
        </div>
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

export default LiveMass;