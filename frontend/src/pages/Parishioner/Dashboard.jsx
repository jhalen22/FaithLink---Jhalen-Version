import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar, Heart, Video, BookMarked, Play } from "lucide-react";
import BottomNav from "../../components/BottomNav";
import "../../styles/Parishioner/Dashboard.css";
import NotificationBell from "../../components/NotificationBell";

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
      .catch(() => {});
  }, []);

  const unreadIntentionCount = notifications.filter(
    (n) =>
      !n.isRead &&
      (n.title?.toLowerCase().includes("mass intention") ||
       n.message?.toLowerCase().includes("mass intention"))
  ).length;

  const [stream, setStream]           = useState(null);
  const [showHomeVideo, setShowHomeVideo] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/livestream")
      .then((res) => setStream(res.data.stream || null))
      .catch(() => setStream(null));
  }, []);

  const getYoutubeId = (url = "") => {
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname.includes("youtube.com")) return parsedUrl.searchParams.get("v");
      if (parsedUrl.hostname.includes("youtu.be")) return parsedUrl.pathname.replace("/", "");
      return "";
    } catch {
      return "";
    }
  };

  const videoId = getYoutubeId(stream?.url);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : "";

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <div className="logo-box">
            <span style={{ fontSize: 18, fontWeight: 700 }}>✝</span>
          </div>
          <h2>FaithLink</h2>
        </div>

        <div className="top-icons">
          <NotificationBell />
        </div>
      </div>

      <div className="quick-actions">
        <div className="action-item" onClick={() => navigate("/select-service")}>
          <div className="action-icon">
            <Calendar size={24} strokeWidth={1.8} />
          </div>
          <p>Book</p>
        </div>

        <div className="action-item" onClick={() => navigate("/donation")}>
          <div className="action-icon">
            <Heart size={24} strokeWidth={1.8} />
          </div>
          <p>Donate</p>
        </div>

        <div className="action-item" onClick={() => navigate("/live-mass")}>
          <div className="action-icon">
            <Video size={24} strokeWidth={1.8} />
          </div>
          <p>Live Mass</p>
        </div>

        <div className="action-item" onClick={() => navigate("/mass-intentions")}>
          <div style={{ position: "relative", display: "inline-flex" }}>
            <div className="action-icon">
              <BookMarked size={24} strokeWidth={1.8} />
            </div>
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

      <div className="content-card">
        <div className="church-header">
          <div className="church-logo">
            <span style={{ fontSize: 22 }}>✝</span>
          </div>

          <div>
            <h3>Holy Cross Parish</h3>
            <div className="live-meta-row">
              {stream?.status === "live" && (
                <span className="live-pill">LIVE NOW</span>
              )}
            </div>
            <p className="mass-title">
              {stream?.title || "Sunday Holy Mass"}
            </p>
          </div>
        </div>

        <p className="post-text">Join us for Sunday Holy Mass.</p>

        {!showHomeVideo ? (
          <div
            className="home-video-thumbnail"
            onClick={() => setShowHomeVideo(true)}
          >
            {thumbnailUrl && <img src={thumbnailUrl} alt="Live Mass" />}
            <div className="home-video-overlay">
              <button className="play-btn">
                <Play size={22} fill="white" strokeWidth={0} />
              </button>
              <p>Tap to join live mass</p>
            </div>
          </div>
        ) : (
          <div className="embedded-video-box">
            <iframe
              src={`${stream?.embedUrl}?autoplay=1`}
              title={stream?.title || "Live Mass"}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        )}

        <div className="post-actions">
          <button type="button" onClick={() => navigate("/live-mass")}>
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
