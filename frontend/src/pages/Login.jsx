import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/Login.module.css";
import { useToast } from "../context/ToastContext";

function Login() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("fullName", res.data.user.fullName);
      localStorage.setItem("email", res.data.user.email);
      localStorage.setItem("role", res.data.user.role);

      showSuccess("Login successful!");

      if (res.data.user.role === "priest") {
        navigate("/priest-dashboard");
      } else if (res.data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Invalid credentials");
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
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="10" y1="4" x2="14" y2="4" />
            </svg>
          </div>
          <h2 className={styles.headerTitle}>FaithLink</h2>
        </div>

        <form className={styles.body} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Username or Email</label>
            <div className={styles.inputWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                className={styles.input}
                type="text"
                name="email"
                placeholder="Enter your username or email"
                value={form.email}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                className={styles.input}
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                style={{ paddingRight: "38px" }}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className={styles.row}>
            <label className={styles.checkLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <button
              type="button"
              className={styles.forgotLink}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className={styles.submitBtn}>
            Sign In
          </button>

          <p className={styles.registerRow}>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className={styles.registerLink}
              onClick={() => navigate("/register")}
            >
              Register here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
