import { useState, useEffect } from "react";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import styles from "../../styles/Admin/AdminPage.module.css";

const BADGE = {
  active:    styles.badgeActive,
  scheduled: styles.badgeScheduled,
  inactive:  styles.badgeInactive,
};

const EMPTY_FORM = {
  title: "", description: "", url: "", schedule: "", status: "scheduled",
};

export default function ManageStreams() {
  const [streams, setStreams]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);

  const token = localStorage.getItem("token");

  const fetchStreams = async () => {
    try {
      setLoading(true);
      setFetchError("");
      const res = await axios.get("http://localhost:5000/api/streams");
      setStreams(res.data.streams || []);
    } catch {
      setFetchError("Failed to load streams. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStreams(); }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setForm({
      title:       s.title,
      description: s.description || "",
      url:         s.url,
      schedule:    s.schedule || "",
      status:      s.status,
    });
    setEditingId(s._id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const saveStream = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/streams/${editingId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/streams",
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      await fetchStreams();
      cancelForm();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save stream.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/streams/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchStreams();
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this stream? This cannot be undone.")) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/streams/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchStreams();
    } catch {
      alert("Failed to delete stream.");
    }
  };

  const liveCount   = streams.filter((s) => s.status === "active").length;
  const scheduled   = streams.filter((s) => s.status === "scheduled").length;

  return (
    <div>
      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Live Stream Management</h1>
          <p className={styles.pageSubtitle}>
            Manage livestreams, broadcast status, and stream schedules
          </p>
        </div>
        <button className={styles.primaryBtn} onClick={openAdd}>
          + Add Stream
        </button>
      </div>

      {/* ── Stats ── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Live Now</p>
          <p className={styles.statValue}>{liveCount}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Scheduled</p>
          <p className={styles.statValue}>{scheduled}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Streams</p>
          <p className={styles.statValue}>{streams.length}</p>
        </div>
      </div>

      {/* ── Add / Edit form ── */}
      {showForm && (
        <div className={styles.streamCard} style={{ marginBottom: 20 }}>
          <h3 className={styles.streamTitle} style={{ marginBottom: 16 }}>
            {editingId ? "Edit Stream" : "Add New Stream"}
          </h3>
          <form onSubmit={saveStream}>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Title *</label>
              <input
                className={styles.formInput}
                name="title"
                placeholder="e.g. Sunday Holy Mass"
                value={form.title}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Description</label>
              <input
                className={styles.formInput}
                name="description"
                placeholder="Short description of the stream"
                value={form.description}
                onChange={handleFormChange}
              />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>YouTube URL *</label>
              <input
                className={styles.formInput}
                name="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={form.url}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Schedule</label>
              <input
                className={styles.formInput}
                name="schedule"
                placeholder="e.g. Every Sunday, 8:00 AM"
                value={form.schedule}
                onChange={handleFormChange}
              />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Status</label>
              <select
                className={styles.formInput}
                name="status"
                value={form.status}
                onChange={handleFormChange}
              >
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={saving}
              >
                {saving ? "Saving…" : editingId ? "Save Changes" : "Add Stream"}
              </button>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={cancelForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Stream cards ── */}
      {loading ? (
        <p style={{ padding: "24px 0", color: "#64748b", fontSize: "0.875rem" }}>
          Loading streams…
        </p>
      ) : fetchError ? (
        <p style={{ padding: "24px 0", color: "#dc2626", fontSize: "0.875rem" }}>
          {fetchError}
        </p>
      ) : (
        <div className={styles.streamGrid}>
          {streams.length === 0 && (
            <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
              No streams yet. Click "+ Add Stream" to create one.
            </p>
          )}

          {streams.map((s) => (
            <div key={s._id} className={styles.streamCard}>
              {/* Card header */}
              <div className={styles.streamCardHeader}>
                <h3 className={styles.streamTitle}>{s.title}</h3>
                <span className={`${styles.badge} ${BADGE[s.status]}`}>
                  {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                </span>
              </div>

              {/* Meta */}
              {s.description && (
                <p className={styles.streamMeta}>{s.description}</p>
              )}
              {s.schedule && (
                <p className={styles.streamMeta}>Schedule: {s.schedule}</p>
              )}
              {s.url && (
                <p className={styles.streamMeta} style={{ wordBreak: "break-all" }}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#3b82f6", textDecoration: "none" }}
                  >
                    {s.url}
                  </a>
                </p>
              )}

              {/* QR code */}
              {s.url && (
                <div style={{ margin: "12px 0 4px", textAlign: "center" }}>
                  <QRCodeSVG value={s.url} size={80} />
                  <p style={{ fontSize: "0.7rem", color: "#64748b", margin: "4px 0 0" }}>
                    Scan to join stream
                  </p>
                </div>
              )}

              {/* Status controls — hide the button for the current status */}
              <div className={styles.streamActions}>
                {s.status !== "active" && (
                  <button
                    className={styles.actionBtn}
                    style={{ color: "#16a34a", borderColor: "#86efac" }}
                    onClick={() => handleStatus(s._id, "active")}
                  >
                    Set Active
                  </button>
                )}
                {s.status !== "scheduled" && (
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleStatus(s._id, "scheduled")}
                  >
                    Set Scheduled
                  </button>
                )}
                {s.status !== "inactive" && (
                  <button
                    className={styles.actionBtn}
                    onClick={() => handleStatus(s._id, "inactive")}
                  >
                    Set Inactive
                  </button>
                )}
              </div>

              {/* Edit / Delete */}
              <div className={styles.streamActions} style={{ marginTop: 4 }}>
                <button
                  className={styles.actionBtn}
                  onClick={() => openEdit(s)}
                >
                  Edit
                </button>
                <button
                  className={styles.dangerBtn}
                  onClick={() => handleDelete(s._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
