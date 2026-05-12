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
  const [replayStreams, setReplayStreams] = useState([]);

  useEffect(() => {
  axios
    .get("http://localhost:5000/api/livestream")
    .then((res) => setStream(res.data.stream || null))
    .catch(() => setStream(null));

  axios
    .get("http://localhost:5000/api/livestream/replays")
    .then((res) => setReplayStreams(res.data || []))
    .catch(() => setReplayStreams([]));
}, []);

  useEffect(() => {
  if (!stream || stream.status !== "live") return;

  const interval = setInterval(async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/livestream/${stream._id}/view`
      );

      const res = await axios.get(
        "http://localhost:5000/api/livestream"
      );

      setStream(res.data.stream || null);
    } catch (error) {
      console.error(error);
    }
  }, 10000);

  return () => clearInterval(interval);
}, [stream?._id, stream?.status]);

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

  const isLive = stream?.status === "live";
  const isCountdown = stream?.status === "countdown";
  const isScheduled = stream?.status === "scheduled" || stream?.status === "not-live";
  const videoId = getYoutubeId(stream?.url);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : "";

  const liveStatusText = isLive
    ? "LIVE NOW"
    : isCountdown
    ? "STARTING SOON"
    : isScheduled
    ? "SCHEDULED"
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
              {liveStatusText && (
                <span className="live-pill">{liveStatusText}</span>
              )}
            </div>
            <p className="mass-title">
              {stream?.title || "Sunday Holy Mass"}
            </p>
            {isLive && (
  <p
    style={{
      color: "#EF4444",
      fontWeight: 600,
      fontSize: "0.9rem",
      marginTop: 4,
    }}
  >
    👁️ {stream?.viewerCount || 0} watching now
  </p>
)}
          </div>
        </div>

        <p className="post-text">
          {isLive
            ? "Join the ongoing parish livestream."
            : isCountdown
            ? "The livestream is starting soon. Open Live Mass to wait for the broadcast."
            : isScheduled
            ? "A livestream has been scheduled. Check the Live Mass page for updates."
            : "Join us for Sunday Holy Mass."}
        </p>

        {!showHomeVideo ? (
          <div
            className="home-video-thumbnail"
            onClick={() => navigate("/live-mass")}
          >
            {thumbnailUrl && <img src={thumbnailUrl} alt="Live Mass" />}
            <div className="home-video-overlay">
              <button className="play-btn">
                <Play size={22} fill="white" strokeWidth={0} />
              </button>
              <p>{isLive ? "Tap to watch live" : isCountdown ? "Tap to wait for stream" : "Tap to view live mass"}</p>
            </div>
          </div>
        ) : (
          <div className="embedded-video-box">
            {stream?.embedUrl ? (
              <iframe
                src={`${stream?.embedUrl}?autoplay=1`}
                title={stream?.title || "Live Mass"}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <div className="home-video-overlay" style={{ position: "static", minHeight: 180 }}>
                <p>Livestream room is active. Open Live Mass to watch.</p>
              </div>
            )}
          </div>
        )}

        {replayStreams.length > 0 && (
  <div
    style={{
      marginTop: 18,
      display: "flex",
      flexDirection: "column",
      gap: 14,
    }}
  >
    <h3
      style={{
        fontSize: "1rem",
        fontWeight: 700,
      }}
    >
      Latest Replay
    </h3>

    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid #e2e8f0",
      }}
    >
      <video
        src={`http://localhost:5000${replayStreams[0].replayVideoUrl}`}
        controls
        width="100%"
      />

      <div style={{ padding: 14 }}>
        <h4
          style={{
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          {replayStreams[0].replayTitle || replayStreams[0].title}
        </h4>

        <p
          style={{
            color: "#64748b",
            fontSize: "0.9rem",
            lineHeight: 1.5,
          }}
        >
          {replayStreams[0].replayDescription ||
            "Watch the latest parish replay."}
        </p>
      </div>
    </div>
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
