import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../styles/Admin/AdminPage.module.css";
import panel from "../../styles/Admin/ManageBookings.module.css";
import { useToast } from "../../context/ToastContext";

// ManageBookings.module.css contains all the slide-in panel styles (overlay,
// panel, sections, detail rows, action buttons) — reused here so no duplicate CSS is needed.

const BADGE = {
  pending: styles.badgePending,
  verified: styles.badgeApproved,
  rejected: styles.badgeRejected,
};

const STATUS_LABEL = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
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

const formatAmount = (amount) => {
  if (amount == null) return "—";
  return `₱${Number(amount).toLocaleString("en-PH")}`;
};

export default function ManageDonations() {
  const { showError } = useToast();
  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setFetchError("");
      const res = await axios.get("http://localhost:5000/api/donations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonations(res.data.donations || []);
    } catch {
      setFetchError("Failed to load donations. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading(true);
    try {
      await axios.put(
        `http://localhost:5000/api/donations/${id}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchDonations();
      setSelected((prev) =>
        prev && prev._id === id
          ? { ...prev, status: action === "verify" ? "verified" : "rejected" }
          : prev
      );
    } catch {
      showError("Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = donations.filter((d) => {
    const name = (d.parishioner?.fullName || "").toLowerCase();
    const purpose = (d.purpose || "").toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || purpose.includes(q);
  });

  const counts = {
    pending: donations.filter((d) => d.status === "pending").length,
    verified: donations.filter((d) => d.status === "verified").length,
    total: donations.length,
  };

  return (
    <div>
      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Donation Management</h1>
          <p className={styles.pageSubtitle}>
            Track and verify parishioner donation records
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
          <p className={styles.statLabel}>Verified</p>
          <p className={styles.statValue}>{counts.verified}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Donations</p>
          <p className={styles.statValue}>{counts.total}</p>
        </div>
      </div>

      {/* ── Search toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <SearchIcon />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search donors or purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h2 className={styles.tableCardTitle}>Donation Records</h2>
        </div>

        {loading ? (
          <p className={panel.stateMsg}>Loading donations…</p>
        ) : fetchError ? (
          <p className={panel.errorMsg}>{fetchError}</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Donor</th>
                <th>Amount</th>
                <th>Purpose</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d._id}>
                  <td>{d.parishioner?.fullName || "—"}</td>
                  <td>{formatAmount(d.amount)}</td>
                  <td>{d.purpose}</td>
                  <td>{d.method}</td>
                  <td>{formatDate(d.createdAt)}</td>
                  <td>
                    <span className={`${styles.badge} ${BADGE[d.status] || ""}`}>
                      {STATUS_LABEL[d.status] || d.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.actionBtn}
                      onClick={() => setSelected(d)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      color: "#94a3b8",
                      padding: "32px",
                    }}
                  >
                    No donations match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Donation Detail Panel ── */}
      {selected && (
        <div className={panel.overlay} onClick={() => setSelected(null)}>
          <div className={panel.panel} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={panel.panelHeader}>
              <div>
                <h2 className={panel.panelTitle}>Donation Details</h2>
                <span className={`${styles.badge} ${BADGE[selected.status] || ""}`}>
                  {STATUS_LABEL[selected.status] || selected.status}
                </span>
              </div>
              <button
                className={panel.closeBtn}
                onClick={() => setSelected(null)}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className={panel.panelBody}>

              {/* Donor info */}
              <div className={panel.section}>
                <h3 className={panel.sectionTitle}>Donor</h3>
                <div className={panel.detailRow}>
                  <span className={panel.detailLabel}>Name</span>
                  <span className={panel.detailValue}>
                    {selected.parishioner?.fullName || "—"}
                  </span>
                </div>
                <div className={panel.detailRow}>
                  <span className={panel.detailLabel}>Email</span>
                  <span className={panel.detailValue}>
                    {selected.parishioner?.email || "—"}
                  </span>
                </div>
              </div>

              {/* Donation info */}
              <div className={panel.section}>
                <h3 className={panel.sectionTitle}>Donation</h3>
                <div className={panel.detailRow}>
                  <span className={panel.detailLabel}>Amount</span>
                  <span className={panel.detailValue}>
                    {formatAmount(selected.amount)}
                  </span>
                </div>
                <div className={panel.detailRow}>
                  <span className={panel.detailLabel}>Purpose</span>
                  <span className={panel.detailValue}>{selected.purpose}</span>
                </div>
                <div className={panel.detailRow}>
                  <span className={panel.detailLabel}>Method</span>
                  <span className={panel.detailValue}>{selected.method}</span>
                </div>
                <div className={panel.detailRow}>
                  <span className={panel.detailLabel}>Reference Code</span>
                  <span className={panel.detailValue}>
                    {selected.referenceCode}
                  </span>
                </div>
                <div className={panel.detailRow}>
                  <span className={panel.detailLabel}>Date Submitted</span>
                  <span className={panel.detailValue}>
                    {formatDate(selected.createdAt)}
                  </span>
                </div>
              </div>

              {/* Donor message */}
              {selected.message && (
                <div className={panel.section}>
                  <h3 className={panel.sectionTitle}>Message</h3>
                  <p className={panel.noteText}>{selected.message}</p>
                </div>
              )}

              {/* Receipt */}
              {selected.receiptImage && (
                <div className={panel.section}>
                  <h3 className={panel.sectionTitle}>Receipt</h3>
                  <a
                    href={`http://localhost:5000/uploads/${selected.receiptImage}`}
                    target="_blank"
                    rel="noreferrer"
                    className={panel.docLink}
                  >
                    View Receipt Image
                  </a>
                </div>
              )}

              {/* Verify / Reject — only shown while pending */}
              {selected.status === "pending" && (
                <div className={panel.actions}>
                  <button
                    className={panel.approveBtn}
                    disabled={actionLoading}
                    onClick={() => handleAction(selected._id, "verify")}
                  >
                    {actionLoading ? "Processing…" : "Verify"}
                  </button>
                  <button
                    className={panel.rejectBtn}
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
