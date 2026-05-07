import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import SelectService from "./pages/SelectService";
import BookingForm from "./pages/BookingForm";
import Donation from "./pages/Donation";
import Profile from "./pages/Profile";
import Events from "./pages/Events";
import LiveMass from "./pages/LiveMass";
import PriestDashboard from "./pages/PriestDashboard";
import PriestSchedules from "./pages/PriestSchedules";
import PriestSeminars from "./pages/PriestSeminars";
import PriestBookings from "./pages/PriestBookings";
import PriestAlerts from "./pages/PriestAlerts";
import PersonalInformation from "./pages/PersonalInformation";
import DonationHistory from "./pages/DonationHistory";
import MassIntentions from "./pages/MassIntentions";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/select-service" element={<SelectService />} />
        <Route path="/booking-form" element={<BookingForm />} />
        <Route path="/donation" element={<Donation />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/events" element={<Events />} />
        <Route path="/live-mass" element={<LiveMass />} />
        <Route path="/priest-dashboard" element={<PriestDashboard />} />
        <Route path="/priest-schedules" element={<PriestSchedules />} />
        <Route path="/priest-seminars" element={<PriestSeminars />} />
        <Route path="/priest-bookings" element={<PriestBookings />} />
        <Route path="/priest-alerts" element={<PriestAlerts />} />
        <Route path="/personal-information" element={<PersonalInformation />} />
        <Route path="/donation-history" element={<DonationHistory />} />
        <Route path="/mass-intentions" element={<MassIntentions />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;