import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CalendarCheck,
  Users,
  Clock3,
  CheckCircle2,
  Search,
  Filter,
  UserRound,
  CalendarDays,
  Cross,
} from "lucide-react";
import "../../styles/Admin/AssignPriest.css";

function AssignPriest() {
  const [bookings, setBookings] = useState([]);
  const [priests, setPriests] = useState([]);
  const [selectedPriests, setSelectedPriests] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [assigning, setAssigning] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchBookings();
    fetchPriests();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/bookings/admin/approved", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPriests = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/priests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPriests(res.data.priests || []);
    } catch (err) {
      console.error(err);
    }
  };

  const assignPriest = async (bookingId) => {
    const priestId = selectedPriests[bookingId];

    if (!priestId) {
      alert("Please select a priest first.");
      return;
    }

    setAssigning(bookingId);

    try {
      await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/assign-priest`,
        { priestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Priest assigned successfully.");
      await fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Failed to assign priest.");
    } finally {
      setAssigning(null);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const keyword = searchTerm.toLowerCase();

      return (
        booking.parishioner?.fullName?.toLowerCase().includes(keyword) ||
        booking.sacramentType?.toLowerCase().includes(keyword) ||
        booking.assignedPriest?.fullName?.toLowerCase().includes(keyword)
      );
    });
  }, [bookings, searchTerm]);

  const pendingAssignments = bookings.filter((b) => !b.assignedPriest).length;
  const confirmedAssignments = bookings.filter(
  (b) => b.priestConfirmationStatus === "accepted"
  ).length;

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="assign-priest-page">
      <div className="assign-hero">
        <div>
          <h1>Assign Priest</h1>
          <p>Assign priests to approved sacrament bookings and Mass Intentions.</p>
        </div>

        <div className="church-illustration">
          <span>✝</span>
        </div>
      </div>

      <div className="assign-stats">
        <div className="assign-stat-card purple">
          <div className="stat-icon">
            <CalendarCheck size={26} />
          </div>
          <div>
            <p>Approved Bookings</p>
            <h2>{bookings.length}</h2>
            <span>Ready for assignment</span>
          </div>
        </div>

        <div className="assign-stat-card green">
          <div className="stat-icon">
            <Users size={26} />
          </div>
          <div>
            <p>Available Priests</p>
            <h2>{priests.length}</h2>
            <span>Active priests</span>
          </div>
        </div>

        <div className="assign-stat-card yellow">
          <div className="stat-icon">
            <Clock3 size={26} />
          </div>
          <div>
            <p>Pending Assignments</p>
            <h2>{pendingAssignments}</h2>
            <span>Awaiting priest</span>
          </div>
        </div>

        <div className="assign-stat-card blue">
          <div className="stat-icon">
            <CheckCircle2 size={26} />
          </div>
          <div>
            <p>Confirmed</p>
            <h2>{confirmedAssignments}</h2>
            <span>Priest confirmed</span>
          </div>
        </div>
      </div>

      <div className="assign-table-card">
        <div className="assign-table-header">
          <div>
            <h2>
              <CalendarCheck size={22} />
              Approved Bookings
            </h2>
            <p>Bookings that are ready to be assigned to a priest.</p>
          </div>

          <div className="assign-tools">
            <div className="assign-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by parishioner or sacrament..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button className="filter-btn">
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>

        <div className="assign-table-wrap">
          <table className="assign-table">
            <thead>
              <tr>
                <th>Parishioner</th>
                <th>Sacrament / Intention</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Assigned Priest</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">
                    No approved bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking, index) => (
                  <tr key={booking._id}>
                    <td>
                      <div className="parishioner-cell">
                        <div className={`avatar avatar-${index % 5}`}>
                          {getInitials(booking.parishioner?.fullName || "User")}
                        </div>
                        <div>
                          <strong>{booking.parishioner?.fullName || "Unknown"}</strong>
                          <span>{booking.parishioner?.email || "No email"}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="sacrament-cell">
                        <Cross size={16} />
                        <div>
                          <strong>{booking.sacramentType}</strong>
                          <span>{booking.message || "No additional message"}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="date-cell">
                        <p>
                          <CalendarDays size={15} />
                          {formatDate(booking.preferredDate)}
                        </p>
                        <span>
                          <Clock3 size={15} />
                          {booking.preferredTime || "—"}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className={`status-pill ${booking.priestConfirmationStatus || "unassigned"}`}>
  {booking.assignedPriest
    ? booking.priestConfirmationStatus === "accepted"
      ? "Accepted"
      : booking.priestConfirmationStatus === "rejected"
      ? "Rejected"
      : "Pending"
    : "Unassigned"}
</span>
                    </td>

                    <td>

                        <select
  className="priest-select"
  value={selectedPriests[booking._id] || booking.assignedPriest?._id || ""}
  onChange={(e) =>
    setSelectedPriests({
      ...selectedPriests,
      [booking._id]: e.target.value,
    })
  }
>
  <option value="">Select Priest</option>
  {priests.map((priest) => (
    <option key={priest._id} value={priest._id}>
      {priest.fullName}
    </option>
  ))}
</select>
                    </td>

                    <td>
                      <button
                        className="assign-btn"
                        disabled={assigning === booking._id}
                        onClick={() => assignPriest(booking._id)}
                      >
                        <Users size={16} />
                        {booking.assignedPriest ? "Reassign" : assigning === booking._id ? "Assigning..." : "Assign"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="assign-footer">
          <p>Showing {filteredBookings.length} of {bookings.length} results</p>
        </div>
      </div>
    </div>
  );
}

export default AssignPriest;