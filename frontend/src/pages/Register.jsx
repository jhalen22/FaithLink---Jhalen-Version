import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/Register.module.css";
import { useToast } from "../context/ToastContext";

function Register() {
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    province: "",
    zipCode: "",
    password: "",
    confirmPassword: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      showError("Passwords do not match.");
      return;
    }
    if (!termsAccepted) {
      showWarning("Please accept the Terms of Service and Privacy Policy.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
      });
      showSuccess("Registered successfully!");
      navigate("/");
    } catch (err) {
      showError(err.response?.data?.message || "Error registering");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconCircle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 22V10l9-8 9 8v12H3z" />
              <rect x="9" y="14" width="6" height="8" />
              <path d="M12 2v4M9 6h6" />
            </svg>
          </div>
          <h1 className={styles.headerTitle}>Join Our Parish</h1>
          <p className={styles.headerSubtitle}>
            Create your account to connect with our community
          </p>
        </div>

        <form className={styles.body} onSubmit={handleSubmit}>
          <div className={styles.nameRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>First Name</label>
              <input
                className={styles.input}
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Last Name</label>
              <input
                className={styles.input}
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.leadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 7 10-7" />
              </svg>
              <input
                className={styles.inputWithIcon}
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Phone Number</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.leadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 011 1.18 2 2 0 013 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
              <input
                className={styles.inputWithIcon}
                name="phone"
                type="tel"
                placeholder="+63 912 345 6789"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Street Address</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.leadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <input
                className={styles.inputWithIcon}
                name="streetAddress"
                placeholder="123 Rizal St., Barangay San Jose"
                value={form.streetAddress}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.addressRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>City</label>
              <input
                className={styles.input}
                name="city"
                placeholder="Manila"
                value={form.city}
                onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Province</label>
              <input
                className={styles.input}
                name="province"
                placeholder="Metro Manila"
                value={form.province}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>ZIP Code</label>
            <input
              className={styles.input}
              name="zipCode"
              placeholder="1000"
              value={form.zipCode}
              onChange={handleChange}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.leadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                className={styles.inputWithIconAndEye}
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Confirm Password</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.leadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                className={styles.inputWithIconAndEye}
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <label className={styles.termsLabel}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            I agree to the Terms of Service and Privacy Policy of the parish
          </label>

          <button type="submit" className={styles.submitBtn}>
            Create Account
          </button>

          <p className={styles.signinRow}>
            Already have an account?{" "}
            <button
              type="button"
              className={styles.signinLink}
              onClick={() => navigate("/")}
            >
              Sign in here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
