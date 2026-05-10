import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { ArrowLeft, Search, Bell } from "lucide-react";
import "../../styles/Parishioner/Bookings.css";

function BookingForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = (fallback = "/dashboard") => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback);
  };

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

  // Allowed Mass Intention times stored in 24-hour "HH:MM" format (same as the rest of the app).
  const MASS_TIMES_WEEKDAY = ["06:00", "18:00"];
  const MASS_TIMES_SUNDAY  = ["06:00", "08:00", "09:30", "16:30", "18:00"];

  const getMassTimesForDate = (dateStr) => {
    if (!dateStr) return [];
    // Parse as local midnight to avoid UTC-vs-local day-of-week mismatch.
    const [y, m, d] = dateStr.split("-").map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay(); // 0 = Sunday
    return dayOfWeek === 0 ? MASS_TIMES_SUNDAY : MASS_TIMES_WEEKDAY;
  };

  const formatMassTime = (time24) => {
    const [h, min] = time24.split(":");
    const hour = parseInt(h, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    const display = hour % 12 || 12;
    return `${display}:${min} ${suffix}`;
  };

  const getTodayDateString = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // When the date changes for a Mass Intention, reset preferredTime if it is
    // no longer valid for the newly selected day of the week.
    if (sacramentType === "Mass Intentions" && name === "preferredDate") {
      const allowed = getMassTimesForDate(value);
      setForm({
        ...form,
        preferredDate: value,
        preferredTime: allowed.includes(form.preferredTime) ? form.preferredTime : "",
      });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setDocuments(Array.from(e.target.files));
  };

  const getFormTitle = () => {
    if (sacramentType === "Mass Intentions") return "Mass Intention Request";
    return `${sacramentType} Booking`;
  };

  // Returns a clean object with only the fields relevant to this sacrament.
  // This replaces the old buildMessage() approach that packed everything into one string.
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
      case "First Communion":
        return {
          parentGuardianName: form.fullName,
          childName: form.childName,
          ageGrade: form.ageGrade,
          baptismParish: form.baptismParish,
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
      case "Funeral Blessing":
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

    if (sacramentType === "Mass Intentions") {
      if (!form.preferredDate) {
        alert("Please select a date for your Mass Intention.");
        return;
      }
      if (form.preferredDate < getTodayDateString()) {
        alert("The selected date is in the past. Please choose today or a future date.");
        return;
      }
      if (!form.preferredTime) {
        alert("Please select a Preferred Mass Time.");
        return;
      }
      const allowed = getMassTimesForDate(form.preferredDate);
      if (!allowed.includes(form.preferredTime)) {
        alert("The selected Mass time is not valid for the chosen date. Please select an allowed time.");
        return;
      }
    }

    try {
      const token = localStorage.getItem("token");

      // Use FormData so document files can be sent alongside text fields.
      // The backend uses multer which requires multipart/form-data.
      const formData = new FormData();
      formData.append("sacramentType", sacramentType);
      formData.append("preferredDate", form.preferredDate);
      formData.append("preferredTime", form.preferredTime);
      formData.append("message", form.message);
      formData.append("contactNumber", form.phone);
      formData.append("address", form.address);
      // Serialize the structured object as JSON; the backend will parse it.
      formData.append(
        "sacramentSpecificData",
        JSON.stringify(buildSacramentSpecificData())
      );

      documents.forEach((file) => formData.append("documents", file));

      await axios.post("http://localhost:5000/api/bookings", formData, {
        headers: { Authorization: `Bearer ${token}` },
        // Do NOT set Content-Type manually — axios sets the multipart boundary automatically.
      });

      alert("Booking submitted successfully!");
      navigate(sacramentType === "Mass Intentions" ? "/mass-intentions" : "/bookings");
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
            onClick={() => goBack(sacramentType === "Mass Intentions" ? "/mass-intentions" : "/select-service")}
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="top-actions">
          <button className="top-icon-btn" onClick={() => alert("Search coming soon")}>
            <Search size={18} strokeWidth={2} />
          </button>
          <button className="top-icon-btn" onClick={() => navigate("/notifications")}>
            <Bell size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="booking-form-page">
        <h2>{getFormTitle()}</h2>

        <form className="full-booking-form" onSubmit={submitBooking}>

          {/* ── Baptism ── */}
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

          {/* ── First Communion ── */}
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

          {/* ── Confirmation ── */}
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

          {/* ── Wedding ── */}
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

          {/* ── Anointing of the Sick ── */}
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

          {/* ── Funeral Blessing ── */}
          {sacramentType === "Funeral Blessing" && (
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

          {/* ── Mass Intentions ── */}
          {sacramentType === "Mass Intentions" && (
            <>
              <label>Requester's Name</label>
              <input
                name="requesterName"
                placeholder="Enter your full name"
                value={form.requesterName}
                onChange={handleChange}
              />

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

          {/* ── Common fields ── */}
          <div className="two-grid">
            <div>
              <label>Preferred Date</label>
              <input
                name="preferredDate"
                type="date"
                value={form.preferredDate}
                onChange={handleChange}
                min={sacramentType === "Mass Intentions" ? getTodayDateString() : undefined}
              />
            </div>
            <div>
              <label>
                {sacramentType === "Mass Intentions" ? "Preferred Mass Time" : "Preferred Time"}
              </label>

              {sacramentType === "Mass Intentions" ? (
                <select
                  name="preferredTime"
                  value={form.preferredTime}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    {form.preferredDate ? "Select time" : "Select date first"}
                  </option>
                  {getMassTimesForDate(form.preferredDate).map((t) => (
                    <option key={t} value={t}>
                      {formatMassTime(t)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name="preferredTime"
                  type="time"
                  value={form.preferredTime}
                  onChange={handleChange}
                />
              )}
            </div>
          </div>

          {sacramentType !== "Mass Intentions" && (
            <>
              <label>Complete Address</label>
              <input
                name="address"
                placeholder="Street, Barangay, City"
                value={form.address}
                onChange={handleChange}
              />
            </>
          )}

          <label>Special Notes</label>
          <textarea
            name="message"
            placeholder="Any requests or notes"
            value={form.message}
            onChange={handleChange}
          />

          {/* ── Supporting documents — hidden for services that don't need uploads ── */}
          {sacramentType !== "Anointing of the Sick" &&
           sacramentType !== "Mass Intentions" && (
            <>
              <label>
                {sacramentType === "Baptism"
                  ? "Upload Birth Certificate"
                  : sacramentType === "First Communion"
                  ? "Upload Baptism Certificate"
                  : "Supporting Documents (optional)"}
              </label>

              {(sacramentType === "Baptism" || sacramentType === "First Communion") && (
                <p style={{ fontSize: "12px", color: "var(--muted)", margin: "-6px 0 2px", textAlign: "left" }}>
                  {sacramentType === "Baptism"
                    ? "Please upload a copy of the child's birth certificate."
                    : "Please upload a copy of the baptism certificate."}
                </p>
              )}

              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileChange}
              />
              {documents.length > 0 && (
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "4px 0 0", textAlign: "left" }}>
                  {documents.length} file{documents.length > 1 ? "s" : ""} selected
                </p>
              )}
            </>
          )}

          <div className="form-buttons">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => goBack(sacramentType === "Mass Intentions" ? "/mass-intentions" : "/bookings")}
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
