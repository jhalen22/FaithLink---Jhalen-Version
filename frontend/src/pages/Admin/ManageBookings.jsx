import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../styles/Admin/AdminPage.module.css";
import modal from "../../styles/Admin/ManageBookings.module.css";

// Human-readable labels for sacramentSpecificData keys
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

const formatTime = (timeStr) => {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 || 12;
  return `${display}:${m} ${suffix}`;
};

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleAction = async (id, action) => {
    setActionLoading(true);
    try {
      await axios.put(
        `http://localhost:5000/api/bookings/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh the list and update the modal if it's still open for this booking
      await fetchBookings();
      setSelected((prev) =>
        prev && prev._id === id
          ? { ...prev, status: action === "approve" ? "approved" : "rejected" }
          : prev
      );
    } catch {
      alert("Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Step 1: narrow by service type (drives both stats and the table)
  const serviceFiltered =
    serviceFilter === "All"
      ? bookings
      : bookings.filter((b) => b.sacramentType === serviceFilter);

  // Step 2: further narrow by search text (drives the table only)
  const filtered = serviceFiltered.filter((b) => {
    const name = (b.parishioner?.fullName || "").toLowerCase();
    const service = (b.sacramentType || "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || service.includes(q);
  });

  // Stats always reflect the selected service filter, not the search text
  const counts = {
    pending: serviceFiltered.filter((b) => b.status === "pending").length,
    approved: serviceFiltered.filter((b) => b.status === "approved").length,
    total: serviceFiltered.length,
  };

  const openModal = (booking) => setSelected(booking);
  const closeModal = () => setSelected(null);

  // Render a key/value list from sacramentSpecificData
  const renderSacramentDetails = (data = {}) =>
    Object.entries(data)
      .filter(([, val]) => val)
      .map(([key, val]) => (
        <div key={key} className={modal.detailRow}>
          <span className={modal.detailLabel}>{FIELD_LABELS[key] || key}</span>
          <span className={modal.detailValue}>{val}</span>
        </div>
      ));

  return (
    <div>
      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Booking Management</h1>
          <p className={styles.pageSubtitle}>
            Review and approve sacramental booking requests
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
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

      {/* ── Service filter pills ── */}
      <div className={modal.filterRow}>
        {SERVICE_FILTERS.map((f) => (
          <button
            key={f}
            className={`${modal.filterBtn} ${serviceFilter === f ? modal.filterBtnActive : ""}`}
            onClick={() => {
              setServiceFilter(f);
              setSearch("");
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Search toolbar ── */}
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

      {/* ── Table ── */}
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
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.actionBtn}
                      onClick={() => openModal(b)}
                    >
                      Review
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

      {/* ── Booking Detail Modal ── */}
      {selected && (
        <div className={modal.overlay} onClick={closeModal}>
          <div className={modal.panel} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={modal.panelHeader}>
              <div>
                <h2 className={modal.panelTitle}>{selected.sacramentType}</h2>
                <span className={`${styles.badge} ${BADGE[selected.status] || ""}`}>
                  {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                </span>
              </div>
              <button className={modal.closeBtn} onClick={closeModal}>
                ✕
              </button>
            </div>

            {/* Body */}
            <div className={modal.panelBody}>

              {/* Parishioner info */}
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
                    <span className={modal.detailValue}>{selected.contactNumber}</span>
                  </div>
                )}
                {selected.address && (
                  <div className={modal.detailRow}>
                    <span className={modal.detailLabel}>Address</span>
                    <span className={modal.detailValue}>{selected.address}</span>
                  </div>
                )}
              </div>

              {/* Requested schedule */}
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

              {/* Sacrament-specific details */}
              {selected.sacramentSpecificData &&
                Object.keys(selected.sacramentSpecificData).length > 0 && (
                  <div className={modal.section}>
                    <h3 className={modal.sectionTitle}>Sacrament Details</h3>
                    {renderSacramentDetails(selected.sacramentSpecificData)}
                  </div>
                )}

              {/* Special notes */}
              {selected.message && (
                <div className={modal.section}>
                  <h3 className={modal.sectionTitle}>Special Notes</h3>
                  <p className={modal.noteText}>{selected.message}</p>
                </div>
              )}

              {/* Uploaded documents */}
              {selected.uploadedDocuments &&
                selected.uploadedDocuments.length > 0 && (
                  <div className={modal.section}>
                    <h3 className={modal.sectionTitle}>Uploaded Documents</h3>
                    <ul className={modal.docList}>
                      {selected.uploadedDocuments.map((doc, i) => (
                        <li key={i}>
                          <a
                            href={`http://localhost:5000/uploads/${doc}`}
                            target="_blank"
                            rel="noreferrer"
                            className={modal.docLink}
                          >
                            {doc}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Admin remarks (if already set) */}
              {selected.adminRemarks && (
                <div className={modal.section}>
                  <h3 className={modal.sectionTitle}>Admin Remarks</h3>
                  <p className={modal.noteText}>{selected.adminRemarks}</p>
                </div>
              )}

              {/* Assigned schedule (if already set) */}
              {selected.assignedSchedule && (
                <div className={modal.section}>
                  <h3 className={modal.sectionTitle}>Assigned Schedule</h3>
                  <p className={modal.noteText}>
                    {formatDate(selected.assignedSchedule)}
                  </p>
                </div>
              )}

              {/* Approve / Reject — only shown while still pending */}
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
    </div>
  );
}
