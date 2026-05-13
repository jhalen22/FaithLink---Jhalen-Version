import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, Search, CalendarX, X } from "lucide-react";
import BottomNav from "../../components/BottomNav";
import NotificationBell from "../../components/NotificationBell";
import "../../styles/Parishioner/Bookings.css";
import { useToast } from "../../context/ToastContext";

const getFileUrl = (fileName) => {
  return `http://localhost:5000/uploads/${encodeURIComponent(fileName)}`;
};

const getReviewForFile = (booking, fileName) => {
  return (
    booking?.documentReviews?.find((review) => review.fileName === fileName) || {
      fileName,
      status: "pending",
      remarks: "",
    }
  );
};

function Bookings() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();

  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [trackingBooking, setTrackingBooking] = useState(null);
  const [uploadBooking, setUploadBooking] = useState(null);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/bookings/my-bookings",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBookings(
        (res.data || []).filter((b) => b.sacramentType !== "Mass Intentions")
      );
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

 const getTrackingSteps = (booking) => {
  const status = booking.status;
  const docs = booking?.uploadedDocuments || [];
  const reviews = booking?.documentReviews || [];

  const hasDocuments = docs.length > 0;

  const hasLacking =
    hasDocuments &&
    docs.some((doc) => {
      const fileName = typeof doc === "string" ? doc : doc.fileName;
      const review = reviews.find((r) => r.fileName === fileName);
      return review?.status === "lacking";
    });

  const allDocumentsDone =
    hasDocuments &&
    docs.every((doc) => {
      const fileName = typeof doc === "string" ? doc : doc.fileName;
      const review = reviews.find((r) => r.fileName === fileName);
      return review?.status === "approved";
    });

  const hasAnyReviewed =
    hasDocuments &&
    docs.some((doc) => {
      const fileName = typeof doc === "string" ? doc : doc.fileName;
      const review = reviews.find((r) => r.fileName === fileName);
      return review?.status === "approved" || review?.status === "lacking";
    });

  if (status === "rejected") {
    return [
      { label: "Submitted", done: true },
      { label: "Rejected", done: true, rejected: true },
    ];
  }

  if (hasLacking) {
    return [
      { label: "Submitted", done: true },
      { label: "Under Review", done: true },
      { label: "Approved", done: false },
      { label: "Scheduled", done: false },
      { label: "Completed", done: false },
    ];
  }

  return [
    { label: "Submitted", done: true },
    {
      label: "Under Review",
      done: hasAnyReviewed || status !== "pending",
    },
    {
      label: "Approved",
      done:
        allDocumentsDone ||
        status === "approved" ||
        status === "scheduled" ||
        status === "completed",
    },
    {
      label: "Scheduled",
      done:
        Boolean(booking.assignedSchedule) ||
        status === "scheduled" ||
        status === "completed",
    },
    {
      label: "Completed",
      done: status === "completed",
    },
  ];
};

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus = filter === "all" || booking.status === filter;

    const searchableText = `
      ${booking.sacramentType || ""}
      ${booking.status || ""}
      ${booking.preferredDate || ""}
      ${booking.preferredTime || ""}
      ${booking.message || ""}
      ${JSON.stringify(booking.sacramentSpecificData || {})}
    `.toLowerCase();

    return matchesStatus && searchableText.includes(searchTerm.toLowerCase());
  });

  const handleUploadDocuments = async (e) => {
    e.preventDefault();

    if (!uploadBooking) return;

    if (uploadFiles.length === 0) {
      showWarning("Please choose at least one file.");
      return;
    }

    try {
      setUploading(true);

      const token = localStorage.getItem("token");
      const formData = new FormData();

      uploadFiles.forEach((file) => {
        formData.append("documents", file);
      });

      await axios.post(
        `http://localhost:5000/api/bookings/${uploadBooking._id}/upload-documents`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showSuccess("Document uploaded successfully!");
      setUploadFiles([]);
      setUploadBooking(null);
      await fetchBookings();
    } catch (err) {
      showError(err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const renderDocumentTracking = (booking) => {
    const documents = booking.uploadedDocuments || [];

    if (documents.length === 0) {
      return <p className="booking-empty-text">No documents uploaded yet.</p>;
    }

    return documents.map((doc, index) => {
      const fileName = typeof doc === "string" ? doc : doc.fileName;
      const review = getReviewForFile(booking, fileName);

      const statusClass =
        review.status === "approved"
          ? "doc-approved"
          : review.status === "lacking"
          ? "doc-lacking"
          : "doc-pending";

      const label =
        review.status === "approved"
          ? "✓ Done"
          : review.status === "lacking"
          ? "⚠ Lacking"
          : "Pending Review";

      return (
        <div className="booking-doc-card" key={`${fileName}-${index}`}>
          <p className="booking-doc-name">{fileName}</p>

          <p className={`booking-doc-status ${statusClass}`}>{label}</p>

          {review.remarks && (
            <p className="booking-doc-remarks">
              <strong>Admin remarks:</strong> {review.remarks}
            </p>
          )}

          <a
            href={getFileUrl(fileName)}
            target="_blank"
            rel="noreferrer"
            className="booking-doc-link"
          >
            View uploaded file
          </a>
        </div>
      );
    });
  };

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <div className="logo-box">✝</div>
          <h2>My Bookings</h2>
        </div>

        <div className="top-actions">
          <button
            className="top-icon-btn"
            onClick={() => setShowSearch((prev) => !prev)}
          >
            {showSearch ? <X size={18} /> : <Search size={18} />}
          </button>

          <NotificationBell />
        </div>
      </div>

      {showSearch && (
        <div className="page-search-area">
          <input
            type="text"
            placeholder="Search bookings by type, status, date, time..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>
      )}

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
            <p>
              {searchTerm
                ? "No bookings match your search."
                : "You don't have any yet. Tap the + button to create a new booking."}
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div className="booking-card" key={booking._id}>
              <h3>{booking.sacramentType}</h3>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(booking.preferredDate).toLocaleDateString("en-PH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <p>
                <strong>Time:</strong> {booking.preferredTime}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span className="status">{booking.status}</span>
              </p>

              {booking.priestConfirmationStatus === "confirmed" && (
                <p className="booking-confirmed-text">
                  ✓ Priest availability confirmed
                </p>
              )}

              {booking.sacramentSpecificData &&
                Object.keys(booking.sacramentSpecificData).length > 0 && (
                  <div className="booking-details">
                    {Object.entries(booking.sacramentSpecificData)
                      .filter(([, val]) => val)
                      .map(([key, val]) => (
                        <p key={key}>
                          <strong>
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (s) => s.toUpperCase())}
                            :
                          </strong>{" "}
                          {val}
                        </p>
                      ))}
                  </div>
                )}

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

              <div className="booking-card-actions">
                <button
                  type="button"
                  className="booking-track-btn"
                  onClick={() => setTrackingBooking(booking)}
                >
                  Track
                </button>

                <button
                  type="button"
                  className="booking-upload-btn"
                  onClick={() => setUploadBooking(booking)}
                >
                  Upload
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {trackingBooking && (
        <div
          className="booking-modal-overlay"
          onClick={() => setTrackingBooking(null)}
        >
          <div
            className="booking-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="booking-modal-header">
              <div>
                <h3>Booking Tracking</h3>
                <p>{trackingBooking.sacramentType}</p>
              </div>

              <button
                type="button"
                className="booking-modal-close"
                onClick={() => setTrackingBooking(null)}
              >
                ✕
              </button>
            </div>

            <div className="booking-tracking-box">
              <h4>Tracking Status</h4>

              {getTrackingSteps(trackingBooking).map((step, index, arr) => (
                <div className="booking-track-step" key={step.label}>
                  <div className="booking-track-marker">
                    <div
                      className={`booking-track-circle ${
                        step.done ? "track-done" : ""
                      }`}
                    >
                      {step.done ? "✓" : index + 1}
                    </div>

                    {index !== arr.length - 1 && (
                      <div className="booking-track-line" />
                    )}
                  </div>

                  <div className="booking-track-text">
                    <p>{step.label}</p>
                    <span>
                      {step.label === "Submitted" &&
                        "Your booking request has been submitted."}
                      {step.label === "Under Review" &&
                        "Admin is reviewing your uploaded requirements."}
                      {step.label === "Approved" &&
                        "All uploaded requirements have been approved."}
                      {step.label === "Scheduled" &&
                        "The sacrament schedule has been assigned."}
                      {step.label === "Completed" &&
                        "Your sacrament booking has been completed."}
                      {step.label === "Rejected" &&
                        "Your booking has been rejected."}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="booking-modal-details">
              <h4>Booking Details</h4>

              <div>
                <strong>Service</strong>
                <span>{trackingBooking.sacramentType}</span>
              </div>

              <div>
                <strong>Requested Date</strong>
                <span>
                  {new Date(trackingBooking.preferredDate).toLocaleDateString(
                    "en-PH",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </span>
              </div>

              <div>
                <strong>Requested Time</strong>
                <span>{trackingBooking.preferredTime}</span>
              </div>

              <div>
                <strong>Current Status</strong>
                <span className={`booking-status-text ${trackingBooking.status}`}>
                  {trackingBooking.status}
                </span>
              </div>
            </div>

            <div className="booking-modal-docs">
              <h4>Uploaded Requirements</h4>
              {renderDocumentTracking(trackingBooking)}
            </div>

            <button
              type="button"
              className="booking-modal-main-btn"
              onClick={() => {
                setUploadBooking(trackingBooking);
                setTrackingBooking(null);
              }}
            >
              Upload Additional Requirement
            </button>
          </div>
        </div>
      )}

      {uploadBooking && (
        <div
          className="booking-modal-overlay"
          onClick={() => setUploadBooking(null)}
        >
          <form
            className="booking-upload-modal"
            onSubmit={handleUploadDocuments}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="booking-modal-header">
              <div>
                <h3>Upload Requirement</h3>
                <p>{uploadBooking.sacramentType}</p>
              </div>

              <button
                type="button"
                className="booking-modal-close"
                onClick={() => setUploadBooking(null)}
              >
                ✕
              </button>
            </div>

            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="booking-file-input"
              onChange={(e) => setUploadFiles(Array.from(e.target.files))}
            />

            {uploadFiles.length > 0 && (
              <p className="booking-selected-files">
                {uploadFiles.length} file{uploadFiles.length > 1 ? "s" : ""}{" "}
                selected
              </p>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="booking-submit-upload-btn"
            >
              {uploading ? "Uploading..." : "Submit Upload"}
            </button>
          </form>
        </div>
      )}

      <button
        className="floating-add"
        onClick={() => navigate("/select-service")}
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <BottomNav />
    </div>
  );
}

export default Bookings;