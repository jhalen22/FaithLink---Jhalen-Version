import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../styles/Admin/AdminPage.module.css";

// Status → badge CSS class (reuses existing AdminPage.module.css badge classes)
const BADGE = {
  upcoming:  styles.badgeScheduled,
  ongoing:   styles.badgeActive,
  completed: styles.badgeInactive,
};

const EMPTY_FORM = {
  title: "", description: "", date: "", time: "", location: "", status: "upcoming",
};

const SearchIcon = () => (
  <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
  });
};

export default function ManageAnnouncements() {
  const [events, setEvents]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState("");
  const [search, setSearch]           = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);

  const token = localStorage.getItem("token");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setFetchError("");
      const res = await axios.get("http://localhost:5000/api/events");
      setEvents(res.data || []);
    } catch {
      setFetchError("Failed to load events. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (ev) => {
    setForm({
      title:       ev.title,
      description: ev.description || "",
      date:        ev.date || "",
      time:        ev.time || "",
      location:    ev.location || "",
      status:      ev.status,
    });
    setEditingId(ev._id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const saveEvent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/events/${editingId}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/events",
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      await fetchEvents();
      cancelForm();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save event.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event/announcement?")) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/events/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchEvents();
    } catch {
      alert("Failed to delete event.");
    }
  };

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    total:     events.length,
    upcoming:  events.filter((e) => e.status === "upcoming").length,
    completed: events.filter((e) => e.status === "completed").length,
  };

  return (
    <div>
      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Announcement Management</h1>
          <p className={styles.pageSubtitle}>
            Create and manage parish events and announcements
          </p>
        </div>
        <button className={styles.primaryBtn} onClick={openAdd}>
          + Add Announcement
        </button>
      </div>

      {/* ── Stats ── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total</p>
          <p className={styles.statValue}>{counts.total}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Upcoming</p>
          <p className={styles.statValue}>{counts.upcoming}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Completed</p>
          <p className={styles.statValue}>{counts.completed}</p>
        </div>
      </div>

      {/* ── Add / Edit form ── */}
      {showForm && (
        <div className={styles.tableCard} style={{ marginBottom: 20 }}>
          <div className={styles.tableCardHeader}>
            <h2 className={styles.tableCardTitle}>
              {editingId ? "Edit Announcement" : "Add New Announcement"}
            </h2>
          </div>
          <form onSubmit={saveEvent} style={{ padding: "16px 24px 20px" }}>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Title *</label>
              <input
                className={styles.formInput}
                name="title"
                placeholder="e.g. Parish Fiesta Celebration"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Description</label>
              <input
                className={styles.formInput}
                name="description"
                placeholder="Short description of the event"
                value={form.description}
                onChange={handleChange}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Date *</label>
                <input
                  className={styles.formInput}
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Time *</label>
                <input
                  className={styles.formInput}
                  name="time"
                  type="time"
                  value={form.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Location *</label>
              <input
                className={styles.formInput}
                name="location"
                placeholder="e.g. Parish Hall / Main Church"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel}>Status</label>
              <select
                className={styles.formInput}
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={saving}
              >
                {saving ? "Saving…" : editingId ? "Save Changes" : "Add Announcement"}
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

      {/* ── Search toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <SearchIcon />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search announcements by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h2 className={styles.tableCardTitle}>Announcement List</h2>
        </div>

        {loading ? (
          <p style={{ padding: "24px", color: "#64748b", fontSize: "0.875rem" }}>
            Loading announcements…
          </p>
        ) : fetchError ? (
          <p style={{ padding: "24px", color: "#dc2626", fontSize: "0.875rem" }}>
            {fetchError}
          </p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Time</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => (
                <tr key={ev._id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{ev.title}</div>
                    {ev.description && (
                      <div style={{ fontSize: "0.76rem", color: "#94a3b8", marginTop: 2 }}>
                        {ev.description}
                      </div>
                    )}
                  </td>
                  <td>{ev.date || "—"}</td>
                  <td>{ev.time || "—"}</td>
                  <td>{ev.location || "—"}</td>
                  <td>
                    <span className={`${styles.badge} ${BADGE[ev.status] || ""}`}>
                      {ev.status.charAt(0).toUpperCase() + ev.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => openEdit(ev)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.dangerBtn}
                        onClick={() => handleDelete(ev._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", color: "#94a3b8", padding: "32px" }}
                  >
                    {events.length === 0
                      ? "No announcements yet. Click \"+ Add Announcement\" to create one."
                      : "No announcements match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
