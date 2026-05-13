import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User, Calendar, Heart, BookOpen, Settings, Bell,
  ChevronRight, LogOut, Clock, GraduationCap, BookMarked
} from "lucide-react";
import BottomNav from "../../components/BottomNav";
import "../../styles/Parishioner/Profile.css";
import NotificationBell from "../../components/NotificationBell";

function Profile() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [stats, setStats] = useState({ bookings: 0, donations: 0, events: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/profile/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (error) {
        console.log("Profile stats error:", error.response?.data || error.message);
      }
    };
    fetchStats();
  }, []);

  const logout = () => { localStorage.clear(); navigate("/"); };

  const fullName =
    localStorage.getItem("fullName") && localStorage.getItem("fullName") !== "undefined"
      ? localStorage.getItem("fullName")
      : role === "priest" ? "Priest Name" : "Parishioner Name";

  const email =
    localStorage.getItem("email") && localStorage.getItem("email") !== "undefined"
      ? localStorage.getItem("email")
      : "user@email.com";

  const parishionerMenu = [
    { icon: User,      label: "Personal Information", sub: "Update your profile details",      path: "/personal-information" },
    { icon: Calendar,  label: "My Bookings",           sub: "View all sacrament bookings",      path: "/bookings" },
    { icon: Heart,     label: "Donation History",      sub: "Track your contributions",         path: "/donation-history" },
    { icon: BookMarked,label: "Mass Intentions",       sub: "View your prayer requests",        path: "/mass-intentions" },
    { icon: Settings,  label: "Settings",              sub: "App preferences & privacy",        path: "/settings" },
    { icon: Bell,      label: "Notifications",         sub: "Manage your alerts",               path: "/notifications" },
  ];

  const priestMenu = [
    { icon: Clock,         label: "Assigned Schedules", sub: "View your mass and parish duties",      path: "/priest-schedules" },
    { icon: GraduationCap, label: "Seminar Schedules",  sub: "View assigned formation sessions",      path: "/priest-seminars" },
    { icon: BookOpen,      label: "Approved Bookings",  sub: "View assigned sacrament bookings",      path: "/priest-bookings" },
    { icon: Bell,          label: "Notifications",      sub: "View reminders from administrator",     path: "/priest-alerts" },
    { icon: Settings,      label: "Settings",           sub: "App preferences & privacy",             path: "/settings" },
  ];

  const menuItems = role === "priest" ? priestMenu : parishionerMenu;

  return (
    <div className="mobile-dashboard">
      {/* ── Gradient header ── */}
      <div className="profile-header">
  <div
    style={{
      width: "100%",
      display: "flex",
      justifyContent: "flex-end",
      paddingRight: "20px",
      marginBottom: "10px",
    }}
  >
    <NotificationBell />
  </div>

  <div className="profile-avatar-wrap">
    <div className="profile-avatar-inner">
      <User size={44} strokeWidth={1.5} color="#5B8DEF" />
    </div>
  </div>

  <h2 className="profile-name">{fullName}</h2>
  <p className="profile-email">{email}</p>
</div>

      {/* ── Stats card (overlaps header) ── */}
      <div className="profile-stats-card">
  <div className="profile-stat">
    <strong>{stats.bookings}</strong>
    <span>{role === "priest" ? "Schedules" : "Bookings"}</span>
  </div>

  {role !== "priest" && (
    <>
      <div className="profile-stat-divider" />
      <div className="profile-stat">
        <strong>₱{stats.donations}</strong>
        <span>Donations</span>
      </div>
    </>
  )}

  <div className="profile-stat-divider" />

  <div className="profile-stat">
    <strong>{stats.events}</strong>
    <span>Events</span>
  </div>
</div>

      {/* ── Menu ── */}
      <div className="profile-menu">
        {menuItems.map(({ icon: Icon, label, sub, path }) => (
          <div className="profile-row" key={path} onClick={() => navigate(path)}>
            <div className="profile-icon-circle">
              <Icon size={20} strokeWidth={1.8} color="#5B8DEF" />
            </div>
            <div className="profile-row-text">
              <h4>{label}</h4>
              <p>{sub}</p>
            </div>
            <ChevronRight size={18} strokeWidth={2.5} color="#D4A95A" />
          </div>
        ))}
      </div>

      {/* ── Logout ── */}
      <div className="profile-logout-wrap">
        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} strokeWidth={2} />
          Logout
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

export default Profile;
