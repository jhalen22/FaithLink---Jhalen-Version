import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, Bell, BellOff, Calendar, Heart, Megaphone,
  Settings, CalendarDays
} from "lucide-react";
import BottomNav from "../../components/BottomNav";
import "../../styles/Priest/PriestDashboard.css";

// Lucide component per notification type
const TYPE_ICON_MAP = {
  booking:  Calendar,
  donation: Heart,
  event:    Megaphone,
  system:   Settings,
};

function NotiTypeIcon({ type }) {
  const Icon = TYPE_ICON_MAP[type] || Bell;
  return <Icon size={14} strokeWidth={2} />;
}

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("en-PH", {
    month:  "short",
    day:    "numeric",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
};

function PriestAlerts() {
  const navigate = useNavigate();
  const goBack = (fallback = "/priest-dashboard") => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback);
  };
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch {
      // Show empty state on failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

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
      fetchNotifications();
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="mobile-dashboard">
      {/* ── Top bar ── */}
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => goBack("/priest-dashboard")}>
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h2>
            Alerts
            {unreadCount > 0 && (
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: "#ef4444", color: "white", fontSize: 10, fontWeight: 700,
                minWidth: 18, height: 18, borderRadius: 20, padding: "0 4px",
                marginLeft: 6, verticalAlign: "middle",
              }}>
                {unreadCount}
              </span>
            )}
          </h2>
        </div>
        {unreadCount > 0 && (
          <button className="priest-mark-all-btn" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>

      {/* ── Content card ── */}
      <div className="content-card" style={{ marginBottom: "calc(var(--nav-h) + 14px)" }}>
        <div className="church-header">
          <div className="church-logo">
            <Bell size={22} strokeWidth={1.8} />
          </div>
          <div>
            <h3>Notifications and Updates</h3>
            <p>
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up"}
            </p>
          </div>
        </div>

        <div className="priest-schedule-list">
          {loading ? (
            <div className="empty-bookings" style={{ padding: "24px 0" }}>
              <p>Loading notifications…</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-bookings" style={{ padding: "24px 0" }}>
              <div className="empty-icon">
                <BellOff size={28} strokeWidth={1.5} />
              </div>
              <h3>No Notifications</h3>
              <p>Alerts and updates from the admin will appear here.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`priest-alert-card${!n.isRead ? " unread" : ""}`}
              >
                <p className="priest-alert-title">
                  <NotiTypeIcon type={n.type} />
                  {n.title}
                </p>
                <p className="priest-alert-body">{n.message}</p>
                <p className="priest-alert-date">
                  <CalendarDays size={12} strokeWidth={2} />
                  {formatDate(n.createdAt)}
                </p>
                {!n.isRead && (
                  <button
                    className="priest-mark-read-btn"
                    onClick={() => markRead(n._id)}
                  >
                    Mark as read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav type="priest" />
    </div>
  );
}

export default PriestAlerts;
