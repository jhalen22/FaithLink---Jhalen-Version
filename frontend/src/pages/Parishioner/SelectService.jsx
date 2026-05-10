import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Bell, Droplets, BookOpen, Star, Heart, Activity
} from "lucide-react";
import BottomNav from "../../components/BottomNav";
import "../../styles/Parishioner/Bookings.css";
import "../../styles/Parishioner/SelectService.css";

// Mass Intentions is intentionally excluded — it is accessed from the
// dashboard Intentions quick-action, not through Select a Service.
const services = [
  { name: "Baptism",               subtitle: "Infant & Adult",   icon: Droplets },
  { name: "Funeral Mass",          subtitle: "Funeral Service",  icon: BookOpen },
  { name: "Confirmation",          subtitle: "Holy Spirit",      icon: Star     },
  { name: "Wedding",               subtitle: "Holy Matrimony",   icon: Heart    },
  { name: "Anointing of the Sick", subtitle: "Healing Prayer",   icon: Activity },
];

function SelectService() {
  const navigate = useNavigate();
  const goBack = (fallback = "/dashboard") => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback);
  };

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => goBack("/bookings")}>
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
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

      <div className="service-page">
        <h2>Select a Service</h2>
        <p className="service-description">
          Choose the sacrament or mass intention you would like to book.
          Our parish coordinator will review and confirm your request.
        </p>

        <div className="service-grid">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.name}
                className="service-card"
                onClick={() =>
                  navigate("/booking-form", {
                    state: { sacramentType: service.name },
                  })
                }
              >
                <div className="service-icon">
                  <Icon size={26} strokeWidth={1.8} color="white" />
                </div>

                <div className="service-card-text">
                  <h3>{service.name}</h3>
                  <p>{service.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default SelectService;
