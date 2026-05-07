import { useNavigate } from "react-router-dom";
import "../styles/PriestDashboard.css";

function PriestSeminars() {
  const navigate = useNavigate();

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => navigate("/priest-dashboard")}>←</button>
          <h2>Seminars</h2>
        </div>
        <div className="top-icons"><span>🔔</span></div>
      </div>

      <div className="content-card">
        <div className="church-header">
          <div className="church-logo">🎓</div>
          <div>
            <h3>Seminar Schedules</h3>
            <p><span>ASSIGNED</span> • Formation Duties</p>
          </div>
        </div>

        <div className="priest-schedule-list">
          <div className="priest-schedule-card">
            <h4>Marriage Seminar</h4>
            <p>📅 May 14, 2026</p>
            <p>⏰ 1:00 PM</p>
            <p>📍 Parish Hall</p>
            <button>Acknowledge Schedule</button>
          </div>

          <div className="priest-schedule-card">
            <h4>Baptism Orientation</h4>
            <p>📅 May 18, 2026</p>
            <p>⏰ 9:00 AM</p>
            <p>📍 Catechism Room</p>
            <button>Acknowledge Schedule</button>
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

export default PriestSeminars;