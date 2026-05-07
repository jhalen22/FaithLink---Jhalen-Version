import { useNavigate } from "react-router-dom";
import "../../styles/Priest/PriestDashboard.css";

function PriestDashboard() {
  const navigate = useNavigate();

  const fullName =
    localStorage.getItem("fullName") &&
    localStorage.getItem("fullName") !== "undefined"
      ? localStorage.getItem("fullName")
      : "Father";

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <div className="logo-box">✝</div>
          <h2>FaithLink</h2>
        </div>

        <div className="top-icons">
          <span onClick={() => alert("Search feature coming soon")}>🔍</span>
          <span onClick={() => navigate("/notifications")}>🔔</span>
        </div>
      </div>

      <div className="priest-welcome">
        <h2>Welcome, {fullName}</h2>
        <p>Manage assigned schedules, seminars, bookings, and availability.</p>
      </div>

      <div className="quick-actions">
  <div className="action-item" onClick={() => navigate("/priest-schedules")}>
    <div className="action-icon">⛪</div>
    <p>Mass Schedules</p>
  </div>

  <div className="action-item" onClick={() => navigate("/priest-seminars")}>
    <div className="action-icon">🎓</div>
    <p>Seminars</p>
  </div>

  <div className="action-item" onClick={() => navigate("/priest-bookings")}>
    <div className="action-icon">📅</div>
    <p>Bookings</p>
  </div>

  <div className="action-item" onClick={() => navigate("/priest-alerts")}>
    <div className="action-icon">🔔</div>
    <p>Updates</p>
  </div>
</div>

      <div className="content-card">
        <div className="church-header">
          <div className="church-logo">📌</div>
          <div>
            <h3>Today’s Schedule</h3>
            <p>
              <span>ASSIGNED</span> • Parish Duties
            </p>
          </div>
        </div>

        <div className="priest-schedule-list">
          <div className="priest-schedule-card">
            <h4>Sunday Holy Mass</h4>
            <p>📅 May 12, 2026</p>
            <p>⏰ 8:00 AM</p>
            <p>📍 Main Parish Church</p>
            <button onClick={() => alert("Availability confirmed")}>
              Confirm Availability
            </button>
          </div>

          <div className="priest-schedule-card">
            <h4>Marriage Seminar</h4>
            <p>📅 May 14, 2026</p>
            <p>⏰ 1:00 PM</p>
            <p>📍 Parish Hall</p>
            <button onClick={() => alert("Schedule acknowledged")}>
              Acknowledge Schedule
            </button>
          </div>

          <div className="priest-schedule-card">
            <h4>Baptism Booking</h4>
            <p>📅 May 16, 2026</p>
            <p>⏰ 10:00 AM</p>
            <p>📍 Chapel Area</p>
            <button onClick={() => alert("Availability confirmed")}>
              Confirm Availability
            </button>
          </div>
        </div>
      </div>

      <div className="bottom-nav">
  <div onClick={() => navigate("/priest-dashboard")}>
    🏠
    <p>Home</p>
  </div>

  <div onClick={() => navigate("/priest-schedules")}>
    📅
    <p>Schedules</p>
  </div>

  <div onClick={() => navigate("/priest-seminars")}>
    🎓
    <p>Seminars</p>
  </div>

  <div onClick={() => navigate("/priest-alerts")}>
    🔔
    <p>Alerts</p>
  </div>

  <div onClick={() => navigate("/profile")}>
    👤
    <p>Profile</p>
  </div>
</div>
    </div>
  );
}

export default PriestDashboard;