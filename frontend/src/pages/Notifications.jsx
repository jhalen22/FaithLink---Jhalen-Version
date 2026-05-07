import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications(res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => navigate("/profile")}>←</button>
          <h2>Notifications</h2>
        </div>
      </div>

      <div className="booking-list-area">
        {notifications.length === 0 ? (
          <div className="empty-bookings">
            <div className="empty-icon">🔔</div>
            <h3>No notifications</h3>
            <p>Your alerts and updates will appear here.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div className="booking-card" key={item._id}>
              <h3>{item.title}</h3>
              <p>{item.message}</p>
              <p><strong>Type:</strong> {item.type}</p>
              <p><strong>Status:</strong> {item.isRead ? "Read" : "Unread"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;