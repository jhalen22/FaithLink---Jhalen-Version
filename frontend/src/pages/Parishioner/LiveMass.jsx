import { useState, useEffect } from "react";
import axios from "axios";
import { VideoOff } from "lucide-react";
import BottomNav from "../../components/BottomNav";
import NotificationBell from "../../components/NotificationBell";
import "../../styles/Parishioner/LiveMass.css";

function LiveMass() {
  const [stream, setStream]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/livestream")
      .then((res) => {
        const s = res.data.stream;
        setStream(s?.status === "live" ? s : null);
      })
      .catch(() => setStream(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="live-page">
      {/* Header */}
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

        {/* Active stream */}
        {!loading && stream && (
          <div className="lm-player-card">
            <div className="lm-video-wrap">
              <iframe
                src={stream.embedUrl}
                title={stream.title}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
              <span className="live-badge">LIVE</span>
            </div>
            <div className="lm-stream-info">
              <h2 className="lm-stream-title">{stream.title}</h2>
            </div>
          </div>
        )}

        {/* No active stream */}
        {!loading && !stream && (
          <div className="lm-no-live-card">
            <div className="lm-no-live-icon">
              <VideoOff size={32} strokeWidth={1.5} />
            </div>
            <h2 className="lm-no-live-title">No Livestream Available</h2>
            <p className="lm-no-live-text">
              No livestream available at the moment.
            </p>
            <div className="lm-default-schedule">
              <span className="lm-schedule-label">Mass Schedule</span>
              <p>Sunday: 8:00 AM · 10:00 AM · 5:00 PM</p>
              <p>Weekday: 6:00 AM</p>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default LiveMass;
