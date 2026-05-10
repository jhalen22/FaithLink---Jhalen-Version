import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Bell, Heart } from "lucide-react";
import "../../styles/Parishioner/Bookings.css";

function DonationHistory() {
  const navigate = useNavigate();
  const goBack = (fallback = "/dashboard") => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback);
  };
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/donations/my-donations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDonations(res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => goBack("/profile")}>
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h2>Donation History</h2>
        </div>
        <div className="top-actions">
          <button className="top-icon-btn" onClick={() => navigate("/notifications")}>
            <Bell size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="booking-list-area">
        {donations.length === 0 ? (
          <div className="empty-bookings">
            <div className="empty-icon">
              <Heart size={34} strokeWidth={1.5} />
            </div>
            <h3>No donations yet</h3>
            <p>Your donation records will appear here.</p>
          </div>
        ) : (
          donations.map((donation) => (
            <div className="booking-card" key={donation._id}>
              <h3>₱{donation.amount}</h3>
              <p><strong>Purpose:</strong> {donation.purpose}</p>
              <p><strong>Method:</strong> {donation.method}</p>
              <p><strong>Reference:</strong> {donation.referenceCode}</p>
              <p><strong>Status:</strong> <span className="status">{donation.status}</span></p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DonationHistory;