import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { useToast } from "../../context/ToastContext";

function PersonalInformation() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const goBack = (fallback = "/dashboard") => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallback);
  };

  const [form, setForm] = useState({
    fullName: localStorage.getItem("fullName") || "",
    email: localStorage.getItem("email") || "",
    role: localStorage.getItem("role") || "parishioner",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        "http://localhost:5000/api/auth/profile",
        {
          fullName: form.fullName,
          email: form.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem("fullName", res.data.user.fullName);
      localStorage.setItem("email", res.data.user.email);

      showSuccess("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      showError(err.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="mobile-dashboard">
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => goBack("/profile")}>
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h2>Personal Information</h2>
        </div>
      </div>

      <form className="donation-card" onSubmit={updateProfile}>
        <h3>Edit Profile</h3>

        <label>Full Name</label>
        <input
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Enter full name"
        />

        <label>Email Address</label>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter email address"
        />

        <label>Role</label>
        <input value={form.role} disabled />

        <button className="gradient-btn" type="submit">
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default PersonalInformation;