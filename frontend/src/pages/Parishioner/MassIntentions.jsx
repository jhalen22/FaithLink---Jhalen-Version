import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Bell, BookMarked } from "lucide-react";
import "../../styles/Parishioner/Bookings.css";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "long", day: "numeric", year: "numeric",
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 || 12;
  return `${display}:${m} ${suffix}`;
};

function MassIntentions() {
  const navigate = useNavigate();
  const [intentions,    setIntentions]    = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch intentions and notifications in parallel
        const [intentionsRes, notifRes] = await Promise.all([
          axios.get("http://localhost:5000/api/bookings/my-bookings", { headers }),
          axios.get("http://localhost:5000/api/notifications",        { headers }),
        ]);

        const massOnly = (intentionsRes.data || []).filter(
          (b) => b.sacramentType === "Mass Intentions"
        );
        setIntentions(massOnly);
        setNotifications(notifRes.data || []);
      } catch {
        // Show empty state on error
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // All unread notifications → drives the bell badge.
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Unread notifications that are Mass Intention-related (new type OR legacy text match).
  const massNotifs = notifications.filter(
    (n) =>
      !n.isRead &&
      (n.type === "mass-intention" ||
       n.title?.toLowerCase().includes("mass intention") ||
       n.message?.toLowerCase().includes("mass intention"))
  );

  // Returns true when a booking card should show the unread badge.
  // Primary:  notification.relatedBooking === intention._id  (exact, works for new notifications).
  // Fallback: check if the notification message mentions intentionFor (handles legacy
  //           notifications that were created before relatedBooking was added to the schema).
  const cardHasNotif = (intention) => {
    const intentionFor = (intention.sacramentSpecificData?.intentionFor || "").toLowerCase();
    return massNotifs.some((n) => {
      if (n.relatedBooking) {
        return String(n.relatedBooking) === String(intention._id);
      }
      return intentionFor && n.message?.toLowerCase().includes(intentionFor);
    });
  };

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h2>Mass Intention History</h2>
        </div>
        <div className="top-actions">
          <button
            className="top-icon-btn"
            onClick={() => navigate("/notifications")}
            style={{ position: "relative" }}
          >
            <Bell size={18} strokeWidth={2} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute",
                top: 0, right: 0,
                background: "#EF4444",
                color: "#fff",
                fontSize: 9,
                fontWeight: 700,
                minWidth: 15, height: 15,
                borderRadius: 8,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 3px",
                lineHeight: 1,
                pointerEvents: "none",
              }}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="booking-list-area">
        {loading ? (
          <div className="empty-bookings">
            <p style={{ color: "#64748b" }}>Loading mass intentions…</p>
          </div>
        ) : intentions.length === 0 ? (
          <div className="empty-bookings">
            <div className="empty-icon">
              <BookMarked size={34} strokeWidth={1.5} />
            </div>
            <h3>No mass intentions yet</h3>
            <p>Your submitted mass intentions will appear here.</p>
            <button
              className="submit-btn"
              onClick={() => navigate("/booking-form", { state: { sacramentType: "Mass Intentions" } })}
            >
              Request Mass Intention
            </button>
          </div>
        ) : (
          <>
            {intentions.map((b) => {
              const data        = b.sacramentSpecificData || {};
              const hasNewNotif = cardHasNotif(b);
              return (
                <div className="booking-card" key={b._id}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <BookMarked size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
                    Mass Intention
                    {hasNewNotif && (
                      <span style={{
                        marginLeft: "auto",
                        background: "#EF4444",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 10px",
                        borderRadius: 20,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}>
                        ● New
                      </span>
                    )}
                  </h3>

                  {data.intentionFor && (
                    <p><strong>Intention For:</strong> {data.intentionFor}</p>
                  )}
                  {data.intentionType && (
                    <p><strong>Type:</strong> {data.intentionType}</p>
                  )}
                  {data.requesterName && (
                    <p><strong>Requested By:</strong> {data.requesterName}</p>
                  )}

                  <p>
                    <strong>Preferred Date:</strong> {formatDate(b.preferredDate)}
                  </p>
                  <p>
                    <strong>Preferred Mass Time:</strong> {formatTime(b.preferredTime)}
                  </p>
                  {b.message && (
                    <p><strong>Notes:</strong> {b.message}</p>
                  )}
                </div>
              );
            })}

          </>
        )}
      </div>

      {/* Floating add button — fixed so it stays visible while the list scrolls */}
      <button
        onClick={() => navigate("/booking-form", { state: { sacramentType: "Mass Intentions" } })}
        style={{
          position: "fixed",
          bottom: 24,
          left: 20,
          zIndex: 100,
          background: "linear-gradient(135deg, #5B8DEF, #2F5FBF)",
          color: "#ffffff",
          border: "none",
          borderRadius: 50,
          padding: "12px 20px",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(91, 141, 239, 0.45)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: "inherit",
          whiteSpace: "nowrap",
        }}
      >
        + Add Intention
      </button>
    </div>
  );
}

export default MassIntentions;
