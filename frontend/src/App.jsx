import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import "./styles/App.css";
import { ToastProvider } from "./context/ToastContext";
import { ConfirmProvider } from "./context/ConfirmContext";

/* ── Shared admin shell ── */
import AdminLayout from "./components/AdminLayout";

/* ── Admin pages (content only — no layout wrapper) ── */
import AdminDashboard      from "./pages/Admin/AdminDashboard";
import ManageBookings      from "./pages/Admin/ManageBookings";
import AssignPriest from "./pages/Admin/AssignPriest";
import ManageDonations     from "./pages/Admin/ManageDonations";
import ManageParishioners  from "./pages/Admin/ManageParishioners";
import ManageStreams        from "./pages/Admin/ManageStreams";
import ManageAnnouncements from "./pages/Admin/ManageAnnouncements";
import ManageMassIntentions from "./pages/Admin/ManageMassIntentions";
import AdminReports        from "./pages/Admin/AdminReports";
import AdminSettings       from "./pages/Admin/AdminSettings";


/* ── Priest pages ── */
import PriestDashboard from "./pages/Priest/PriestDashboard";
import PriestSchedules from "./pages/Priest/PriestSchedules";
import PriestSeminars  from "./pages/Priest/PriestSeminars";
import PriestBookings  from "./pages/Priest/PriestBookings";
import PriestAlerts    from "./pages/Priest/PriestAlerts";


/* ── Parishioner / Auth pages ── */
import Login              from "./pages/Login";
import Register           from "./pages/Register";
import Dashboard          from "./pages/Parishioner/Dashboard";
import Bookings           from "./pages/Parishioner/Bookings";
import SelectService      from "./pages/Parishioner/SelectService";
import BookingForm        from "./pages/Parishioner/BookingForm";
import Donation           from "./pages/Parishioner/Donation";
import Profile            from "./pages/Parishioner/Profile";
import Events             from "./pages/Parishioner/Events";
import LiveMass           from "./pages/Parishioner/LiveMass";
import PersonalInformation from "./pages/Parishioner/PersonalInformation";
import DonationHistory    from "./pages/Parishioner/DonationHistory";
import MassIntentions     from "./pages/Parishioner/MassIntentions";
import Settings           from "./pages/Parishioner/Settings";
import Notifications      from "./pages/Parishioner/Notifications";

function App() {

  useEffect(() => {
  const savedSettings = JSON.parse(localStorage.getItem("parishionerSettings"));

  if (savedSettings?.darkMode) {
    document.body.classList.add("faithlink-dark-mode");
    document.documentElement.classList.add("faithlink-dark-mode");
  } else {
    document.body.classList.remove("faithlink-dark-mode");
    document.documentElement.classList.remove("faithlink-dark-mode");
  }
}, []);

  return (
    <ToastProvider>
    <ConfirmProvider>
    <BrowserRouter>
      <Routes>
        {/* ── Auth ── */}
        <Route path="/"         element={<Login />}    />
        <Route path="/register" element={<Register />} />

        {/* ── Admin — all share the persistent sidebar + topbar layout ── */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Redirect bare /admin to /admin/dashboard */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard"       element={<AdminDashboard />}       />
          <Route path="bookings"        element={<ManageBookings />}       />
          <Route path="assign-priest" element={<AssignPriest />} />
          <Route path="mass-intentions" element={<ManageMassIntentions />} />
          <Route path="donations"       element={<ManageDonations />}      />
          <Route path="announcements"   element={<ManageAnnouncements />}  />
          <Route path="live-streams"    element={<ManageStreams />}         />
          <Route path="parishioners"    element={<ManageParishioners />}   />
          <Route path="reports"         element={<AdminReports />}         />
          <Route path="settings"        element={<AdminSettings />}        />
        </Route>

        {/* ── Parishioner ── */}
        <Route path="/dashboard"          element={<Dashboard />}           />
        <Route path="/bookings"           element={<Bookings />}            />
        <Route path="/select-service"     element={<SelectService />}       />
        <Route path="/booking-form"       element={<BookingForm />}         />
        <Route path="/donation"           element={<Donation />}            />
        <Route path="/profile"            element={<Profile />}             />
        <Route path="/events"             element={<Events />}              />
        <Route path="/live-mass"          element={<LiveMass />}            />
        <Route path="/personal-information" element={<PersonalInformation />} />
        <Route path="/donation-history"   element={<DonationHistory />}    />
        <Route path="/mass-intentions"    element={<MassIntentions />}      />
        <Route path="/settings"           element={<Settings />}            />
        <Route path="/notifications"      element={<Notifications />}       />

        {/* ── Priest ── */}
        <Route path="/priest-dashboard" element={<PriestDashboard />} />
        <Route path="/priest-schedules" element={<PriestSchedules />} />
        <Route path="/priest-seminars"  element={<PriestSeminars />}  />
        <Route path="/priest-bookings"  element={<PriestBookings />}  />
        <Route path="/priest-alerts"    element={<PriestAlerts />}    />
      </Routes>
    </BrowserRouter>
    </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
