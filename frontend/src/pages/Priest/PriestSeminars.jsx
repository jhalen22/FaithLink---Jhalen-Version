import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, GraduationCap, CalendarDays, Clock3, MapPin, CheckCircle2 } from "lucide-react";
import BottomNav from "../../components/BottomNav";
import "../../styles/Priest/PriestDashboard.css";

// Static demo data — no backend model for seminars yet
const SEMINARS = [
  {
    id: 1,
    title:    "Marriage Seminar",
    date:     "May 14, 2026",
    time:     "1:00 PM",
    location: "Parish Hall",
  },
  {
    id: 2,
    title:    "Baptism Orientation",
    date:     "May 18, 2026",
    time:     "9:00 AM",
    location: "Catechism Room",
  },
];

function PriestSeminars() {
  const navigate = useNavigate();

  const handleAcknowledge = (title) => {
    alert(`Schedule acknowledged: ${title}`);
  };

  return (
    <div className="mobile-dashboard">
      {/* ── Top bar ── */}
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => navigate("/priest-dashboard")}>
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h2>Seminars</h2>
        </div>
        <div className="top-actions">
          <button className="top-icon-btn" onClick={() => navigate("/priest-alerts")}>
            <Bell size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── Content card ── */}
      <div className="content-card" style={{ marginBottom: "calc(var(--nav-h) + 14px)" }}>
        <div className="church-header">
          <div className="church-logo">
            <GraduationCap size={22} strokeWidth={1.8} />
          </div>
          <div>
            <h3>Seminar Schedules</h3>
            <p>Assigned formation duties</p>
          </div>
        </div>

        <div className="priest-schedule-list">
          {SEMINARS.map((s) => (
            <div className="priest-schedule-card" key={s.id}>
              <h4>{s.title}</h4>
              <p><CalendarDays size={14} strokeWidth={2} />{s.date}</p>
              <p><Clock3 size={14} strokeWidth={2} />{s.time}</p>
              <p><MapPin size={14} strokeWidth={2} />{s.location}</p>
              <button onClick={() => handleAcknowledge(s.title)}>
                <CheckCircle2 size={14} strokeWidth={2.5} style={{ marginRight: 6, verticalAlign: "middle" }} />
                Acknowledge Schedule
              </button>
            </div>
          ))}
        </div>
      </div>

      <BottomNav type="priest" />
    </div>
  );
}

export default PriestSeminars;
