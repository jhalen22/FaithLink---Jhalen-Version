import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { ArrowLeft, Bell } from "lucide-react";
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
    deceasedName: "",
    patientName: "",
    patientAge: "",
    urgencyLevel: "",
    intentionFor: "",
    intentionType: "",
    customIntentionType: "",
    preferredDate: "",
    preferredTime: "",
    address: "",
    message: "",
  });

  const [documents, setDocuments] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setDocuments(Array.from(e.target.files));
  };

  const getFormTitle = () => {
    if (sacramentType === "Mass Intentions") return "Mass Intention Request";
    return `${sacramentType} Booking`;
  };

  const getRequirements = () => {
    switch (sacramentType) {
      case "Wedding":
        return [
          "Marriage License",
          "Baptismal Certificate",
          "Confirmation Certificate of the Groom",
          "Confirmation Certificate of the Bride",
          "Pre-Cana Seminar Certificate",
          "Filled-out Marriage Application Form",
        ];
      case "Baptism":
        return ["Live Birth Certificate"];
      case "Confirmation":
        return ["Live Birth Certificate", "Baptismal Certificate"];
      case "Funeral Mass":
        return ["Death Certificate"];
      default:
        return [];
    }
  };

  const requirements = getRequirements();

  const buildSacramentSpecificData = () => {
    switch (sacramentType) {
      case "Baptism":
        return {
          parentGuardianName: form.fullName,
          childName: form.childName,
          birthDate: form.birthDate,
          parentsName: form.parentsName,
          godparentsName: form.godparentsName,
        };
      case "Confirmation":
        return {
          candidateName: form.candidateName,
          age: form.ageGrade,
          baptismParish: form.baptismParish,
          sponsorName: form.sponsorName,
        };
      case "Wedding":
        return {
          groomName: form.groomName,
          brideName: form.brideName,
        };
      case "Anointing of the Sick":
        return {
          requesterName: form.requesterName,
          patientName: form.patientName,
          patientAge: form.patientAge,
          urgencyLevel: form.urgencyLevel,
        };
      case "Funeral Mass":
        return {
          requesterName: form.requesterName,
          deceasedName: form.deceasedName,
        };
      case "Mass Intentions":
        return {
          requesterName: form.requesterName,
          intentionFor: form.intentionFor,
          intentionType:
            form.intentionType === "Other"
              ? form.customIntentionType
              : form.intentionType,
        };
      default:
        return {};
    }
  };

  const submitBooking = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("sacramentType", sacramentType);
      formData.append("preferredDate", form.preferredDate);
      formData.append("preferredTime", form.preferredTime);
      formData.append("message", form.message);
      formData.append("contactNumber", form.phone);
      formData.append("address", form.address);
      formData.append(
        "sacramentSpecificData",
        JSON.stringify(buildSacramentSpecificData())
      );

      documents.forEach((file) => formData.append("documents", file));

      await axios.post("http://localhost:5000/api/bookings", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="top-actions">
          <button
            className="top-icon-btn"
            onClick={() => navigate("/notifications")}
          >
            <Bell size={18} strokeWidth={2} />
          </button>
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

          {sacramentType === "Funeral Mass" && (
            <>
              <label>Requester's Name</label>
              <input
                name="requesterName"
                placeholder="Name of person making the request"
                value={form.requesterName}
                onChange={handleChange}
              />

              <label>Deceased's Name</label>
              <input
                name="deceasedName"
                placeholder="Full name of the deceased"
                value={form.deceasedName}
                onChange={handleChange}
              />

              <label>Phone</label>
              <input
                name="phone"
                placeholder="+63"
                value={form.phone}
                onChange={handleChange}
              />
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
              >
                <option value="">Select intention type</option>
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

          {requirements.length > 0 && (
            <>
              <label>Upload File</label>

              <div className="requirements-box">
                <h5>Requirements:</h5>
                <ul>
                  {requirements.map((requirement) => (
                    <li key={requirement}>{requirement}</li>
                  ))}
                </ul>
              </div>

              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
              />

              {documents.length > 0 && (
                <p className="selected-file-count">
                  {documents.length} file{documents.length > 1 ? "s" : ""} selected
                </p>
              )}
            </>
          )}

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