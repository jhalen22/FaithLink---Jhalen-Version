import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Search, Bell, Droplets, BookOpen, Star, Heart, Activity, BookMarked
} from "lucide-react";
import BottomNav from "../../components/BottomNav";
import "../../styles/Parishioner/Bookings.css";
import "../../styles/Parishioner/SelectService.css";

const services = [
  { name: "Baptism",               subtitle: "Infant & Adult",   icon: Droplets  },
  { name: "First Communion",       subtitle: "Holy Eucharist",   icon: BookOpen  },
  { name: "Confirmation",          subtitle: "Holy Spirit",      icon: Star      },
  { name: "Wedding",               subtitle: "Holy Matrimony",   icon: Heart     },
  { name: "Anointing of the Sick", subtitle: "Healing Prayer",   icon: Activity  },
  { name: "Mass Intentions",       subtitle: "Prayer Offering",  icon: BookMarked },
];

function SelectService() {
  const navigate = useNavigate();

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => navigate("/bookings")}>
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
        </div>
        <div className="top-icons">
          <button className="top-icon-btn" onClick={() => alert("Search feature coming soon")}>
            <Search size={18} strokeWidth={2} />
          </button>
          <button className="top-icon-btn" onClick={() => navigate("/notifications")}>
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
                onClick={() => navigate("/booking-form", { state: { sacramentType: service.name } })}
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
