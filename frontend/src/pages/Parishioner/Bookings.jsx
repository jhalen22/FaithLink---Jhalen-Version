import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

        <div className="top-icons">
          <span>🔍</span>
          <span>🔔</span>
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
            <div className="empty-icon">🗓️</div>
            <h3>No Bookings Found</h3>
            <p>You don’t have any yet. Tap the + button to create a new booking.</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div className="booking-card" key={booking._id}>
              <h3>{booking.sacramentType}</h3>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(booking.preferredDate).toLocaleDateString("en-US", {year: "numeric",month: "long",day: "numeric",})}
              </p>
              <p>
                <strong>Time:</strong> {booking.preferredTime}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className="status">{booking.status}</span>
              </p>
              <div className="booking-details"> {booking.message.split("\n").map((line, index) => {
                if (!line.trim()) return null;
                const parts = line.split(":");
                if (parts.length < 2) {
                return <p key={index}>{line}</p>;
                }

            return (
                <p key={index}>
                <strong>{parts[0]}:</strong>
                {parts.slice(1).join(":")}
                </p>
                );
                })}
            </div>
            </div>
          ))
        )}
      </div>

      <button
        className="floating-add"
        onClick={() => navigate("/select-service")}
      >
        +
      </button>

      <div className="bottom-nav">
        <div onClick={() => navigate("/dashboard")}>🏠<p>Home</p></div>
        <div onClick={() => navigate("/events")}>📅<p>Events</p></div>
        <div onClick={() => navigate("/bookings")}>📝<p>Bookings</p></div>
        <div onClick={() => navigate("/live-mass")}>📹<p>Live Mass</p></div>
        <div onClick={() => navigate("/profile")}>👤<p>Profile</p></div>
      </div>
    </div>
  );
}

export default Bookings;