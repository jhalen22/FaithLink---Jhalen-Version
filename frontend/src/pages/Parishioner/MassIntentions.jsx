import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Bell, BookMarked } from "lucide-react";
import "../../styles/Parishioner/Bookings.css";

const STATUS_COLOR = {
  pending:  "#d97706",
  approved: "#16a34a",
  rejected: "#dc2626",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "long", day: "numeric", year: "numeric",
  });
};

function MassIntentions() {
  const navigate = useNavigate();
  const [intentions, setIntentions] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchIntentions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/bookings/my-bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter to only Mass Intention bookings
        const massOnly = (res.data || []).filter(
          (b) => b.sacramentType === "Mass Intentions"
        );
        setIntentions(massOnly);
      } catch {
        // Show empty state on error
      } finally {
        setLoading(false);
      }
    };
    fetchIntentions();
  }, []);

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => navigate("/profile")}>
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h2>Mass Intentions</h2>
        </div>
        <div className="top-actions">
          <button className="top-icon-btn" onClick={() => navigate("/notifications")}>
            <Bell size={18} strokeWidth={2} />
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
              onClick={() => navigate("/select-service")}
            >
              Request Mass Intention
            </button>
          </div>
        ) : (
          <>
            {intentions.map((b) => {
              const data = b.sacramentSpecificData || {};
              return (
                <div className="booking-card" key={b._id}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <BookMarked size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
                    Mass Intention
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
                    <strong>Preferred Time:</strong> {b.preferredTime}
                  </p>
                  {b.message && (
                    <p><strong>Notes:</strong> {b.message}</p>
                  )}
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      style={{
                        fontWeight: 700,
                        color: STATUS_COLOR[b.status] || "#64748b",
                      }}
                    >
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </p>
                </div>
              );
            })}

            <div style={{ textAlign: "center", marginTop: 12, paddingBottom: 90 }}>
              <button
                className="submit-btn"
                onClick={() => navigate("/select-service")}
              >
                + Add Mass Intention
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MassIntentions;
