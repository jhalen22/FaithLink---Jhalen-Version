import { useNavigate } from "react-router-dom";
import "../../styles/Parishioner/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <div className="logo-box">✝</div>
          <h2>FaithLink</h2>
        </div>

        <div className="top-icons">
          <span onClick={() => alert("Search feature coming soon")}>🔍</span>
          <span onClick={() => alert("No new notifications")}>🔔</span>
        </div>
      </div>

      <div className="quick-actions">
        <div
          className="action-item"
          onClick={() => navigate("/bookings")}
        >
          <div className="action-icon">📅</div>
          <p>Book</p>
        </div>

        <div
          className="action-item"
          onClick={() => navigate("/donation")}
        >
          <div className="action-icon">💝</div>
          <p>Donate</p>
        </div>

        <div
          className="action-item"
          onClick={() => navigate("/live-mass")}
        >
          <div className="action-icon">📹</div>
          <p>Live Mass</p>
        </div>

        <div
          className="action-item"
          onClick={() => navigate("/bookings")}
        >
          <div className="action-icon">🕯️</div>
          <p>Intentions</p>
        </div>
      </div>

      <div className="content-card">
        <div className="church-header">
          <div className="church-logo">✝</div>

          <div>
            <h3>Holy Cross Parish</h3>

            <p>
              <span className="live-pill">LIVE NOW</span> • Sunday Mass
            </p>
          </div>
        </div>

        <p className="post-text">
          Join us for Sunday Mass celebrated by Fr. John Smith.
          <br />
          Today's reading: John 3:16-21
        </p>

        <div
          className="video-box"
          onClick={() => navigate("/live-mass")}
        >
          <button className="play-btn">▶</button>

          <p>Click to join live mass</p>
        </div>

        <div className="post-stats">
          <p>🙏 428 prayers</p>
          <p>89 comments</p>
        </div>

        <div className="post-actions">
          <button>🙏 Pray</button>

          <button>💬 Comment</button>

          <button onClick={() => navigate("/live-mass")}>
            📺 Watch
          </button>
        </div>
      </div>

      <div className="bottom-nav">
        <div onClick={() => navigate("/dashboard")}>
          🏠
          <p>Home</p>
        </div>

        <div onClick={() => navigate("/events")}>
          📅
          <p>Events</p>
        </div>

        <div onClick={() => navigate("/bookings")}>
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

export default Dashboard;   