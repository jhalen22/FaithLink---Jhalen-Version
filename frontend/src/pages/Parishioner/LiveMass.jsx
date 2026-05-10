import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Bell, VideoOff } from "lucide-react";
import BottomNav from "../../components/BottomNav";
import "../../styles/Parishioner/LiveMass.css";

function LiveMass() {
  const navigate = useNavigate();
  const [stream, setStream]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/streams/active");
        setStream(res.data.stream);
      } catch {
        // A 404 just means no active stream — leave stream as null
        setStream(null);
      } finally {
        setLoading(false);
      }
    };
    fetchActive();
  }, []);

  return (
    <div className="live-page">
      <div className="live-header">
        <h1 className="live-header-title">Live Mass</h1>
        <div className="top-actions">
          <button className="top-icon-btn" onClick={() => navigate("/notifications")}>
            <Bell size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="live-content">
        {loading ? (
          <div className="live-card">
            <div className="live-info" style={{ padding: "32px", textAlign: "center" }}>
              <p style={{ color: "#64748b" }}>Loading livestream…</p>
            </div>
          </div>
        ) : stream ? (
          <>
            {/* Active stream found */}
            <div className="live-card">
              <div className="live-video">
                <iframe
                  src={stream.embedUrl}
                  title={stream.title}
                  allowFullScreen
                />
                <span className="live-badge">LIVE NOW</span>
              </div>
              <div className="live-info">
                <h2>{stream.title}</h2>
                {stream.description && <p>{stream.description}</p>}
              </div>
            </div>

            <div className="schedule-card">
              <h3>Mass Schedule</h3>
              {stream.schedule ? (
                <p>{stream.schedule}</p>
              ) : (
                <>
                  <p>Sunday Mass: 8:00 AM / 10:00 AM / 5:00 PM</p>
                  <p>Weekday Mass: 6:00 AM</p>
                </>
              )}
            </div>

            <div className="qr-section">
              <QRCodeSVG value={stream.url} size={140} />
              <p className="qr-label">Scan to open livestream</p>
            </div>
          </>
        ) : (
          <>
            {/* No active stream */}
            <div className="live-card">
              <div className="live-info" style={{ padding: "32px", textAlign: "center" }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "var(--primary-light)", color: "var(--primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                }}>
                  <VideoOff size={34} strokeWidth={1.5} />
                </div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", margin: "0 0 8px" }}>
                  No Livestream Active Right Now
                </h2>
                <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
                  There is no active livestream at the moment.
                  Please check back later or see the schedule below.
                </p>
              </div>
            </div>

            <div className="schedule-card">
              <h3>Mass Schedule</h3>
              <p>Sunday Mass: 8:00 AM / 10:00 AM / 5:00 PM</p>
              <p>Weekday Mass: 6:00 AM</p>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default LiveMass;
