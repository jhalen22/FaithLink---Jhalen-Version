import { useNavigate } from "react-router-dom";
import "../../styles/Priest/PriestDashboard.css";

function PriestSchedules() {
  const navigate = useNavigate();

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => navigate("/priest-dashboard")}>
            ←
          </button>
          <h2>Mass Schedules</h2>
        </div>

        <div className="top-icons">
          <span>🔔</span>
        </div>
      </div>

      <div className="content-card">
        <div className="church-header">
          <div className="church-logo">⛪</div>
          <div>
            <h3>Assigned Mass Schedules</h3>
            <p><span>VIEW</span> • Priest Duties</p>
          </div>
        </div>

        <div className="priest-schedule-list">
          <div className="priest-schedule-card">
            <h4>Sunday Holy Mass</h4>
            <p>📅 May 12, 2026</p>
            <p>⏰ 8:00 AM</p>
            <p>📍 Main Parish Church</p>
            <button>Confirm Availability</button>
          </div>

          <div className="priest-schedule-card">
            <h4>Weekday Morning Mass</h4>
            <p>📅 May 13, 2026</p>
            <p>⏰ 6:00 AM</p>
            <p>📍 Chapel Area</p>
            <button>Confirm Availability</button>
          </div>
        </div>
      </div>

      <div className="bottom-nav">
        <div onClick={() => navigate("/priest-dashboard")}>🏠<p>Home</p></div>
        <div onClick={() => navigate("/priest-schedules")}>📅<p>Schedules</p></div>
        <div onClick={() => navigate("/priest-seminars")}>🎓<p>Seminars</p></div>
        <div onClick={() => navigate("/priest-alerts")}>🔔<p>Alerts</p></div>
        <div onClick={() => navigate("/profile")}>👤<p>Profile</p></div>
      </div>
    </div>
  );
}

export default PriestSchedules;