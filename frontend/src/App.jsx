import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageBookings from "./pages/Admin/ManageBookings";
import ManageDonations from "./pages/Admin/ManageDonations";
import ManageParishioners from "./pages/Admin/ManageParishioners";
import ManageStreams from "./pages/Admin/ManageStreams";
import PriestDashboard from "./pages/Priest/PriestDashboard";
import PriestSchedules from "./pages/Priest/PriestSchedules";
import PriestSeminars from "./pages/Priest/PriestSeminars";
import PriestBookings from "./pages/Priest/PriestBookings";
import PriestAlerts from "./pages/Priest/PriestAlerts";
import Dashboard from "./pages/Parishioner/Dashboard";
import Bookings from "./pages/Parishioner/Bookings";
import SelectService from "./pages/Parishioner/SelectService";
import BookingForm from "./pages/Parishioner/BookingForm";
import Donation from "./pages/Parishioner/Donation";
import Profile from "./pages/Parishioner/Profile";
import Events from "./pages/Parishioner/Events";
import LiveMass from "./pages/Parishioner/LiveMass";
import PersonalInformation from "./pages/Parishioner/PersonalInformation";
import DonationHistory from "./pages/Parishioner/DonationHistory";
import MassIntentions from "./pages/Parishioner/MassIntentions";
import Settings from "./pages/Parishioner/Settings";
import Notifications from "./pages/Parishioner/Notifications";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/bookings" element={<ManageBookings />} />
        <Route path="/admin/donations" element={<ManageDonations />} />
        <Route path="/admin/parishioners" element={<ManageParishioners />} />
        <Route path="/admin/streams" element={<ManageStreams />} />
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
