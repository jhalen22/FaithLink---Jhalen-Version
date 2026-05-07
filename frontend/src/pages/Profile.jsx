import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Profile.css";

function Profile() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [stats, setStats] = useState({
    bookings: 0,
    donations: 0,
    events: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/profile/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(res.data);
    } catch (error) {
      console.log("Profile stats error:", error.response?.data || error.message);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="mobile-dashboard">
      <div className="profile-header">
        <div className="profile-avatar">👤</div>

        <h2>
          {localStorage.getItem("fullName") &&
          localStorage.getItem("fullName") !== "undefined"
            ? localStorage.getItem("fullName")
            : role === "priest"
            ? "Priest Name"
            : "Parishioner Name"}
        </h2>

        <p>
          {localStorage.getItem("email") &&
          localStorage.getItem("email") !== "undefined"
            ? localStorage.getItem("email")
            : "user@email.com"}
        </p>
      </div>

      <div className="profile-stats">
        <div>
          <h3>{stats.bookings}</h3>
          <p>{role === "priest" ? "Schedules" : "Bookings"}</p>
        </div>

        <div>
          <h3>₱{stats.donations}</h3>
          <p>{role === "priest" ? "Duties" : "Donations"}</p>
        </div>

        <div>
          <h3>{stats.events}</h3>
          <p>Events</p>
        </div>
      </div>

      <div className="profile-list">
        {role === "priest" ? (
          <>
            <div className="profile-row" onClick={() => navigate("/priest-schedules")}>
              <span className="profile-icon">📅</span>
              <div>
                <h4>Assigned Schedules</h4>
                <p>View your mass and parish duties</p>
              </div>
              <span>›</span>
            </div>

            <div className="profile-row" onClick={() => navigate("/priest-seminars")}>
              <span className="profile-icon">🎓</span>
              <div>
                <h4>Seminar Schedules</h4>
                <p>View assigned formation sessions</p>
              </div>
              <span>›</span>
            </div>

            <div className="profile-row" onClick={() => navigate("/priest-bookings")}>
              <span className="profile-icon">⛪</span>
              <div>
                <h4>Approved Bookings</h4>
                <p>View assigned sacrament bookings</p>
              </div>
              <span>›</span>
            </div>

            <div className="profile-row" onClick={() => navigate("/priest-alerts")}>
              <span className="profile-icon">🔔</span>
              <div>
                <h4>Notifications</h4>
                <p>View reminders from administrator</p>
              </div>
              <span>›</span>
            </div>

            <div className="profile-row" onClick={() => navigate("/settings")}>
              <span className="profile-icon">⚙️</span>
              <div>
                <h4>Settings</h4>
                <p>App preferences & privacy</p>
              </div>
              <span>›</span>
            </div>
          </>
        ) : (
          <>
            <div className="profile-row" onClick={() => navigate("/personal-information")}>
              <span className="profile-icon">👤</span>
              <div>
                <h4>Personal Information</h4>
                <p>Update your profile details</p>
              </div>
              <span>›</span>
            </div>

            <div className="profile-row" onClick={() => navigate("/bookings")}>
              <span className="profile-icon">📅</span>
              <div>
                <h4>My Bookings</h4>
                <p>View all sacrament bookings</p>
              </div>
              <span>›</span>
            </div>

            <div className="profile-row" onClick={() => navigate("/donation-history")}>
              <span className="profile-icon">💝</span>
              <div>
                <h4>Donation History</h4>
                <p>Track your contributions</p>
              </div>
              <span>›</span>
            </div>

            <div className="profile-row" onClick={() => navigate("/mass-intentions")}>
              <span className="profile-icon">🕯️</span>
              <div>
                <h4>Mass Intentions</h4>
                <p>View your prayer requests</p>
              </div>
              <span>›</span>
            </div>

            <div className="profile-row" onClick={() => navigate("/settings")}>
              <span className="profile-icon">⚙️</span>
              <div>
                <h4>Settings</h4>
                <p>App preferences & privacy</p>
              </div>
              <span>›</span>
            </div>

            <div className="profile-row" onClick={() => navigate("/notifications")}>
              <span className="profile-icon">🔔</span>
              <div>
                <h4>Notifications</h4>
                <p>Manage your alerts</p>
              </div>
              <span>›</span>
            </div>
          </>
        )}
      </div>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>

      <div className="bottom-nav">
        <div onClick={() => navigate(role === "priest" ? "/priest-dashboard" : "/dashboard")}>
          🏠
          <p>Home</p>
        </div>

        <div onClick={() => navigate("/events")}>
          📅
          <p>Events</p>
        </div>

        <div onClick={() => navigate(role === "priest" ? "/priest-bookings" : "/bookings")}>
          📝
          <p>Bookings</p>
        </div>

        <div onClick={() => navigate("/live-mass")}>
          📹
          <p>Live Mass</p>
        </div>

        <div onClick={() => navigate("/profile")}>
          👤
          <p>Profile</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;