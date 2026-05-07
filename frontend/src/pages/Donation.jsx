import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Donation.css";

function Donation() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState("GCash");
  const [receipt, setReceipt] = useState(null);

  const [form, setForm] = useState({
    amount: "",
    purpose: "",
    otherPurpose: "",
    name: "",
    email: "",
    phone: "",
    message: "",
    referenceCode: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const finalPurpose =
    form.purpose === "Others" ? form.otherPurpose : form.purpose;

  const submitDonation = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("amount", form.amount);
      formData.append("purpose", finalPurpose);
      formData.append("method", method);
      formData.append("referenceCode", form.referenceCode);
      formData.append("message", form.message);

      if (receipt) {
        formData.append("receipt", receipt);
      }

      const res = await axios.post(
        "http://localhost:5000/api/donations",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(res.data);
      alert("Donation submitted for admin verification.");
      navigate("/profile");
    } catch (err) {
      console.log("Donation error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to submit donation");
    }
  };

  return (
    <div className="donation-screen">
      <div className="donation-header">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ←
        </button>

        <div className="donation-heart">♡</div>
        <h2>Make a Donation</h2>
        <p>Support our parish and community</p>

        <div className="stepper">
          <span className={step >= 1 ? "active-step" : ""}>1</span>
          <div></div>
          <span className={step >= 2 ? "active-step" : ""}>2</span>
          <div></div>
          <span className={step >= 3 ? "active-step" : ""}>3</span>
        </div>
      </div>

      {step === 1 && (
        <div className="donation-card">
          <h3>Donation Details</h3>

          <label>Donation Amount (PHP)</label>
          <input
            name="amount"
            type="number"
            placeholder="1000"
            value={form.amount}
            onChange={handleChange}
          />

          <label>Purpose of Donation</label>
          <select name="purpose" value={form.purpose} onChange={handleChange}>
            <option value="">Select purpose</option>
            <option value="Church Maintenance">Church Maintenance</option>
            <option value="Mass Offering">Mass Offering</option>
            <option value="Charity">Charity</option>
            <option value="Sacrament Donation">Sacrament Donation</option>
            <option value="Others">Others</option>
          </select>

          {form.purpose === "Others" && (
            <>
              <label>Please specify</label>
              <input
                name="otherPurpose"
                placeholder="Enter donation purpose"
                value={form.otherPurpose}
                onChange={handleChange}
              />
            </>
          )}

          <label>Your Name</label>
          <input
            name="name"
            placeholder="Enter your full name"
            value={form.name}
            onChange={handleChange}
          />

          <label>Email Address</label>
          <input
            name="email"
            placeholder="you@email.com"
            value={form.email}
            onChange={handleChange}
          />

          <label>Phone Number</label>
          <input
            name="phone"
            placeholder="09XXXXXXXXX"
            value={form.phone}
            onChange={handleChange}
          />

          <label>Message (Optional)</label>
          <textarea
            name="message"
            placeholder="Add a special message or prayer intention"
            value={form.message}
            onChange={handleChange}
          />

          <button className="gradient-btn" onClick={() => setStep(2)}>
            Continue to Payment
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="donation-card">
          <button className="plain-back" onClick={() => setStep(1)}>
            ← Back
          </button>

          <h3>Select Donation Method</h3>

          <div
            className={`payment-method ${method === "GCash" ? "selected" : ""}`}
            onClick={() => setMethod("GCash")}
          >
            <div className="method-icon">▯</div>
            <div>
              <strong>GCash</strong>
              <p>09123456789</p>
            </div>
            <span>{method === "GCash" ? "✓" : ""}</span>
          </div>

          <div
            className={`payment-method ${method === "Maya" ? "selected" : ""}`}
            onClick={() => setMethod("Maya")}
          >
            <div className="method-icon green">▯</div>
            <div>
              <strong>Maya</strong>
              <p>09187654321</p>
            </div>
            <span>{method === "Maya" ? "✓" : ""}</span>
          </div>

          <div className="payment-info">
            <h4>Payment Information</h4>

            <div className="qr-display">▦</div>
            <p className="scan-text">Scan QR code to pay</p>

            <div className="wallet-row">
              <div>
                <small>Wallet Number</small>
                <strong>{method === "GCash" ? "09123456789" : "09187654321"}</strong>
              </div>
              <button type="button">Copy</button>
            </div>

            <div className="amount-box">
              <small>Amount to Pay</small>
              <h3>₱{form.amount || "0"}</h3>
            </div>
          </div>

          <button className="gradient-btn" onClick={() => setStep(3)}>
            Continue to Upload Receipt
          </button>
        </div>
      )}

      {step === 3 && (
        <form className="donation-card" onSubmit={submitDonation}>
          <button type="button" className="plain-back" onClick={() => setStep(2)}>
            ← Back
          </button>

          <h3>Upload Proof of Donation</h3>

          <div className="summary-box">
            <h4>Donation Summary</h4>
            <p>
              <span>Amount:</span> ₱{form.amount}
            </p>
            <p>
              <span>Purpose:</span> {finalPurpose}
            </p>
            <p>
              <span>Payment Method:</span> {method}
            </p>
          </div>

          <label>Reference Code</label>
          <input
            name="referenceCode"
            placeholder="Enter transaction reference code"
            value={form.referenceCode}
            onChange={handleChange}
          />

          <label className="upload-box">
            ⬆
            <strong>{receipt ? receipt.name : "Click to upload receipt"}</strong>
            <small>PNG, JPG up to 5MB</small>

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setReceipt(e.target.files[0])}
            />
          </label>

          <div className="warning-box">
            <strong>Important:</strong> Please upload a clear screenshot of your donation confirmation.
          </div>

          <button className="submit-donation-btn" type="submit">
            Submit Donation
          </button>
        </form>
      )}
    </div>
  );
}

export default Donation;