import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Bell, VideoOff, Eye } from "lucide-react";
import BottomNav from "../../components/BottomNav";
import "../../styles/Parishioner/LiveMass.css";

function LiveMass() {
  const navigate = useNavigate();
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActive = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/streams/active");
        const activeStream = res.data.stream;

        const viewRes = await axios.put(
          `http://localhost:5000/api/streams/${activeStream._id}/view`
        );

        setStream({
          ...activeStream,
          viewers: viewRes.data.viewers,
        });
      } catch (error) {
        console.log(error.response?.data || error.message);
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
        <button className="live-back" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>

        <h1 className="live-header-title">Live Mass</h1>

        <div className="top-actions">
          <button
            className="top-icon-btn"
            onClick={() => navigate("/notifications")}
          >
            <Bell size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="live-content">
        {loading ? (
          <div className="live-card">
            <div className="live-info center-state">
              <p>Loading livestream…</p>
            </div>
          </div>
        ) : stream ? (
          <>
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

            <div className="live-card">
              <div className="live-video">
                <iframe
                  src={stream.embedUrl}
                  title={stream.title}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />

                <span className="live-badge">LIVE NOW</span>

                <span className="viewer-badge">
                  <Eye size={13} />
                  {stream.viewers || 0} views
                </span>
              </div>

              <div className="live-info">
                <h2>{stream.title}</h2>
                {stream.description && <p>{stream.description}</p>}
              </div>
            </div>

            <div className="qr-section">
              <QRCodeSVG value={stream.url} size={140} />
              <p className="qr-label">Scan to open livestream</p>
            </div>
          </>
        ) : (
          <>
            <div className="schedule-card">
              <h3>Mass Schedule</h3>
              <p>Sunday Mass: 8:00 AM / 10:00 AM / 5:00 PM</p>
              <p>Weekday Mass: 6:00 AM</p>
            </div>

            <div className="live-card">
              <div className="live-info center-state">
                <div className="no-live-icon">
                  <VideoOff size={34} strokeWidth={1.5} />
                </div>

                <h2>No Livestream Active Right Now</h2>

                <p>
                  There is no active livestream at the moment. Please check back
                  later or see the schedule above.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default LiveMass;