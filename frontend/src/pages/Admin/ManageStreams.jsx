import { useState, useEffect } from "react";
import axios from "axios";
import { Radio, Play, Square, Edit2, Trash2, WifiOff } from "lucide-react";
import styles from "../../styles/Admin/AdminPage.module.css";
import ms from "../../styles/Admin/ManageStreams.module.css";

const API = "http://localhost:5000/api/livestream";
const EMPTY_FORM = { title: "", url: "", status: "not-live" };

export default function ManageStreams() {
  const [stream, setStream]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  const token = localStorage.getItem("token");

  const fetchStream = async () => {
    try {
      setLoading(true);
      setFetchError("");
      const res = await axios.get(API);
      setStream(res.data.stream || null);
    } catch {
      setFetchError("Failed to load stream. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStream(); }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setForm({ title: s.title, url: s.url, status: s.status });
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
      const payload = { title: form.title, url: form.url, status: form.status };
      if (editingId) {
        await axios.put(`${API}/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(API, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      await fetchStream();
      cancelForm();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save stream.");
    } finally {
      setSaving(false);
    }
  };

  const toggleLive = async (id, newStatus) => {
    try {
      await axios.put(
        `${API}/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchStream();
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this stream? This cannot be undone.")) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStream(null);
    } catch {
      alert("Failed to delete stream.");
    }
  };

  return (
    <div>
      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Live Stream Management</h1>
          <p className={styles.pageSubtitle}>
            Manage the church livestream for parishioners
          </p>
        </div>
        {!stream && !showForm && (
          <button className={ms.addStreamBtn} onClick={openAdd}>
            + Add Stream
          </button>
        )}
      </div>

      {/* ── Add / Edit form ── */}
      {showForm && (
        <div className={ms.formPreviewGrid}>
          {/* Form card */}
          <div className={ms.formCard}>
            <h3 className={ms.cardTitle}>
              {editingId ? "Edit Stream" : "Add New Stream"}
            </h3>
            <form onSubmit={saveStream}>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>Stream Title *</label>
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
                <label className={styles.formLabel}>Stream URL *</label>
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
                <label className={styles.formLabel}>Status</label>
                <select
                  className={styles.formInput}
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                >
                  <option value="live">Live</option>
                  <option value="not-live">Not Live</option>
                </select>
              </div>

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={ms.addStreamBtn}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save Stream"}
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

          {/* Preview card */}
          <div className={ms.previewCard}>
            <h3 className={ms.cardTitle}>Preview</h3>
            {form.status === "live" ? (
              <div className={ms.previewLive}>
                <div className={ms.previewVideoArea}>
                  <span className={ms.liveBadge}>
                    <span className={ms.liveDot} />
                    LIVE
                  </span>
                  <div className={ms.previewPlaceholder}>
                    <Radio size={28} />
                    <p>Stream will play here</p>
                  </div>
                </div>
                <div className={ms.previewInfo}>
                  <p className={ms.previewTitle}>
                    {form.title || "Stream Title"}
                  </p>
                  {form.url && <p className={ms.previewUrl}>{form.url}</p>}
                </div>
              </div>
            ) : (
              <div className={ms.previewEmpty}>
                <WifiOff size={32} />
                <p>No livestream available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Stream card / empty state ── */}
      {loading ? (
        <p style={{ padding: "24px 0", color: "#64748b", fontSize: "0.875rem" }}>
          Loading…
        </p>
      ) : fetchError ? (
        <p style={{ padding: "24px 0", color: "#dc2626", fontSize: "0.875rem" }}>
          {fetchError}
        </p>
      ) : !stream && !showForm ? (
        <div className={ms.streamGrid}>
          <div className={ms.emptyState}>
            <Radio size={40} />
            <p>No stream yet. Click "+ Add Stream" to get started.</p>
          </div>
        </div>
      ) : stream && !showForm ? (
        <div className={ms.streamGrid}>
          <div
            className={`${ms.streamCard} ${stream.status === "live" ? ms.streamCardLive : ""}`}
          >
            {/* Video area */}
            <div className={ms.cardVideo}>
              {stream.status === "live" ? (
                <>
                  <iframe
                    src={stream.embedUrl}
                    title={stream.title}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    className={ms.cardIframe}
                  />
                  <span className={ms.cardLiveBadge}>
                    <span className={ms.liveDot} />
                    LIVE
                  </span>
                </>
              ) : (
                <div className={ms.cardVideoEmpty}>
                  <WifiOff size={22} />
                  <p>Not Live</p>
                </div>
              )}
            </div>

            {/* Card body */}
            <div className={ms.cardBody}>
              <div className={ms.cardHeader}>
                <h3 className={ms.cardStreamTitle}>{stream.title}</h3>
                <span
                  className={`${ms.statusBadge} ${
                    stream.status === "live" ? ms.statusLive : ms.statusInactive
                  }`}
                >
                  {stream.status === "live" ? "Live" : "Not Live"}
                </span>
              </div>

              {stream.url && <p className={ms.cardUrl}>{stream.url}</p>}

              <div className={ms.cardActions}>
                {stream.status !== "live" ? (
                  <button
                    className={ms.goLiveBtn}
                    onClick={() => toggleLive(stream._id, "live")}
                  >
                    <Play size={11} />
                    Go Live
                  </button>
                ) : (
                  <button
                    className={ms.endLiveSmall}
                    onClick={() => toggleLive(stream._id, "not-live")}
                  >
                    <Square size={11} />
                    End Live
                  </button>
                )}

                <button
                  className={styles.actionBtn}
                  onClick={() => openEdit(stream)}
                >
                  <Edit2 size={11} style={{ verticalAlign: "middle", marginRight: 3 }} />
                  Edit
                </button>

                <button
                  className={styles.dangerBtn}
                  onClick={() => handleDelete(stream._id)}
                >
                  <Trash2 size={11} style={{ verticalAlign: "middle", marginRight: 3 }} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
