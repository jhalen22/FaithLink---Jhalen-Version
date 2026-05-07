import { useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => navigate("/profile")}>←</button>
          <h2>Settings</h2>
        </div>
      </div>

      <div className="profile-list">
        <div className="profile-row">
          <span className="profile-icon">🔐</span>
          <div>
            <h4>Privacy</h4>
            <p>Manage privacy preferences</p>
          </div>
          <span>›</span>
        </div>

        <div className="profile-row">
          <span className="profile-icon">🔔</span>
          <div>
            <h4>Notification Settings</h4>
            <p>Manage app alerts</p>
          </div>
          <span>›</span>
        </div>
      </div>
    </div>
  );
}

export default Settings;