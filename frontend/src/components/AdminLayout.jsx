import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import styles from "./AdminLayout.module.css";

const PAGE_TITLES = {
  "/admin/dashboard":       "Dashboard",
  "/admin/bookings":        "Sacrament Bookings",
  "/admin/mass-intentions": "Mass Intentions",
  "/admin/donations":       "Donations",
  "/admin/announcements":   "Announcements",
  "/admin/live-streams":    "Live Streams",
  "/admin/parishioners":    "Parishioners",
  "/admin/reports":         "Reports",
  "/admin/settings":        "Settings",
};

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6"  x2="21" y2="6"  />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export default function AdminLayout() {
  // Start expanded so labels are always visible on load.
  // The hamburger button lets users collapse the sidebar if they want.
  // On genuine phones (< 640px) start collapsed so the overlay doesn't block content.
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 640
  );
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? "Admin";

  return (
    <div className={styles.shell}>
      {/* ── Persistent sidebar ── */}
      <AdminSidebar collapsed={collapsed} />

      {/* Mobile backdrop — tap to close sidebar */}
      {!collapsed && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* ── Right pane (topbar + scrollable content) ── */}
      <div className={styles.rightPane}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              className={styles.hamburger}
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Toggle sidebar"
            >
              <MenuIcon />
            </button>
            <span className={styles.pageTitle}>{pageTitle}</span>
          </div>
          <div className={styles.avatar}>AD</div>
        </header>

        {/* Page content — each route renders here via <Outlet /> */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
