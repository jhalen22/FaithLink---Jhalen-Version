import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Bell, Calendar, Heart, Video, BookMarked, Play, MessageCircle, ThumbsUp,
} from "lucide-react";
import BottomNav from "../../components/BottomNav";
import "../../styles/Parishioner/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setNotifications(res.data || []))
      .catch(() => {}); // silently ignore — badge is non-critical
  }, []);

  // Count unread notifications whose title or message is about a Mass Intention.
  // Booking, donation, and system notifications are excluded.
  const unreadIntentionCount = notifications.filter(
    (n) =>
      !n.isRead &&
      (n.title?.toLowerCase().includes("mass intention") ||
       n.message?.toLowerCase().includes("mass intention"))
  ).length;

  const [stream, setStream] = useState(null);
  const [showHomeVideo, setShowHomeVideo] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchActiveStream();
  }, []);

  const fetchActiveStream = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/streams/active");
      const activeStream = res.data.stream;

      setStream(activeStream);
      setLikeCount(activeStream.likedBy?.length || 0);
      setComments(activeStream.comments || []);

      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.id;

        const userLiked = activeStream.likedBy?.some(
          (id) => id.toString() === userId
        );

        setLiked(userLiked);
      }
    } catch {
      setStream(null);
      setLikeCount(0);
      setComments([]);
    }
  };

  const getYoutubeId = (url = "") => {
    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.hostname.includes("youtube.com")) {
        return parsedUrl.searchParams.get("v");
      }

      if (parsedUrl.hostname.includes("youtu.be")) {
        return parsedUrl.pathname.replace("/", "");
      }

      return "";
    } catch {
      return "";
    }
  };

  const videoId = getYoutubeId(stream?.url);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : "";

  const handleLike = async () => {
    if (!stream) return;

    try {
      const res = await axios.put(
        `http://localhost:5000/api/streams/${stream._id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch {
      alert("Please log in to like the live mass.");
    }
  };

  const handleAddComment = async () => {
    if (!stream || !commentText.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:5000/api/streams/${stream._id}/comments`,
        { text: commentText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setComments(res.data.comments || []);
      setCommentText("");
    } catch {
      alert("Please log in to comment.");
    }
  };

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <div className="logo-box">
            <span style={{ fontSize: 18, fontWeight: 700 }}>✝</span>
          </div>
          <h2>FaithLink</h2>
        </div>

        <div className="top-icons">
          <button
            className="top-icon-btn"
            onClick={() => navigate("/notifications")}
          >
            <Bell size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="quick-actions">
        <div className="action-item" onClick={() => navigate("/select-service")}>
          <div className="action-icon">
            <Calendar size={24} strokeWidth={1.8} />
          </div>
          <p>Book</p>
        </div>

        <div className="action-item" onClick={() => navigate("/donation")}>
          <div className="action-icon">
            <Heart size={24} strokeWidth={1.8} />
          </div>
          <p>Donate</p>
        </div>

        <div className="action-item" onClick={() => navigate("/live-mass")}>
          <div className="action-icon">
            <Video size={24} strokeWidth={1.8} />
          </div>
          <p>Live Mass</p>
        </div>
        <div className="action-item" onClick={() => navigate("/mass-intentions")}>
          <div style={{ position: "relative", display: "inline-flex" }}>
            <div className="action-icon"><BookMarked size={24} strokeWidth={1.8} /></div>
            {unreadIntentionCount > 0 && (
              <span style={{
                position: "absolute",
                top: -4,
                right: -4,
                background: "#EF4444",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 3px",
                lineHeight: 1,
                pointerEvents: "none",
                boxShadow: "0 0 0 2px #f6f8fc",
              }}>
                {unreadIntentionCount > 9 ? "9+" : unreadIntentionCount}
              </span>
            )}
          </div>
          <p>Intentions</p>
        </div>
      </div>

      <div className="content-card">
        <div className="church-header">
          <div className="church-logo">
            <span style={{ fontSize: 22 }}>✝</span>
          </div>

          <div>
            <h3>Holy Cross Parish</h3>
            <div className="live-meta-row">
  <span className="live-pill">LIVE NOW</span>

  <span className="live-viewers">
    👁 {stream?.viewers || 0} watching
  </span>
</div>

<p className="mass-title">
  {stream?.title || "Sunday Holy Mass"}
</p>
          </div>
        </div>

        <p className="post-text">
          {stream?.description || "Join us for Sunday Holy Mass."}
        </p>

        {!showHomeVideo ? (
          <div
            className="home-video-thumbnail"
            onClick={() => setShowHomeVideo(true)}
          >
            {thumbnailUrl && <img src={thumbnailUrl} alt="Live Mass" />}

            <div className="home-video-overlay">
              <button className="play-btn">
                <Play size={22} fill="white" strokeWidth={0} />
              </button>
              <p>Tap to join live mass</p>
            </div>
          </div>
        ) : (
          <div className="embedded-video-box">
            <iframe
              src={`${stream?.embedUrl}?autoplay=1`}
              title={stream?.title || "Live Mass"}
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
        )}

        <div className="post-actions">
          <button
            type="button"
            className={liked ? "liked-btn" : ""}
            onClick={handleLike}
            disabled={!stream}
          >
            <ThumbsUp size={14} strokeWidth={2} />
            {likeCount > 0
              ? `${likeCount} ${likeCount === 1 ? "Like" : "Likes"}`
              : "Like"}
          </button>

          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            disabled={!stream}
          >
            <MessageCircle size={14} strokeWidth={2} />
            Comment
          </button>

          <button type="button" onClick={() => navigate("/live-mass")}>
            <Video size={14} strokeWidth={2} />
            Watch
          </button>
        </div>

        {showComments && (
          <div className="comments-box">
            {comments.length === 0 ? (
              <p className="no-comments">
                No comments yet. Be the first to comment.
              </p>
            ) : (
              comments.map((comment) => (
                <div className="comment-item" key={comment._id || comment.id}>
                  <strong>{comment.name || "Parishioner"}</strong>
                  <p>{comment.text}</p>
                </div>
              ))
            )}

            <div className="comment-input-row">
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button type="button" onClick={handleAddComment}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

export default Dashboard;