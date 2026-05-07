import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "../../styles/Parishioner/Bookings.css";

function BookingForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const sacramentType = location.state?.sacramentType || "Sacrament";

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    childName: "",
    birthDate: "",
    parentsName: "",
    godparentsName: "",
    ageGrade: "",
    baptismParish: "",
    candidateName: "",
    sponsorName: "",
    groomName: "",
    brideName: "",
    requesterName: "",
    patientName: "",
    patientAge: "",
    urgencyLevel: "",
    intentionFor: "",
    intentionType: "",
    preferredDate: "",
    preferredTime: "",
    address: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const getFormTitle = () => {
    if (sacramentType === "Mass Intentions") return "Mass Intention Request";
    return `${sacramentType} Booking`;
  };

  const buildMessage = () => {
  const lines = [];

  const addLine = (label, value) => {
    if (value && value.trim() !== "") {
      lines.push(`${label}: ${value}`);
    }
  };

  addLine("Service Type", sacramentType);

  if (sacramentType === "Baptism") {
    addLine("Parent/Guardian Name", form.fullName);
    addLine("Email", form.email);
    addLine("Phone", form.phone);
    addLine("Child's Name", form.childName);
    addLine("Birth Date", form.birthDate);
    addLine("Parents' Names", form.parentsName);
    addLine("Godparents' Names", form.godparentsName);
  }

  if (sacramentType === "First Communion") {
    addLine("Parent/Guardian Name", form.fullName);
    addLine("Email", form.email);
    addLine("Phone", form.phone);
    addLine("Child's Name", form.childName);
    addLine("Age/Grade Level", form.ageGrade);
    addLine("Baptism Parish", form.baptismParish);
  }

  if (sacramentType === "Confirmation") {
    addLine("Candidate Name", form.candidateName);
    addLine("Email", form.email);
    addLine("Phone", form.phone);
    addLine("Age", form.ageGrade);
    addLine("Baptism Parish", form.baptismParish);
    addLine("Sponsor Name", form.sponsorName);
  }

  if (sacramentType === "Wedding") {
    addLine("Groom's Name", form.groomName);
    addLine("Bride's Name", form.brideName);
    addLine("Email", form.email);
    addLine("Phone", form.phone);
  }

  if (sacramentType === "Anointing of the Sick") {
    addLine("Requester's Name", form.requesterName);
    addLine("Patient's Name", form.patientName);
    addLine("Patient's Age", form.patientAge);
    addLine("Phone", form.phone);
    addLine("Urgency Level", form.urgencyLevel);
  }

  if (sacramentType === "Mass Intentions") {
    addLine("Requester's Name", form.requesterName);
    addLine("Email", form.email);
    addLine("Phone", form.phone);
    addLine("Intention For", form.intentionFor);
    addLine(
      "Intention Type",
      form.intentionType === "Other"
        ? form.customIntentionType
        : form.intentionType
    );
  }

  addLine("Address", form.address);
  addLine("Notes", form.message);

  return lines.join("\n");
};

  const submitBooking = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/bookings",
        {
          sacramentType,
          preferredDate: form.preferredDate,
          preferredTime: form.preferredTime,
          message: buildMessage(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Booking submitted successfully!");
      navigate("/bookings");
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <button
            className="back-btn"
            onClick={() => navigate("/select-service")}
          >
            ←
          </button>
        </div>

        <div className="top-icons">
            <span onClick={() => alert("Search feature coming soon")}>🔍</span>
            <span onClick={() => alert("No new notifications")}>🔔</span>
        </div>
      </div>

      <div className="booking-form-page">
        <h2>{getFormTitle()}</h2>

        <form className="full-booking-form" onSubmit={submitBooking}>
          {sacramentType === "Baptism" && (
            <>
              <label>Parent / Guardian Full Name</label>
              <input
                name="fullName"
                placeholder="Enter parent or guardian name"
                value={form.fullName}
                onChange={handleChange}
              />

              <div className="two-grid">
                <div>
                  <label>Email</label>
                  <input
                    name="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Phone</label>
                  <input
                    name="phone"
                    placeholder="+63"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <label>Child's Name</label>
              <input
                name="childName"
                placeholder="Name of child to be baptized"
                value={form.childName}
                onChange={handleChange}
              />

              <label>Birth Date</label>
              <input
                name="birthDate"
                type="date"
                value={form.birthDate}
                onChange={handleChange}
              />

              <label>Parents' Names</label>
              <input
                name="parentsName"
                placeholder="Father and mother's name"
                value={form.parentsName}
                onChange={handleChange}
              />

              <label>Godparents' Names</label>
              <input
                name="godparentsName"
                placeholder="Godparents' names"
                value={form.godparentsName}
                onChange={handleChange}
              />
            </>
          )}

          {sacramentType === "First Communion" && (
            <>
              <label>Parent / Guardian Full Name</label>
              <input
                name="fullName"
                placeholder="Enter parent or guardian name"
                value={form.fullName}
                onChange={handleChange}
              />

              <div className="two-grid">
                <div>
                  <label>Email</label>
                  <input
                    name="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Phone</label>
                  <input
                    name="phone"
                    placeholder="+63"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <label>Child's Name</label>
              <input
                name="childName"
                placeholder="Name of child for First Communion"
                value={form.childName}
                onChange={handleChange}
              />

              <label>Age / Grade Level</label>
              <input
                name="ageGrade"
                placeholder="Example: Grade 3 / 9 years old"
                value={form.ageGrade}
                onChange={handleChange}
              />

              <label>Baptism Parish</label>
              <input
                name="baptismParish"
                placeholder="Parish where the child was baptized"
                value={form.baptismParish}
                onChange={handleChange}
              />
            </>
          )}

          {sacramentType === "Confirmation" && (
            <>
              <label>Candidate Name</label>
              <input
                name="candidateName"
                placeholder="Name of person to be confirmed"
                value={form.candidateName}
                onChange={handleChange}
              />

              <div className="two-grid">
                <div>
                  <label>Email</label>
                  <input
                    name="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Phone</label>
                  <input
                    name="phone"
                    placeholder="+63"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <label>Age</label>
              <input
                name="ageGrade"
                placeholder="Enter age"
                value={form.ageGrade}
                onChange={handleChange}
              />

              <label>Baptism Parish</label>
              <input
                name="baptismParish"
                placeholder="Parish where candidate was baptized"
                value={form.baptismParish}
                onChange={handleChange}
              />

              <label>Sponsor Name</label>
              <input
                name="sponsorName"
                placeholder="Confirmation sponsor name"
                value={form.sponsorName}
                onChange={handleChange}
              />
            </>
          )}

          {sacramentType === "Wedding" && (
            <>
              <label>Groom's Name</label>
              <input
                name="groomName"
                placeholder="Enter groom's full name"
                value={form.groomName}
                onChange={handleChange}
              />

              <label>Bride's Name</label>
              <input
                name="brideName"
                placeholder="Enter bride's full name"
                value={form.brideName}
                onChange={handleChange}
              />

              <div className="two-grid">
                <div>
                  <label>Email</label>
                  <input
                    name="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Phone</label>
                  <input
                    name="phone"
                    placeholder="+63"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          {sacramentType === "Anointing of the Sick" && (
            <>
              <label>Requester's Name</label>
              <input
                name="requesterName"
                placeholder="Name of person making the request"
                value={form.requesterName}
                onChange={handleChange}
              />

              <label>Patient's Name</label>
              <input
                name="patientName"
                placeholder="Name of sick person"
                value={form.patientName}
                onChange={handleChange}
              />

              <div className="two-grid">
                <div>
                  <label>Patient Age</label>
                  <input
                    name="patientAge"
                    placeholder="Age"
                    value={form.patientAge}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Phone</label>
                  <input
                    name="phone"
                    placeholder="+63"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <label>Urgency Level</label>
              <select
                name="urgencyLevel"
                value={form.urgencyLevel}
                onChange={handleChange}
              >
                <option value="">Select urgency</option>
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Emergency">Emergency</option>
              </select>
            </>
          )}

          {sacramentType === "Mass Intentions" && (
            <>
              <label>Requester's Name</label>
              <input
                name="requesterName"
                placeholder="Enter your full name"
                value={form.requesterName}
                onChange={handleChange}
              />

              <div className="two-grid">
                <div>
                  <label>Email</label>
                  <input
                    name="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Phone</label>
                  <input
                    name="phone"
                    placeholder="+63"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <label>Intention For</label>
              <input
                name="intentionFor"
                placeholder="Name of person or family"
                value={form.intentionFor}
                onChange={handleChange}
              />

              <label>Intention Type</label>
                <select
                name="intentionType"
                value={form.intentionType}
                onChange={handleChange}
>               <option value="">Select intention type</option>
                <option value="Thanksgiving">Thanksgiving</option>
                <option value="Healing">Healing</option>
                <option value="Birthday">Birthday</option>
                <option value="Death Anniversary">Death Anniversary</option>
                <option value="Special Intention">Special Intention</option>
                <option value="Other">Other</option>
                </select>

{form.intentionType === "Other" && (
  <>
    <label>Specify Intention Type</label>

    <input
      name="customIntentionType"
      placeholder="Enter custom intention type"
      value={form.customIntentionType || ""}
      onChange={handleChange}
    />
  </>
)}
            </>
          )}

          <div className="two-grid">
            <div>
              <label>Preferred Date</label>
              <input
                name="preferredDate"
                type="date"
                value={form.preferredDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Preferred Time</label>
              <input
                name="preferredTime"
                type="time"
                value={form.preferredTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <label>Complete Address</label>
          <input
            name="address"
            placeholder="Street, Barangay, City"
            value={form.address}
            onChange={handleChange}
          />

          <label>Special Notes</label>
          <textarea
            name="message"
            placeholder="Any requests or notes"
            value={form.message}
            onChange={handleChange}
          />

          <div className="form-buttons">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/bookings")}
            >
              Cancel
            </button>

            <button type="submit" className="submit-btn">
              Submit Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookingForm;