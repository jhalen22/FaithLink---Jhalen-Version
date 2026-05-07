import { useNavigate } from "react-router-dom";
import "../../styles/Parishioner/Bookings.css";

function SelectService() {
  const navigate = useNavigate();

  const services = [
    {
      name: "Baptism",
      subtitle: "Infant & Adult",
      icon: "💧",
    },
    {
      name: "First Communion",
      subtitle: "Holy Eucharist",
      icon: "📦",
    },
    {
      name: "Confirmation",
      subtitle: "Holy Spirit",
      icon: "✝️",
    },
    {
      name: "Wedding",
      subtitle: "Holy Matrimony",
      icon: "⛪",
    },
    {
      name: "Anointing of the Sick",
      subtitle: "Healing Prayer",
      icon: "🕊️",
    },
    {
      name: "Mass Intentions",
      subtitle: "Prayer Offering",
      icon: "🙏",
    },
  ];

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <button
            className="back-btn"
            onClick={() => navigate("/bookings")}
          >
            ←
          </button>
        </div>

        <div className="top-icons">
         <span onClick={() => alert("Search feature coming soon")}>🔍</span>
         <span onClick={() => alert("No new notifications")}>🔔</span>
        </div>
      </div>

      <div className="service-page">
        <h2>Select a Service</h2>

        <p className="service-description">
          Choose the sacrament or mass intention you would like to book.
          Our parish coordinator will review and confirm your request.
        </p>

        <div className="service-grid">
          {services.map((service, index) => (
            <div
              key={index}
              className="service-card"
              onClick={() =>
                navigate("/booking-form", {
                  state: {
                    sacramentType: service.name,
                  },
                })
              }
            >
              <div className="service-icon">
                {service.icon}
              </div>

              <h3>{service.name}</h3>
              <p>{service.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom-nav">
  <div onClick={() => navigate("/dashboard")}>
    🏠
    <p>Home</p>
  </div>

  <div>
    📅
    <p>Events</p>
  </div>

  <div onClick={() => navigate("/bookings")}>
    📝
    <p>Bookings</p>
  </div>

  <div onClick={() => navigate("/live-mass")}>
    📺
    <p>Live</p>
  </div>

  <div onClick={() => navigate("/profile")}>
    👤
    <p>Profile</p>
  </div>
</div>
    </div>
  );
}

export default SelectService;