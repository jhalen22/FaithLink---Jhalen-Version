import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, Search, Bell, CalendarX } from "lucide-react";
import BottomNav from "../../components/BottomNav";
import "../../styles/Parishioner/Bookings.css";

function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/bookings/my-bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings(res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === filter);

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <div className="logo-box">✝</div>
          <h2>My Bookings</h2>
        </div>

        <div className="top-actions">
          <button className="top-icon-btn" onClick={() => alert("Search coming soon")}>
            <Search size={18} strokeWidth={2} />
          </button>
          <button className="top-icon-btn" onClick={() => navigate("/notifications")}>
            <Bell size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="booking-tabs">
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("pending")}>Pending</button>
        <button onClick={() => setFilter("approved")}>Approved</button>
        <button onClick={() => setFilter("rejected")}>Rejected</button>
      </div>

      <div className="booking-list-area">
        {filteredBookings.length === 0 ? (
          <div className="empty-bookings">
            <div className="empty-icon">
              <CalendarX size={34} strokeWidth={1.5} />
            </div>
            <h3>No Bookings Found</h3>
            <p>You don&apos;t have any yet. Tap the + button to create a new booking.</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div className="booking-card" key={booking._id}>
              <h3>{booking.sacramentType}</h3>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(booking.preferredDate).toLocaleDateString("en-PH", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </p>
              <p>
                <strong>Time:</strong> {booking.preferredTime}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="status">{booking.status}</span>
              </p>
              {/* Priest confirmation badge */}
              {booking.priestConfirmationStatus === "confirmed" && (
                <p style={{ color: "#16a34a", fontSize: "13px", fontWeight: 600 }}>
                  ✓ Priest availability confirmed
                </p>
              )}
              {/* Sacrament-specific details (structured fields) */}
              {booking.sacramentSpecificData &&
                Object.keys(booking.sacramentSpecificData).length > 0 && (
                  <div className="booking-details">
                    {Object.entries(booking.sacramentSpecificData)
                      .filter(([, val]) => val)
                      .map(([key, val]) => (
                        <p key={key}>
                          <strong>
                            {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}:
                          </strong>{" "}
                          {val}
                        </p>
                      ))}
                  </div>
                )}
              {/* Legacy message field (backward compat for older bookings) */}
              {booking.message && (
                <div className="booking-details">
                  {booking.message.split("\n").map((line, index) => {
                    if (!line.trim()) return null;
                    const parts = line.split(":");
                    if (parts.length < 2) return <p key={index}>{line}</p>;
                    return (
                      <p key={index}>
                        <strong>{parts[0]}:</strong>
                        {parts.slice(1).join(":")}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <button className="floating-add" onClick={() => navigate("/select-service")}>
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <BottomNav />
    </div>
  );
}

export default Bookings;