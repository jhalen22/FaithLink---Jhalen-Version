import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, BookOpen, Video, User, Clock, GraduationCap, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const PARISHIONER_TABS = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Calendar, label: "Events", path: "/events" },
  { icon: BookOpen, label: "Bookings", path: "/bookings" },
  { icon: Video, label: "Live", path: "/live-mass" },
  { icon: User, label: "Profile", path: "/profile" },
];

const PRIEST_TABS = [
  { icon: Home, label: "Home", path: "/priest-dashboard" },
  { icon: Clock, label: "Schedules", path: "/priest-schedules" },
  { icon: Bell, label: "Alerts", path: "/priest-alerts" },
  { icon: User, label: "Profile", path: "/profile" },
];

export default function BottomNav({ type }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLive, setIsLive] = useState(false);

  const role = type || localStorage.getItem("role");
  const tabs = role === "priest" ? PRIEST_TABS : PARISHIONER_TABS;

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/livestream")
      .then((res) => setIsLive(res.data.stream?.status === "live"))
      .catch(() => setIsLive(false));
  }, []);

  return (
    <nav className="bottom-nav-bar">
      {tabs.map(({ icon: Icon, label, path }) => {
        const active = location.pathname === path;
        const showLiveBadge = label === "Live" && isLive;

        return (
          <button
            key={path}
            className={`nav-tab${active ? " nav-tab-active" : ""}`}
            onClick={() => navigate(path)}
            style={{ position: "relative" }}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />

            {showLiveBadge && (
              <span
                style={{
                  position: "absolute",
                  top: 4,
                  right: 18,
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "#ef4444",
                  boxShadow: "0 0 0 3px rgba(239,68,68,0.2)",
                }}
              />
            )}

            <span>{showLiveBadge ? "Live •" : label}</span>
          </button>
        );
      })}
    </nav>
  );
}