import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, Bell, Calendar, Heart, Video, BookMarked, Play, HandHeart, MessageCircle } from "lucide-react";
import BottomNav from "../../components/BottomNav";
import "../../styles/Parishioner/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setNotifications(res.data || []))
      .catch(() => {}); // silently ignore — badge is non-critical
  }, []);

  // Count unread notifications whose title or message is about a Mass Intention.
  // Booking, donation, and system notifications are excluded.
  const unreadIntentionCount = notifications.filter(
    (n) =>
      !n.isRead &&
      (n.title?.toLowerCase().includes("mass intention") ||
       n.message?.toLowerCase().includes("mass intention"))
  ).length;

  return (
    <div className="mobile-dashboard">
      {/* ── Top bar ── */}
      <div className="top-bar">
        <div className="brand">
          <div className="logo-box">
            <span style={{ fontSize: 18, fontWeight: 700 }}>✝</span>
          </div>
          <h2>FaithLink</h2>
        </div>
        <div className="top-icons">
          <button className="top-icon-btn" onClick={() => alert("Search feature coming soon")}>
            <Search size={18} strokeWidth={2} />
          </button>
          <button className="top-icon-btn" onClick={() => navigate("/notifications")}>
            <Bell size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="quick-actions">
        <div className="action-item" onClick={() => navigate("/bookings")}>
          <div className="action-icon"><Calendar size={24} strokeWidth={1.8} /></div>
          <p>Book</p>
        </div>
        <div className="action-item" onClick={() => navigate("/donation")}>
          <div className="action-icon"><Heart size={24} strokeWidth={1.8} /></div>
          <p>Donate</p>
        </div>
        <div className="action-item" onClick={() => navigate("/live-mass")}>
          <div className="action-icon"><Video size={24} strokeWidth={1.8} /></div>
          <p>Live Mass</p>
        </div>
        <div className="action-item" onClick={() => navigate("/mass-intentions")}>
          <div style={{ position: "relative", display: "inline-flex" }}>
            <div className="action-icon"><BookMarked size={24} strokeWidth={1.8} /></div>
            {unreadIntentionCount > 0 && (
              <span style={{
                position: "absolute",
                top: -4,
                right: -4,
                background: "#EF4444",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 3px",
                lineHeight: 1,
                pointerEvents: "none",
                boxShadow: "0 0 0 2px #f6f8fc",
              }}>
                {unreadIntentionCount > 9 ? "9+" : unreadIntentionCount}
              </span>
            )}
          </div>
          <p>Intentions</p>
        </div>
      </div>

      {/* ── Live stream card ── */}
      <div className="content-card">
        <div className="church-header">
          <div className="church-logo">
            <span style={{ fontSize: 22 }}>✝</span>
          </div>
          <div>
            <h3>Holy Cross Parish</h3>
            <p>
              <span className="live-pill">LIVE NOW</span>
              Sunday Mass
            </p>
          </div>
        </div>

        <p className="post-text">
          Join us for Sunday Mass celebrated by Fr. John Smith.
          <br />
          Today&apos;s reading: John 3:16–21
        </p>

        <div className="video-box" onClick={() => navigate("/live-mass")}>
          <button className="play-btn">
            <Play size={22} fill="white" strokeWidth={0} />
          </button>
          <p>Tap to join live mass</p>
        </div>

        <div className="post-stats">
          <p>428 prayers</p>
          <p>89 comments</p>
        </div>

        <div className="post-actions">
          <button onClick={() => navigate("/notifications")}>
            <HandHeart size={14} strokeWidth={2} />
            Pray
          </button>
          <button>
            <MessageCircle size={14} strokeWidth={2} />
            Comment
          </button>
          <button onClick={() => navigate("/live-mass")}>
            <Video size={14} strokeWidth={2} />
            Watch
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default Dashboard;
