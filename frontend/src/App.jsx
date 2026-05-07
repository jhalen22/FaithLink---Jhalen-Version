import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageDonations from "./pages/admin/ManageDonations";
import ManageParishioners from "./pages/admin/ManageParishioners";
import ManageStreams from "./pages/admin/ManageStreams";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;