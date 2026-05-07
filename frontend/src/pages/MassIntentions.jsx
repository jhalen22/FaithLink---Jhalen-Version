import { useNavigate } from "react-router-dom";

function MassIntentions() {
  const navigate = useNavigate();

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => navigate("/profile")}>←</button>
          <h2>Mass Intentions</h2>
        </div>
      </div>

      <div className="booking-list-area">
        <div className="empty-bookings">
          <div className="empty-icon">🕯️</div>
          <h3>No mass intentions yet</h3>
          <p>Your submitted mass intentions will appear here.</p>
          <button className="submit-btn" onClick={() => navigate("/select-service")}>
            Request Mass Intention
          </button>
        </div>
      </div>
    </div>
  );
}

export default MassIntentions;