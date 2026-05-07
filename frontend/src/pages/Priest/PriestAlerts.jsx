import { useNavigate } from "react-router-dom";
import "../../styles/Priest/PriestDashboard.css";

function PriestAlerts() {
  const navigate = useNavigate();

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => navigate("/priest-dashboard")}>←</button>
          <h2>Alerts</h2>
        </div>
        <div className="top-icons"><span>🔔</span></div>
      </div>

      <div className="content-card">
        <div className="church-header">
          <div className="church-logo">🔔</div>
          <div>
            <h3>Notifications and Updates</h3>
            <p><span>NEW</span> • Administrator Reminders</p>
          </div>
        </div>

        <div className="priest-schedule-list">
          <div className="priest-schedule-card">
            <h4>Schedule Reminder</h4>
            <p>You have an assigned Sunday Mass schedule this week.</p>
            <p>📅 May 12, 2026</p>
          </div>

          <div className="priest-schedule-card">
            <h4>Admin Update</h4>
            <p>Please confirm your availability for upcoming sacrament bookings.</p>
            <p>📅 May 14, 2026</p>
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

export default PriestAlerts;