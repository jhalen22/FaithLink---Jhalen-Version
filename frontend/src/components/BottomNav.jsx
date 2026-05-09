import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, BookOpen, Video, User, Clock, GraduationCap, Bell } from "lucide-react";

const PARISHIONER_TABS = [
  { icon: Home,         label: "Home",     path: "/dashboard" },
  { icon: Calendar,     label: "Events",   path: "/events" },
  { icon: BookOpen,     label: "Bookings", path: "/bookings" },
  { icon: Video,        label: "Live",     path: "/live-mass" },
  { icon: User,         label: "Profile",  path: "/profile" },
];

const PRIEST_TABS = [
  { icon: Home,          label: "Home",      path: "/priest-dashboard" },
  { icon: Clock,         label: "Schedules", path: "/priest-schedules" },
  { icon: GraduationCap, label: "Seminars",  path: "/priest-seminars" },
  { icon: Bell,          label: "Alerts",    path: "/priest-alerts" },
  { icon: User,          label: "Profile",   path: "/profile" },
];

export default function BottomNav({ type }) {
  const navigate = useNavigate();
  const location = useLocation();

  const role = type || localStorage.getItem("role");
  const tabs = role === "priest" ? PRIEST_TABS : PARISHIONER_TABS;

  return (
    <nav className="bottom-nav-bar">
      {tabs.map(({ icon: Icon, label, path }) => {
        const active = location.pathname === path;
        return (
          <button
            key={path}
            className={`nav-tab${active ? " nav-tab-active" : ""}`}
            onClick={() => navigate(path)}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
