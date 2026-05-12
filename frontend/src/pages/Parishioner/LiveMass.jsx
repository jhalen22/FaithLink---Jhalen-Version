import { useState, useEffect } from "react";
import axios from "axios";
import { VideoOff, Clock, Calendar } from "lucide-react";
import BottomNav from "../../components/BottomNav";
import NotificationBell from "../../components/NotificationBell";
import "../../styles/Parishioner/LiveMass.css";
import LiveKitViewer from "../../components/LiveKitViewer";

function formatDateTime(value) {
  if (!value) return "To be announced";
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getCountdownText(stream) {
  if (!stream?.countdownStartedAt) return `${stream?.countdownMinutes || 5}:00`;

  const started = new Date(stream.countdownStartedAt).getTime();
  const totalSeconds = (Number(stream.countdownMinutes) || 5) * 60;
  const elapsedSeconds = Math.floor((Date.now() - started) / 1000);
  const remaining = Math.max(totalSeconds - elapsedSeconds, 0);

  const mins = Math.floor(remaining / 60);
  const secs = String(remaining % 60).padStart(2, "0");

  return `${mins}:${secs}`;
}

function LiveMass() {
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdownDisplay, setCountdownDisplay] = useState("");
  const [selectedReplay, setSelectedReplay] = useState(null);
  const [replayStreams, setReplayStreams] = useState([]);

  const fetchStream = () => {
    axios
      .get("http://localhost:5000/api/livestream")
      .then((res) => setStream(res.data.stream || null))
      .catch(() => setStream(null))
      .finally(() => setLoading(false));

    axios
      .get("http://localhost:5000/api/livestream/replays")
      .then((res) => setReplayStreams(res.data || []))
      .catch(() => setReplayStreams([]));
  };

  useEffect(() => {
    fetchStream();
    const refresh = setInterval(fetchStream, 15000);
    return () => clearInterval(refresh);
  }, []);

  useEffect(() => {
    if (!stream || stream.status !== "live") return;

    const interval = setInterval(async () => {
      try {
        await axios.put(`http://localhost:5000/api/livestream/${stream._id}/view`);
        const res = await axios.get("http://localhost:5000/api/livestream");
        setStream(res.data.stream || null);
      } catch (error) {
        console.error(error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [stream?._id, stream?.status]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (stream?.status === "countdown") {
        setCountdownDisplay(getCountdownText(stream));
      }
    }, 1000);

    if (stream?.status === "countdown") {
      setCountdownDisplay(getCountdownText(stream));
    }

    return () => clearInterval(timer);
  }, [stream]);

  const isLive = stream?.status === "live";
  const isCountdown = stream?.status === "countdown";
  const isScheduled =
    stream?.status === "scheduled" || stream?.status === "not-live";

  return (
    <div className="live-page">
      <div className="live-header">
        <h1 className="live-header-title">Live Mass</h1>
        <div className="top-actions">
          <NotificationBell />
        </div>
      </div>

      <div className="live-content">
        {loading && (
          <div className="lm-loading-card">
            <p>Loading livestream…</p>
          </div>
        )}

        {!loading && isLive && (
          <div className="lm-player-card">
            <div className="lm-video-wrap">
              {stream?.embedUrl ? (
                <iframe
                  src={stream.embedUrl}
                  title={stream.title}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <LiveKitViewer
                  roomName={stream.roomName}
                  participantName={`Parishioner-${Date.now()}`}
                />
              )}

              <span className="live-badge">LIVE</span>
            </div>

            <div className="lm-stream-info">
              <h2 className="lm-stream-title">{stream.title}</h2>
              <p className="lm-stream-subtitle">
                The parish livestream is currently active.
              </p>
              <p style={{ color: "#EF4444", fontWeight: 600, marginTop: 6 }}>
                👁️ {stream?.viewerCount || 0} watching now
              </p>
            </div>
          </div>
        )}

        {!loading && isCountdown && (
          <div className="lm-no-live-card lm-countdown-card">
            <div className="lm-no-live-icon">
              <Clock size={32} strokeWidth={1.5} />
            </div>
            <span className="lm-countdown-label">Starting Soon</span>
            <h2 className="lm-countdown-time">{countdownDisplay}</h2>
            <p className="lm-no-live-text">
              {stream.title} will start shortly. Please stay on this page.
            </p>
          </div>
        )}

        {!loading && isScheduled && (
          <div className="lm-no-live-card">
            <div className="lm-no-live-icon">
              <Calendar size={32} strokeWidth={1.5} />
            </div>
            <h2 className="lm-no-live-title">Livestream Scheduled</h2>
            <p className="lm-no-live-text">{stream.title}</p>
            <div className="lm-default-schedule">
              <span className="lm-schedule-label">Scheduled Start</span>
              <p>{formatDateTime(stream.scheduledStartTime)}</p>
              <p>Countdown: {stream.countdownMinutes || 5} minutes before start</p>
            </div>
          </div>
        )}

        {!loading && (!stream || stream.status === "ended") && (
          <>
            <div className="lm-no-live-card">
              <div className="lm-no-live-icon">
                <VideoOff size={32} strokeWidth={1.5} />
              </div>
              <h2 className="lm-no-live-title">No Livestream Available</h2>
              <p className="lm-no-live-text">
                No livestream available at the moment.
              </p>
            </div>

            {replayStreams.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 14 }}>
                  Stream Replays
                </h2>

                {replayStreams.map((replay) => (
                  <div
                    key={replay._id}
                    style={{
                      background: "#fff",
                      borderRadius: 18,
                      overflow: "hidden",
                      marginBottom: 20,
                      boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                    }}
                  >
                    <div
  onClick={async () => {
    setSelectedReplay(replay);

    try {
      await axios.put(
        `http://localhost:5000/api/livestream/${replay._id}/replay/view`
      );
    } catch (error) {
      console.error(error);
    }
  }}
  style={{
    position: "relative",
    cursor: "pointer",
    background: "#000",
  }}
>
  <img
  src={
    replay.replayThumbnailUrl
      ? `http://localhost:5000${replay.replayThumbnailUrl}`
      : "https://placehold.co/800x450/png"
  }
  alt="Replay Thumbnail"
  style={{
    width: "100%",
    height: 260,
    objectFit: "cover",
    display: "block",
  }}
/>

  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.35)",
      color: "#fff",
      fontSize: 18,
      fontWeight: 700,
    }}
  >
    ▶ Watch Replay
  </div>
</div>

                    <div style={{ padding: 18 }}>
  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 8 }}>
    {replay.replayTitle || replay.title}
  </h3>

  <p style={{ color: "#475569", lineHeight: 1.6, fontSize: "0.92rem" }}>
    {replay.replayDescription || "No description provided."}
  </p>

  <div
    style={{
      marginTop: 12,
      display: "flex",
      flexWrap: "wrap",
      gap: 12,
      fontSize: "0.85rem",
      color: "#64748b",
    }}
  >
    <span>👁️ {replay.totalViews || 0} views</span>
    <span>▶ {replay.replayViews || 0} replay views</span>
    <span>🔥 Peak {replay.peakViewerCount || 0}</span>
  </div>
</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {selectedReplay && (
  <div
    onClick={() => setSelectedReplay(null)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.72)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "100%",
        maxWidth: "420px",
        background: "#111827",
        borderRadius: 22,
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
      }}
    >
      <video
        id="replay-video-player"
        src={`http://localhost:5000${selectedReplay.replayVideoUrl}`}
        controls
        autoPlay
        style={{
          width: "100%",
          maxHeight: "240px",
          objectFit: "cover",
          background: "#000",
          display: "block",
        }}
      />

      <div
        style={{
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <h3
          style={{
            color: "#fff",
            fontSize: "1rem",
            fontWeight: 700,
            margin: 0,
          }}
        >
          {selectedReplay.replayTitle || selectedReplay.title}
        </h3>

        <div
          style={{
            display: "flex",
            gap: 10,
          }}
        >
          <button
            onClick={() => setSelectedReplay(null)}
            style={{
              flex: 1,
              background: "#ef4444",
              border: "none",
              color: "#fff",
              padding: "12px",
              borderRadius: 12,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ✕ Close
          </button>

          <button
            onClick={() => {
              const video = document.getElementById(
                "replay-video-player"
              );

              if (video?.requestFullscreen) {
                video.requestFullscreen();
              }
            }}
            style={{
              flex: 1,
              background: "#2563eb",
              border: "none",
              color: "#fff",
              padding: "12px",
              borderRadius: 12,
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            ⛶ Fullscreen
          </button>
        </div>
      </div>
    </div>
  </div>
)}

<BottomNav />
    </div>
  );
}

export default LiveMass;