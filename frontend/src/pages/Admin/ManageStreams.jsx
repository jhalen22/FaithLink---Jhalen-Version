import LiveKitBroadcast from "../../components/LiveKitBroadcast";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import {
  Radio,
  Play,
  Square,
  Edit2,
  Trash2,
  WifiOff,
  Clock,
  Calendar,
  Video,
} from "lucide-react";
import styles from "../../styles/Admin/AdminPage.module.css";
import ms from "../../styles/Admin/ManageStreams.module.css";

const API = "http://localhost:5000/api/livestream";

const EMPTY_FORM = {
  title: "",
  url: "",
  status: "scheduled",
  scheduledStartTime: "",
  countdownMinutes: 5,
};

function formatDateTime(value) {
  if (!value) return "Not set";

  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getCountdownText(stream) {
  if (!stream?.countdownStartedAt) {
    return `${stream?.countdownMinutes || 5}:00`;
  }

  const started = new Date(stream.countdownStartedAt).getTime();
  const totalSeconds = (Number(stream.countdownMinutes) || 5) * 60;
  const elapsedSeconds = Math.floor((Date.now() - started) / 1000);
  const remaining = Math.max(totalSeconds - elapsedSeconds, 0);

  const mins = Math.floor(remaining / 60);
  const secs = String(remaining % 60).padStart(2, "0");

  return `${mins}:${secs}`;
}

function getStatusLabel(status) {
  if (status === "live") return "Live";
  if (status === "countdown") return "Countdown";
  if (status === "ended") return "Ended";
  return "Scheduled";
}

function getStatusClass(status) {
  if (status === "live") return ms.statusLive;
  if (status === "countdown") return ms.statusCountdown;
  if (status === "ended") return ms.statusEnded;
  return ms.statusScheduled;
}

export default function ManageStreams() {
  const { showSuccess, showError, showWarning } = useToast();
  const confirm = useConfirm();
  const [replayVideo, setReplayVideo] = useState(null);
  const [uploadingReplay, setUploadingReplay] = useState(false);
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [countdownDisplay, setCountdownDisplay] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [replayTitle, setReplayTitle] = useState("");
  const [replayDescription, setReplayDescription] = useState("");
  const [showReplayEditor, setShowReplayEditor] = useState(false);
  const [editingReplay, setEditingReplay] = useState(null);
  const [newReplayThumbnail, setNewReplayThumbnail] = useState(null);
  const [newReplayVideo, setNewReplayVideo] = useState(null);

  const videoRef = useRef(null);
  const localMediaRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const token = localStorage.getItem("token");
  const [historyStreams, setHistoryStreams] = useState([]);

  const fetchStream = async () => {
    try {
      setLoading(true);
      setFetchError("");

      const res = await axios.get(API);
      const latestStream = res.data.stream || null;

      setStream(latestStream);

      if (latestStream?.status === "live") {
        setBroadcasting(true);
      } else {
        setBroadcasting(false);
      }
    } catch (error) {
      console.error(error);
      setFetchError("Failed to load stream. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
  try {
    const res = await axios.get(`${API}/history/all`);
    setHistoryStreams(res.data.streams || []);
  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {
  fetchStream();
  fetchHistory();
}, []);

  useEffect(() => {
    if (!stream || stream.status !== "live") return;

    const interval = setInterval(async () => {
      try {
        await axios.put(`${API}/${stream._id}/view`);
        await fetchStream();
      } catch (error) {
        console.error(error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [stream?._id, stream?.status]);

  useEffect(() => {
    if (stream?.status !== "countdown") return;

    const timer = setInterval(() => {
      setCountdownDisplay(getCountdownText(stream));
    }, 1000);

    setCountdownDisplay(getCountdownText(stream));

    return () => clearInterval(timer);
  }, [stream?.status, stream?.countdownStartedAt, stream?.countdownMinutes]);

  useEffect(() => {
    return () => {
      if (localMediaRef.current) {
        localMediaRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
  if (cameraActive && videoRef.current && localMediaRef.current) {
    videoRef.current.srcObject = localMediaRef.current;
  }
}, [cameraActive]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (s) => {
    setForm({
      title: s.title || "",
      url: s.url || "",
      status: s.status === "not-live" ? "scheduled" : s.status || "scheduled",
      scheduledStartTime: s.scheduledStartTime
        ? new Date(s.scheduledStartTime).toISOString().slice(0, 16)
        : "",
      countdownMinutes: s.countdownMinutes || 5,
    });

    setEditingId(s._id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveStream = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        title: form.title,
        url: form.url,
        status: form.status,
        scheduledStartTime: form.scheduledStartTime || null,
        countdownMinutes: Number(form.countdownMinutes) || 5,
      };

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
      showError(err.response?.data?.message || "Failed to save stream.");
    } finally {
      setSaving(false);
    }
  };

  const startCountdown = async (id) => {
    try {
      await axios.patch(
        `${API}/${id}/countdown`,
        { countdownMinutes: stream?.countdownMinutes || 5 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchStream();
    } catch (error) {
      console.error(error);
      showError("Failed to start countdown.");
    }
  };

  const streamNow = async (id) => {
    try {
      setBroadcasting(true);

      await axios.patch(
        `${API}/${id}/start`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchStream();
    } catch (error) {
      console.error(error);
      setBroadcasting(false);
      showError("Failed to start stream.");
    }
  };

  const startCameraPreview = async () => {
  try {
    const streamMedia = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localMediaRef.current = streamMedia;
    setCameraActive(true);
  } catch (error) {
    console.error(error);
    showError("Failed to access camera/microphone.");
  }
};

  const endStream = async (id) => {
    const ok = await confirm({
      title: "End Livestream",
      message: "Are you sure you want to end this livestream now?",
      confirmLabel: "End Stream",
      variant: "warning",
    });
    if (!ok) return;

    try {
      await axios.patch(
        `${API}/${id}/end`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBroadcasting(false);
      await fetchStream();
      await fetchHistory();
    } catch (error) {
      console.error(error);
      showError("Failed to end stream.");
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Delete Stream",
      message: "Delete this stream? This cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;

    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStream(null);
      setBroadcasting(false);
    } catch (error) {
      console.error(error);
      showError("Failed to delete stream.");
    }
  };

  const deleteReplay = async (id) => {
  const ok = await confirm({
    title: "Delete Replay",
    message: "Delete this replay? This will remove it from parishioner views too.",
    confirmLabel: "Delete",
    variant: "danger",
  });
  if (!ok) return;

  try {
    await axios.delete(`${API}/${id}/replay`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    showSuccess("Replay deleted successfully!");

    await fetchStream();
    await fetchHistory();
  } catch (error) {
    console.error(error);
    showError("Failed to delete replay.");
  }
};

  const uploadReplay = async () => {
  if (!replayVideo) {
  showWarning("Please select a video first.");
  return;
}

  try {
    setUploadingReplay(true);

    const formData = new FormData();
    formData.append("video", replayVideo);
    formData.append("replayTitle", replayTitle);
    formData.append("replayDescription", replayDescription);

    const token = localStorage.getItem("token");

    await axios.post(`${API}/replay/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    showSuccess("Replay uploaded successfully!");

    await fetchStream();
    await fetchHistory();

    setReplayTitle("");
    setReplayDescription("");
    setReplayVideo(null);
    setShowUploadForm(false);
  } catch (error) {
    console.error(error);
    showError("Failed to upload replay.");
  } finally {
    setUploadingReplay(false);
  }
};

const saveReplayChanges = async () => {
  if (!editingReplay) return;

  try {
    const formData = new FormData();

    if (newReplayVideo) {
      formData.append("video", newReplayVideo);
    }

    if (newReplayThumbnail) {
      formData.append("thumbnail", newReplayThumbnail);
    }

    const token = localStorage.getItem("token");

    await axios.put(
      `${API}/replay/${editingReplay._id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    showSuccess("Replay changes saved successfully!");
    await fetchHistory();
    setShowReplayEditor(false);
    setEditingReplay(null);
    setNewReplayThumbnail(null);
    setNewReplayVideo(null);
  } catch (error) {
    console.error(error);
    showError("Failed to update replay.");
  }
};

  const hasVideoSource = Boolean(stream?.embedUrl);

  return (
    <div>
      <div className={styles.pageHeader}>
  <div>
    <h1 className={styles.pageTitle}>Live Stream Management</h1>
    <p className={styles.pageSubtitle}>
      Schedule, start countdown, and manage the parish livestream
    </p>
  </div>

  {!showForm && (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
    }}
  >
    <button className={ms.addStreamBtn} onClick={openAdd}>
      + Create Stream
    </button>

    <button
      className={ms.addStreamBtn}
      onClick={() => setShowUploadForm(true)}
    >
      Upload Video
    </button>
  </div>
)}
</div>

{showUploadForm && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.45)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: 26,
        borderRadius: 18,
        border: "1px solid #e2e8f0",
        width: "100%",
        maxWidth: 650,
        boxShadow: "0 20px 50px rgba(15, 23, 42, 0.25)",
      }}
    >
      <h3 style={{ marginBottom: 18 }}>Upload Stream Replay</h3>

      <div className={styles.formRow}>
        <label className={styles.formLabel}>Video Title</label>
        <input
          className={styles.formInput}
          value={replayTitle}
          onChange={(e) => setReplayTitle(e.target.value)}
          placeholder="e.g. Sunday Holy Mass Replay"
        />
      </div>

      <div className={styles.formRow}>
        <label className={styles.formLabel}>Description</label>
        <textarea
          className={styles.formInput}
          value={replayDescription}
          onChange={(e) => setReplayDescription(e.target.value)}
          placeholder="Add description for parishioners..."
          rows="4"
        />
      </div>

      <div className={styles.formRow}>
        <label className={styles.formLabel}>Video File</label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setReplayVideo(e.target.files[0])}
        />
      </div>

      <div className={styles.formActions}>
        <button
          className={ms.goLiveBtn}
          onClick={uploadReplay}
          disabled={uploadingReplay}
        >
          {uploadingReplay ? "Uploading..." : "Upload & Publish"}
        </button>

        <button
          className={styles.actionBtn}
          onClick={() => setShowUploadForm(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

      {showForm && (
        <div className={ms.formPreviewGrid}>
          <div className={ms.formCard}>
            <h3 className={ms.cardTitle}>
              {editingId ? "Edit Stream" : "Create Livestream Schedule"}
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
                <label className={styles.formLabel}>
                  Stream URL / Playback URL
                </label>
                <input
                  className={styles.formInput}
                  name="url"
                  placeholder="Optional for now, e.g. YouTube embed/live URL"
                  value={form.url}
                  onChange={handleFormChange}
                />
                <p className={ms.helperText}>
                  Leave this blank for now if you want to simulate an in-app
                  livestream room.
                </p>
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>Scheduled Start</label>
                <input
                  className={styles.formInput}
                  type="datetime-local"
                  name="scheduledStartTime"
                  value={form.scheduledStartTime}
                  onChange={handleFormChange}
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>
                  Countdown Before Start
                </label>
                <select
                  className={styles.formInput}
                  name="countdownMinutes"
                  value={form.countdownMinutes}
                  onChange={handleFormChange}
                >
                  <option value="1">1 minute</option>
                  <option value="3">3 minutes</option>
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <label className={styles.formLabel}>Initial Status</label>
                <select
                  className={styles.formInput}
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="countdown">Countdown</option>
                  <option value="live">Live</option>
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

          <div className={ms.previewCard}>
            <h3 className={ms.cardTitle}>Admin Preview</h3>

            <div className={ms.previewLive}>
              <div className={ms.previewVideoArea}>
                <span className={ms.liveBadge}>
                  <span className={ms.liveDot} />
                  {broadcasting ? "LIVE" : getStatusLabel(form.status).toUpperCase()}
                </span>

                {cameraActive ? (
                  <div style={{ position: "relative" }}>
                    {broadcasting && (
                      <div
                        style={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          zIndex: 10,
                          background: "#EF4444",
                          color: "#fff",
                          padding: "6px 12px",
                          borderRadius: 999,
                          fontWeight: 700,
                          fontSize: "0.8rem",
                        }}
                      >
                        🔴 LIVE
                      </div>
                    )}

                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className={ms.cameraPreview}
                    />
                  </div>
                ) : (
                  <div className={ms.previewPlaceholder}>
                    <Radio size={28} />
                    <p>Camera preview / stream player area</p>

                    <button
                      type="button"
                      className={ms.goLiveBtn}
                      onClick={startCameraPreview}
                      style={{ marginTop: 12 }}
                    >
                      Enable Camera
                    </button>
                  </div>
                )}
              </div>

              <div className={ms.previewInfo}>
                <p className={ms.previewTitle}>{form.title || "Stream Title"}</p>
                <p className={ms.previewUrl}>
                  Starts:{" "}
                  {form.scheduledStartTime
                    ? formatDateTime(form.scheduledStartTime)
                    : "Not set"}
                </p>
                <p className={ms.previewUrl}>
                  Countdown: {form.countdownMinutes} minutes
                </p>

                {broadcasting && (
                  <p
                    style={{
                      color: "#EF4444",
                      fontWeight: 700,
                      marginTop: 10,
                    }}
                  >
                    Broadcasting live to parishioners...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
            <p>No stream yet. Click “Create Stream” to schedule one.</p>
          </div>
        </div>
      ) : stream && !showForm ? (
        <div className={ms.streamGrid}>
          <div
            className={`${ms.streamCard} ${
              stream.status === "live" ? ms.streamCardLive : ""
            }`}
          >
            <div className={ms.cardVideo}>
  {stream.status === "live" ? (
    hasVideoSource ? (
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
      <LiveKitBroadcast
        roomName={stream.roomName}
        participantName="Admin"
      />
    )
  ) : (
    <div className={ms.cardVideoEmpty}>
      {stream.status === "countdown" ? (
        <Clock size={28} />
      ) : (
        <WifiOff size={24} />
      )}
      <p>
        {stream.status === "countdown"
          ? `Starting in ${countdownDisplay}`
          : stream.status === "ended"
          ? "Stream Ended"
          : "Scheduled Stream"}
      </p>
    </div>
  )}
</div>

            <div className={ms.cardBody}>
              <div className={ms.cardHeader}>
                <h3 className={ms.cardStreamTitle}>{stream.title}</h3>
                <span
                  className={`${ms.statusBadge} ${getStatusClass(stream.status)}`}
                >
                  {getStatusLabel(stream.status)}
                </span>
              </div>

              <div className={ms.streamMetaList}>
                <p>
                  <Calendar size={13} />
                  <span>Schedule: {formatDateTime(stream.scheduledStartTime)}</span>
                </p>

                <p>
                  <Clock size={13} />
                  <span>Countdown: {stream.countdownMinutes || 5} minutes</span>
                </p>

                {stream.status === "countdown" && (
                  <p className={ms.countdownText}>
                    <Clock size={13} />
                    <span>Time left: {countdownDisplay}</span>
                  </p>
                )}

                {stream.roomName && (
                  <p>
                    <Radio size={13} />
                    <span>Room: {stream.roomName}</span>
                  </p>
                )}

                <p>
                  👁️ Viewers:{" "}
                  {stream.status === "live"
                    ? stream.viewerCount || 0
                    : stream.totalViews || 0}
                </p>
              </div>

              {stream.url && <p className={ms.cardUrl}>{stream.url}</p>}

              <div className={ms.cardActions}>
                {stream.status === "scheduled" && (
                  <button
                    className={ms.countdownBtn}
                    onClick={() => startCountdown(stream._id)}
                  >
                    <Clock size={11} />
                    Start Countdown
                  </button>
                )}

                {stream.status === "countdown" && (
                  <button
                    className={ms.goLiveBtn}
                    onClick={() => streamNow(stream._id)}
                  >
                    <Play size={11} />
                    Stream Now
                  </button>
                )}

                {stream.status === "live" && (
                  <button
                    className={ms.endLiveSmall}
                    onClick={() => endStream(stream._id)}
                  >
                    <Square size={11} />
                    End Live
                  </button>
                )}

                {stream.status !== "live" && stream.status !== "countdown" && (
                  <button className={styles.actionBtn} onClick={() => openEdit(stream)}>
                    <Edit2
                      size={11}
                      style={{ verticalAlign: "middle", marginRight: 3 }}
                    />
                    Edit
                  </button>
                )}

                <button
                  className={styles.dangerBtn}
                  onClick={() => handleDelete(stream._id)}
                >
                  <Trash2
                    size={11}
                    style={{ verticalAlign: "middle", marginRight: 3 }}
                  />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {historyStreams.length > 0 && (
  <div style={{ marginTop: 30 }}>
    <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>
      Livestream History
    </h2>

    <div style={{ display: "grid", gap: 16 }}>
      {historyStreams.map((item) => (
        <div
          key={item._id}
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>
            {item.replayTitle || item.title}
          </h3>

          <p style={{ color: "#64748b", marginTop: 4 }}>
            Ended: {item.endedAt ? formatDateTime(item.endedAt) : "Not recorded"}
          </p>

          <p style={{ marginTop: 8 }}>
            👁️ Total Views: {item.totalViews || 0}
          </p>
          <p style={{ marginTop: 8 }}>
  🔥 Peak Viewers: {item.peakViewerCount || 0}
</p>

<p style={{ marginTop: 8 }}>
  ▶ Replay Views: {item.replayViews || 0}
</p>

<p style={{ marginTop: 8 }}>
  ⏱ Duration:{" "}
  {item.streamDurationSeconds
    ? `${Math.floor(item.streamDurationSeconds / 60)} min ${item.streamDurationSeconds % 60} sec`
    : "Not recorded"}
</p>

          <p style={{ marginTop: 8 }}>
            Replay Status:{" "}
            <strong style={{ color: item.replayVideoUrl ? "#16a34a" : "#dc2626" }}>
              {item.replayVideoUrl ? "Uploaded" : "No replay uploaded"}
            </strong>
          </p>

          {item.replayVideoUrl && (
  <div
  style={{
    marginTop: 14,
    marginBottom: 14,
    display: "flex",
    gap: 10,
    position: "relative",
    zIndex: 5,
  }}
>
    <button
      className={ms.goLiveBtn}
      onClick={() => {
        setEditingReplay(item);
        setShowReplayEditor(true);
      }}
    >
      Edit Replay
    </button>

    <button
  className={styles.dangerBtn}
  onClick={() => deleteReplay(item._id)}
>
  Delete Replay
</button>
  </div>
)}

{item.replayVideoUrl && (
  <div
    style={{
      marginTop: 14,
      zIndex: 1,
      position: "relative",
      borderRadius: 14,
      overflow: "hidden",
      background: "#000",
      cursor: "pointer",
    }}
    onClick={() =>
      window.open(
        `http://localhost:5000${item.replayVideoUrl}`,
        "_blank"
      )
    }
  >
    <img
  src={
    item.replayThumbnailUrl
      ? `http://localhost:5000${item.replayThumbnailUrl}`
      : "https://placehold.co/800x450/png"
  }
  alt="Replay Thumbnail"
  style={{
    width: "100%",
    height: 260,
    objectFit: "cover",
    display: "block",
  }}
/>

    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 74,
        height: 74,
        borderRadius: "50%",
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: 26,
        fontWeight: 700,
      }}
    >
      ▶
    </div>
  </div>
)}

{showReplayEditor && editingReplay && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.65)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}
  >
    <div
  style={{
    width: "100%",
    maxWidth: 520,
    background: "#ffffff",
    borderRadius: 28,
    overflow: "hidden",
    boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
  }}
>
  <div
    style={{
      padding: "22px 26px",
      background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
      color: "#fff",
    }}
  >
    <h2
      style={{
        margin: 0,
        fontSize: "1.5rem",
        fontWeight: 800,
      }}
    >
      Edit Replay
    </h2>

    <p
      style={{
        marginTop: 6,
        opacity: 0.9,
        fontSize: "0.92rem",
      }}
    >
      Update replay video and thumbnail
    </p>
  </div>

  <div
    style={{
      padding: 26,
      display: "flex",
      flexDirection: "column",
      gap: 22,
    }}
  >
    {/* VIDEO */}
    <div>
      <label
        style={{
          display: "block",
          fontWeight: 700,
          marginBottom: 10,
          color: "#111827",
        }}
      >
        Replace Replay Video
      </label>

      <label
        style={{
          border: "2px dashed #cbd5e1",
          borderRadius: 18,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          background: "#f8fafc",
        }}
      >
        <span style={{ fontSize: 34, marginBottom: 10 }}>
          🎥
        </span>

        <span
          style={{
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          Choose Replay Video
        </span>

        <input
          type="file"
          accept="video/*"
          onChange={(e) =>
            setNewReplayVideo(e.target.files[0])
          }
          hidden
        />
      </label>

      {newReplayVideo && (
        <p
          style={{
            marginTop: 10,
            color: "#2563eb",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          {newReplayVideo.name}
        </p>
      )}
    </div>

    {/* THUMBNAIL */}
    <div>
      <label
        style={{
          display: "block",
          fontWeight: 700,
          marginBottom: 10,
          color: "#111827",
        }}
      >
        Replace Thumbnail
      </label>

      <label
        style={{
          border: "2px dashed #cbd5e1",
          borderRadius: 18,
          padding: 22,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          background: "#f8fafc",
        }}
      >
        <span style={{ fontSize: 32, marginBottom: 10 }}>
          🖼️
        </span>

        <span
          style={{
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          Choose Thumbnail
        </span>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setNewReplayThumbnail(e.target.files[0])
          }
          hidden
        />
      </label>

      {newReplayThumbnail && (
        <p
          style={{
            marginTop: 10,
            color: "#2563eb",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          {newReplayThumbnail.name}
        </p>
      )}
    </div>

    <div
      style={{
        display: "flex",
        gap: 14,
        marginTop: 6,
      }}
    >
      <button
        onClick={() => {
          setShowReplayEditor(false);
          setEditingReplay(null);
        }}
        style={{
          flex: 1,
          padding: "14px",
          border: "none",
          borderRadius: 16,
          background: "#ef4444",
          color: "#fff",
          fontWeight: 700,
          fontSize: "0.95rem",
          cursor: "pointer",
        }}
      >
        Close
      </button>

            <button
             onClick={saveReplayChanges}
        style={{
          
          flex: 1,
          padding: "14px",
          border: "none",
          borderRadius: 16,
          background: "#2563eb",
          color: "#fff",
          fontWeight: 700,
          fontSize: "0.95rem",
          cursor: "pointer",
        }}
      >
        Save Changes
      </button>
    </div>
  </div>
</div>
  </div>
)}

        </div>
      ))}
    </div>
  </div>
)}

    </div>
  );
}