import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, BellOff, Bell, Calendar, Heart, Megaphone, Settings } from "lucide-react";
import "../../styles/Parishioner/Bookings.css";
import "../../styles/Parishioner/Notifications.css";

// Returns a lucide icon component for each notification type
const TYPE_ICON_MAP = {
  booking:  Calendar,
  donation: Heart,
  event:    Megaphone,
  system:   Settings,
};

function TypeIcon({ type }) {
  const Icon = TYPE_ICON_MAP[type] || Bell;
  return <Icon size={16} strokeWidth={2} />;
}

const TYPE_LABEL = {
  booking:  "Booking",
  donation: "Donation",
  event:    "Event",
  system:   "System",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("en-PH", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
    hour:  "2-digit",
    minute:"2-digit",
  });
};

function Notifications() {
  const navigate = useNavigate();
  const goBack = (fallback = "/dashboard") => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback);
  };
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");

  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch {
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Optimistic update: flip isRead locally, then confirm with the server
  const markRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      // Revert on failure
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: false } : n))
      );
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await axios.put(
        "http://localhost:5000/api/notifications/mark-all/read",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      // Revert on failure
      fetchNotifications();
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => goBack("/dashboard")}>
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h2>
            Notifications
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount}</span>
            )}
          </h2>
        </div>
        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>

      <div className="booking-list-area">
        {loading ? (
          <div className="empty-bookings">
            <p style={{ color: "#64748b" }}>Loading notifications…</p>
          </div>
        ) : error ? (
          <div className="empty-bookings">
            <p style={{ color: "#dc2626" }}>{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-bookings">
            <div className="empty-icon">
              <BellOff size={34} strokeWidth={1.5} />
            </div>
            <h3>No notifications</h3>
            <p>Your alerts and updates will appear here.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item._id}
              className={`notif-card${!item.isRead ? " notif-unread" : ""}`}
            >
              {/* Header: title row + type badge */}
              <div className="notif-card-header">
                <div className="notif-title-row">
                  <span className="notif-type-icon">
                    <TypeIcon type={item.type} />
                  </span>
                  <span className="notif-title">{item.title}</span>
                  {!item.isRead && <span className="notif-dot" />}
                </div>
                <span className="notif-type-badge">
                  {TYPE_LABEL[item.type] || item.type}
                </span>
              </div>

              {/* Message */}
              <p className="notif-message">{item.message}</p>

              {/* Footer: date + mark-as-read */}
              <div className="notif-card-footer">
                <span className="notif-date">{formatDate(item.createdAt)}</span>
                {!item.isRead && (
                  <button
                    className="notif-read-btn"
                    onClick={() => markRead(item._id)}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;
