import { useState } from "react";
import axios from "axios";

function Dashboard() {
  const [form, setForm] = useState({
    sacramentType: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createBooking = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/bookings",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Booking created!");
    } catch (err) {
      alert("Error creating booking");
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>

      <form onSubmit={createBooking}>
        <input
          name="sacramentType"
          placeholder="Sacrament Type"
          onChange={handleChange}
        />

        <input
          name="preferredDate"
          type="date"
          onChange={handleChange}
        />

        <input
          name="preferredTime"
          type="time"
          onChange={handleChange}
        />

        <input
          name="message"
          placeholder="Message"
          onChange={handleChange}
        />

        <button type="submit">Create Booking</button>
      </form>
    </div>
  );
}

export default Dashboard;