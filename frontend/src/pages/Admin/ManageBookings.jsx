import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../styles/Admin/AdminPage.module.css";
import modal from "../../styles/Admin/ManageBookings.module.css";

const FIELD_LABELS = {
  parentGuardianName: "Parent / Guardian",
  childName: "Child's Name",
  birthDate: "Birth Date",
  parentsName: "Parents",
  godparentsName: "Godparents",
  ageGrade: "Age / Grade",
  baptismParish: "Baptism Parish",
  candidateName: "Candidate",
  age: "Age",
  sponsorName: "Sponsor",
  groomName: "Groom",
  brideName: "Bride",
  requesterName: "Requester",
  deceasedName: "Deceased",
  patientName: "Patient",
  patientAge: "Patient Age",
  urgencyLevel: "Urgency Level",
  intentionFor: "Intention For",
  intentionType: "Intention Type",
};

const BADGE = {
  pending: styles.badgePending,
  approved: styles.badgeApproved,
  scheduled: styles.badgeApproved,
  completed: styles.badgeApproved,
  rejected: styles.badgeRejected,
};

const SearchIcon = () => (
  <svg
    className={styles.searchIcon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";

  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";

  return new Date(dateStr).toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
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

const getFileUrl = (fileName) => {
  return `http://localhost:5000/uploads/${encodeURIComponent(fileName)}`;
};

const isImageFile = (fileName = "") => {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
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

const BookingTracking = ({ booking }) => {
  const steps = getTrackingSteps(booking);

  return (
    <div className={modal.trackingModalWrap}>
      {steps.map((step, index) => (
        <div key={step.label} className={modal.trackingStep}>
          <div
            className={`${modal.trackingCircle} ${
              step.done ? modal.trackingDone : ""
            } ${step.rejected ? modal.trackingRejected : ""}`}
          >
            {step.done ? "✓" : index + 1}
          </div>

          <div className={modal.trackingInfo}>
            <p
              className={`${modal.trackingTitle} ${
                step.done ? modal.trackingTitleDone : ""
              }`}
            >
              {step.label}
            </p>

            <p className={modal.trackingDesc}>
              {step.label === "Submitted" &&
                "The booking request has been submitted."}
              {step.label === "Under Review" &&
                "The admin is reviewing the request and uploaded requirements."}
              {step.label === "Approved" &&
                "The booking request has been approved."}
              {step.label === "Scheduled" &&
                "The sacrament schedule has been assigned."}
              {step.label === "Completed" &&
                "The sacrament booking has been completed."}
              {step.label === "Rejected" && "The booking request was rejected."}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [selected, setSelected] = useState(null);
  const [trackingSelected, setTrackingSelected] = useState(null);

  const [scheduleBooking, setScheduleBooking] = useState(null);
  const [scheduleValue, setScheduleValue] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const [feedbackModal, setFeedbackModal] = useState(null);

  const [lackingModal, setLackingModal] = useState({
    open: false,
    booking: null,
    fileName: "",
    remarks: "",
  });

  const [completeModal, setCompleteModal] = useState({
    open: false,
    booking: null,
  });

  const SERVICE_FILTERS = [
    "All",
    "Baptism",
    "First Communion",
    "Confirmation",
    "Wedding",
    "Anointing of the Sick",
    "Mass Intentions",
  ];

  const token = localStorage.getItem("token");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setFetchError("");

      const res = await axios.get("http://localhost:5000/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBookings(res.data.bookings || []);
    } catch {
      setFetchError("Failed to load bookings. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const syncUpdatedBooking = (updatedBooking) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === updatedBooking._id ? updatedBooking : b))
    );

    setSelected((prev) =>
      prev && prev._id === updatedBooking._id ? updatedBooking : prev
    );

    setTrackingSelected((prev) =>
      prev && prev._id === updatedBooking._id ? updatedBooking : prev
    );

    setScheduleBooking((prev) =>
      prev && prev._id === updatedBooking._id ? updatedBooking : prev
    );
  };

  const showFeedback = (title, message) => {
    setFeedbackModal({ title, message });
  };

  const handleAction = async (id, action) => {
    setActionLoading(true);

    try {
      const res = await axios.put(
        `http://localhost:5000/api/bookings/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchBookings();

      if (res.data.booking) {
        syncUpdatedBooking(res.data.booking);
      }

      showFeedback(
        action === "approve" ? "Booking Approved" : "Booking Rejected",
        action === "approve"
          ? "Booking request has been approved."
          : "Booking request has been rejected."
      );
    } catch (err) {
      showFeedback(
        "Error",
        err.response?.data?.message || "Action failed. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDocumentReview = async (booking, fileName, status) => {
    if (status === "lacking") {
      setLackingModal({
        open: true,
        booking,
        fileName,
        remarks: "",
      });
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/bookings/${booking._id}/document-review`,
        {
          fileName,
          status,
          remarks: "",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.booking) {
        syncUpdatedBooking(res.data.booking);
      }

      showFeedback("Requirement Approved", "Requirement marked as done!");
    } catch (err) {
      showFeedback(
        "Error",
        err.response?.data?.message || "Failed to update document review."
      );
    }
  };

  const submitLackingReview = async () => {
    if (!lackingModal.remarks.trim()) {
      showFeedback("Missing Remarks", "Please enter remarks before submitting.");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/bookings/${lackingModal.booking._id}/document-review`,
        {
          fileName: lackingModal.fileName,
          status: "lacking",
          remarks: lackingModal.remarks,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.booking) {
        syncUpdatedBooking(res.data.booking);
      }

      setLackingModal({
        open: false,
        booking: null,
        fileName: "",
        remarks: "",
      });

      showFeedback("Requirement Lacking", "User has been notified successfully.");
    } catch (err) {
      showFeedback(
        "Error",
        err.response?.data?.message || "Failed to update document review."
      );
    }
  };

  const openScheduleModal = (booking) => {
    setScheduleBooking(booking);

    if (booking.assignedSchedule) {
      const date = new Date(booking.assignedSchedule);
      const localValue = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);

      setScheduleValue(localValue);
    } else {
      setScheduleValue("");
    }
  };

  const closeScheduleModal = () => {
    setScheduleBooking(null);
    setScheduleValue("");
  };

  const handleScheduleBooking = async (e) => {
    e.preventDefault();

    if (!scheduleBooking) return;

    if (!scheduleValue) {
      showFeedback("Missing Schedule", "Please select a schedule date and time.");
      return;
    }

    try {
      setActionLoading(true);

      const res = await axios.put(
        `http://localhost:5000/api/bookings/${scheduleBooking._id}/schedule`,
        {
          assignedSchedule: scheduleValue,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.booking) {
        syncUpdatedBooking(res.data.booking);
      }

      await fetchBookings();
      closeScheduleModal();
      showFeedback("Schedule Saved", "Booking scheduled successfully!");
    } catch (err) {
      showFeedback(
        "Error",
        err.response?.data?.message || "Failed to schedule booking."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteBooking = async (booking) => {
    setCompleteModal({
      open: true,
      booking,
    });
  };

  const confirmCompleteBooking = async () => {
    if (!completeModal.booking) return;

    try {
      setActionLoading(true);

      const res = await axios.put(
        `http://localhost:5000/api/bookings/${completeModal.booking._id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.booking) {
        syncUpdatedBooking(res.data.booking);
      }

      await fetchBookings();

      setCompleteModal({
        open: false,
        booking: null,
      });

      showFeedback("Booking Completed", "Booking marked as completed!");
    } catch (err) {
      showFeedback(
        "Error",
        err.response?.data?.message || "Failed to complete booking."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const serviceFiltered =
    serviceFilter === "All"
      ? bookings
      : bookings.filter((b) => b.sacramentType === serviceFilter);

  const filtered = serviceFiltered.filter((b) => {
    const name = (b.parishioner?.fullName || "").toLowerCase();
    const service = (b.sacramentType || "").toLowerCase();
    const q = search.toLowerCase();

    return name.includes(q) || service.includes(q);
  });

  const counts = {
    pending: serviceFiltered.filter((b) => b.status === "pending").length,
    approved: serviceFiltered.filter((b) => b.status === "approved").length,
    total: serviceFiltered.length,
  };

  const openModal = (booking) => setSelected(booking);
  const closeModal = () => setSelected(null);

  const renderSacramentDetails = (data = {}) =>
    Object.entries(data)
      .filter(([, val]) => val)
      .map(([key, val]) => (
        <div key={key} className={modal.detailRow}>
          <span className={modal.detailLabel}>{FIELD_LABELS[key] || key}</span>
          <span className={modal.detailValue}>{val}</span>
        </div>
      ));

  const renderUploadedDocuments = (booking, allowReview = true) => {
    const documents = booking?.uploadedDocuments || [];

    if (!documents || documents.length === 0) {
      return (
        <p className={modal.emptyText}>
          No uploaded documents for this booking.
        </p>
      );
    }

    return (
      <div className={modal.reviewTableWrap}>
        {documents.map((doc, i) => {
          const fileName = typeof doc === "string" ? doc : doc.fileName;
          const review = getReviewForFile(booking, fileName);
          const fileUrl = getFileUrl(fileName);
          const image = isImageFile(fileName);

          return (
            <div key={`${fileName}-${i}`} className={modal.reviewCard}>
              <div className={modal.reviewPreview}>
                {image ? (
                  <a href={fileUrl} target="_blank" rel="noreferrer">
                    <img
                      src={fileUrl}
                      alt="Uploaded"
                      className={modal.reviewImage}
                    />
                  </a>
                ) : (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={modal.reviewFileBox}
                  >
                    📄 View Document
                  </a>
                )}
              </div>

              <div className={modal.reviewContent}>
                <div className={modal.reviewTop}>
                  <div>
                    <p className={modal.reviewFileName}>{fileName}</p>

                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={modal.reviewLink}
                    >
                      Open File
                    </a>
                  </div>

                  <span
                    className={`${modal.reviewStatus} ${
                      review.status === "approved"
                        ? modal.reviewApproved
                        : review.status === "lacking"
                        ? modal.reviewLacking
                        : modal.reviewPending
                    }`}
                  >
                    {review.status === "approved"
                      ? "DONE"
                      : review.status === "lacking"
                      ? "LACKING"
                      : "PENDING"}
                  </span>
                </div>

                {review.remarks && (
                  <div className={modal.reviewRemarks}>
                    <strong>Remarks:</strong> {review.remarks}
                  </div>
                )}

                {allowReview && (
                  <div className={modal.reviewActions}>
                    <button
                      type="button"
                      className={modal.reviewApproveBtn}
                      onClick={() =>
                        handleDocumentReview(booking, fileName, "approved")
                      }
                    >
                      ✓ Done
                    </button>

                    <button
                      type="button"
                      className={modal.reviewRejectBtn}
                      onClick={() =>
                        handleDocumentReview(booking, fileName, "lacking")
                      }
                    >
                      ✕ Lacking
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Booking Management</h1>
          <p className={styles.pageSubtitle}>
            Review and approve sacramental booking requests
          </p>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Pending</p>
          <p className={styles.statValue}>{counts.pending}</p>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Approved</p>
          <p className={styles.statValue}>{counts.approved}</p>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Bookings</p>
          <p className={styles.statValue}>{counts.total}</p>
        </div>
      </div>

      <div className={modal.filterRow}>
        {SERVICE_FILTERS.map((f) => (
          <button
            key={f}
            className={`${modal.filterBtn} ${
              serviceFilter === f ? modal.filterBtnActive : ""
            }`}
            onClick={() => {
              setServiceFilter(f);
              setSearch("");
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <SearchIcon />

          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search bookings by name or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h2 className={styles.tableCardTitle}>Booking Requests</h2>
        </div>

        {loading ? (
          <p className={modal.stateMsg}>Loading bookings…</p>
        ) : fetchError ? (
          <p className={modal.errorMsg}>{fetchError}</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Parishioner</th>
                <th>Service</th>
                <th>Requested Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((b) => (
                <tr key={b._id}>
                  <td>{b.parishioner?.fullName || "—"}</td>
                  <td>{b.sacramentType}</td>
                  <td>{formatDate(b.preferredDate)}</td>

                  <td>
                    <span className={`${styles.badge} ${BADGE[b.status] || ""}`}>
                      {b.status
                        ? b.status.charAt(0).toUpperCase() + b.status.slice(1)
                        : "Pending"}
                    </span>
                  </td>

                  <td>
                    <button
                      className={styles.actionBtn}
                      onClick={() => openModal(b)}
                    >
                      Review
                    </button>

                    <button
                      className={styles.actionBtn}
                      onClick={() => setTrackingSelected(b)}
                      style={{ marginLeft: "8px" }}
                    >
                      Track
                    </button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      color: "#94a3b8",
                      padding: "32px",
                    }}
                  >
                    No bookings match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className={modal.overlay} onClick={closeModal}>
          <div className={modal.panel} onClick={(e) => e.stopPropagation()}>
            <div className={modal.panelHeader}>
              <div>
                <h2 className={modal.panelTitle}>{selected.sacramentType}</h2>

                <span
                  className={`${styles.badge} ${BADGE[selected.status] || ""}`}
                >
                  {selected.status
                    ? selected.status.charAt(0).toUpperCase() +
                      selected.status.slice(1)
                    : "Pending"}
                </span>
              </div>

              <button className={modal.closeBtn} onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className={modal.panelBody}>
              <div className={modal.section}>
                <h3 className={modal.sectionTitle}>Parishioner</h3>

                <div className={modal.detailRow}>
                  <span className={modal.detailLabel}>Name</span>
                  <span className={modal.detailValue}>
                    {selected.parishioner?.fullName || "—"}
                  </span>
                </div>

                <div className={modal.detailRow}>
                  <span className={modal.detailLabel}>Email</span>
                  <span className={modal.detailValue}>
                    {selected.parishioner?.email || "—"}
                  </span>
                </div>

                {selected.contactNumber && (
                  <div className={modal.detailRow}>
                    <span className={modal.detailLabel}>Contact Number</span>
                    <span className={modal.detailValue}>
                      {selected.contactNumber}
                    </span>
                  </div>
                )}

                {selected.address && (
                  <div className={modal.detailRow}>
                    <span className={modal.detailLabel}>Address</span>
                    <span className={modal.detailValue}>{selected.address}</span>
                  </div>
                )}
              </div>

              <div className={modal.section}>
                <h3 className={modal.sectionTitle}>Requested Schedule</h3>

                <div className={modal.detailRow}>
                  <span className={modal.detailLabel}>Date</span>
                  <span className={modal.detailValue}>
                    {formatDate(selected.preferredDate)}
                  </span>
                </div>

                <div className={modal.detailRow}>
                  <span className={modal.detailLabel}>Time</span>
                  <span className={modal.detailValue}>
                    {formatTime(selected.preferredTime)}
                  </span>
                </div>
              </div>

              {selected.sacramentSpecificData &&
                Object.keys(selected.sacramentSpecificData).length > 0 && (
                  <div className={modal.section}>
                    <h3 className={modal.sectionTitle}>Sacrament Details</h3>
                    {renderSacramentDetails(selected.sacramentSpecificData)}
                  </div>
                )}

              {selected.message && (
                <div className={modal.section}>
                  <h3 className={modal.sectionTitle}>Special Notes</h3>
                  <p className={modal.noteText}>{selected.message}</p>
                </div>
              )}

              <div className={modal.section}>
                <h3 className={modal.sectionTitle}>Uploaded Documents</h3>
                {renderUploadedDocuments(selected, true)}
              </div>

              {selected.assignedSchedule && (
                <div className={modal.section}>
                  <h3 className={modal.sectionTitle}>Assigned Schedule</h3>
                  <p className={modal.noteText}>
                    {formatDateTime(selected.assignedSchedule)}
                  </p>
                </div>
              )}

              {selected.status === "pending" && (
                <div className={modal.actions}>
                  <button
                    className={modal.approveBtn}
                    disabled={actionLoading}
                    onClick={() => handleAction(selected._id, "approve")}
                  >
                    {actionLoading ? "Processing…" : "Approve"}
                  </button>

                  <button
                    className={modal.rejectBtn}
                    disabled={actionLoading}
                    onClick={() => handleAction(selected._id, "reject")}
                  >
                    {actionLoading ? "Processing…" : "Reject"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {trackingSelected && (
        <div
          className={modal.overlay}
          onClick={() => setTrackingSelected(null)}
        >
          <div className={modal.panel} onClick={(e) => e.stopPropagation()}>
            <div className={modal.panelHeader}>
              <div>
                <h2 className={modal.panelTitle}>Booking Tracking</h2>

                <p className={modal.noteText}>
                  {trackingSelected.parishioner?.fullName || "—"} -{" "}
                  {trackingSelected.sacramentType}
                </p>
              </div>

              <button
                className={modal.closeBtn}
                onClick={() => setTrackingSelected(null)}
              >
                ✕
              </button>
            </div>

            <div className={modal.panelBody}>
              <div className={modal.section}>
                <h3 className={modal.sectionTitle}>Tracking Status</h3>
                <BookingTracking booking={trackingSelected} />
              </div>

              <div className={modal.section}>
                <h3 className={modal.sectionTitle}>Uploaded Requirements</h3>
                {renderUploadedDocuments(trackingSelected, true)}
              </div>

              <div className={modal.section}>
                <h3 className={modal.sectionTitle}>Admin Progress Actions</h3>

                <div className={modal.trackingAdminActions}>
                  <button
                    type="button"
                    className={modal.scheduleBtn}
                    onClick={() => openScheduleModal(trackingSelected)}
                  >
                    Set Schedule
                  </button>

                  <button
                    type="button"
                    className={modal.completeBtn}
                    onClick={() => handleCompleteBooking(trackingSelected)}
                  >
                    Mark Completed
                  </button>
                </div>
              </div>

              <div className={modal.section}>
                <h3 className={modal.sectionTitle}>Booking Details</h3>

                <div className={modal.detailRow}>
                  <span className={modal.detailLabel}>Service</span>
                  <span className={modal.detailValue}>
                    {trackingSelected.sacramentType}
                  </span>
                </div>

                <div className={modal.detailRow}>
                  <span className={modal.detailLabel}>Requested Date</span>
                  <span className={modal.detailValue}>
                    {formatDate(trackingSelected.preferredDate)}
                  </span>
                </div>

                <div className={modal.detailRow}>
                  <span className={modal.detailLabel}>Requested Time</span>
                  <span className={modal.detailValue}>
                    {formatTime(trackingSelected.preferredTime)}
                  </span>
                </div>

                <div className={modal.detailRow}>
                  <span className={modal.detailLabel}>Current Status</span>
                  <span className={modal.detailValue}>
                    {trackingSelected.status
                      ? trackingSelected.status.charAt(0).toUpperCase() +
                        trackingSelected.status.slice(1)
                      : "Pending"}
                  </span>
                </div>

                {trackingSelected.assignedSchedule && (
                  <div className={modal.detailRow}>
                    <span className={modal.detailLabel}>Assigned Schedule</span>
                    <span className={modal.detailValue}>
                      {formatDateTime(trackingSelected.assignedSchedule)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
             {scheduleBooking && (
        <div className={modal.overlay} onClick={closeScheduleModal}>
          <form
            className={modal.scheduleModal}
            onSubmit={handleScheduleBooking}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={modal.scheduleModalHeader}>
              <div>
                <h2>Set Final Schedule</h2>
                <p>
                  {scheduleBooking.parishioner?.fullName || "—"} -{" "}
                  {scheduleBooking.sacramentType}
                </p>
              </div>

              <button
                type="button"
                className={modal.closeBtn}
                onClick={closeScheduleModal}
              >
                ✕
              </button>
            </div>

            <label className={modal.scheduleLabel}>
              Select date and time
              <input
                type="datetime-local"
                value={scheduleValue}
                onChange={(e) => setScheduleValue(e.target.value)}
                className={modal.scheduleInput}
              />
            </label>

            <div className={modal.scheduleActions}>
              <button
                type="button"
                className={modal.scheduleCancelBtn}
                onClick={closeScheduleModal}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={modal.scheduleSaveBtn}
                disabled={actionLoading}
              >
                {actionLoading ? "Saving..." : "Save Schedule"}
              </button>
            </div>
          </form>
        </div>
      )}

      {feedbackModal && (
        <div className={modal.overlay} onClick={() => setFeedbackModal(null)}>
          <div
            className={modal.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{feedbackModal.title}</h2>
            <p>{feedbackModal.message}</p>

            <button
              className={modal.confirmBtn}
              onClick={() => setFeedbackModal(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {lackingModal.open && (
        <div
          className={modal.overlay}
          onClick={() =>
            setLackingModal({
              open: false,
              booking: null,
              fileName: "",
              remarks: "",
            })
          }
        >
          <div
            className={modal.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Lacking Requirement</h2>
            <p>What is lacking or what should the user re-upload?</p>

            <textarea
              className={modal.remarksInput}
              value={lackingModal.remarks}
              onChange={(e) =>
                setLackingModal((prev) => ({
                  ...prev,
                  remarks: e.target.value,
                }))
              }
              placeholder="Enter remarks..."
            />

            <div className={modal.confirmActions}>
              <button
                className={modal.cancelBtn}
                onClick={() =>
                  setLackingModal({
                    open: false,
                    booking: null,
                    fileName: "",
                    remarks: "",
                  })
                }
              >
                Cancel
              </button>

              <button className={modal.confirmBtn} onClick={submitLackingReview}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {completeModal.open && (
        <div
          className={modal.overlay}
          onClick={() =>
            setCompleteModal({
              open: false,
              booking: null,
            })
          }
        >
          <div
            className={modal.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Complete Booking?</h2>
            <p>Mark this booking as completed?</p>

            <div className={modal.confirmActions}>
              <button
                className={modal.cancelBtn}
                onClick={() =>
                  setCompleteModal({
                    open: false,
                    booking: null,
                  })
                }
              >
                Cancel
              </button>

              <button
                className={modal.confirmBtn}
                onClick={confirmCompleteBooking}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}