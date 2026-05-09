import { useState } from "react";
import styles from "../../styles/Admin/AdminPage.module.css";
import sStyles from "../../styles/Admin/AdminSettings.module.css";

export default function AdminSettings() {
  const navigate = useNavigate();
  const [parishName,    setParishName]    = useState("Saint Joseph Parish");
  const [parishEmail,   setParishEmail]   = useState("admin@faithlink.com");
  const [diocese,       setDiocese]       = useState("Archdiocese of Manila");
  const [notifBookings, setNotifBookings] = useState(true);
  const [notifDonation, setNotifDonation] = useState(true);
  const [notifStream,   setNotifStream]   = useState(false);

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Manage your parish details and system preferences</p>
        </div>
      </div>

      <div className={sStyles.grid}>

        {/* Parish Information */}
        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader}>
            <h2 className={styles.tableCardTitle}>Parish Information</h2>
          </div>
          <div className={sStyles.cardBody}>
            {[
              { label: "Parish Name",  val: parishName,  set: setParishName,  type: "text"  },
              { label: "Admin Email",  val: parishEmail, set: setParishEmail, type: "email" },
              { label: "Diocese",      val: diocese,     set: setDiocese,     type: "text"  },
            ].map(({ label, val, set, type }) => (
              <div key={label} className={sStyles.field}>
                <label className={sStyles.label}>{label}</label>
                <input
                  className={sStyles.input}
                  type={type}
                  value={val}
                  onChange={(e) => set(e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader}>
            <h2 className={styles.tableCardTitle}>Notification Preferences</h2>
          </div>
          <div className={sStyles.cardBody}>
            {[
              { label: "New Booking Requests",   sub: "Get notified when a parishioner submits a booking",  val: notifBookings, set: setNotifBookings },
              { label: "Donation Verifications", sub: "Get notified when a donation is submitted",          val: notifDonation, set: setNotifDonation },
              { label: "Live Stream Alerts",     sub: "Get notified before a scheduled stream goes live",   val: notifStream,   set: setNotifStream   },
            ].map(({ label, sub, val, set }) => (
              <div key={label} className={sStyles.toggle}>
                <div>
                  <p className={sStyles.toggleLabel}>{label}</p>
                  <p className={sStyles.toggleSub}>{sub}</p>
                </div>
                <button
                  className={`${sStyles.switch} ${val ? sStyles.switchOn : ""}`}
                  onClick={() => set(!val)}
                  aria-label={`Toggle ${label}`}
                >
                  <span className={sStyles.switchThumb} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <button className={sStyles.saveBtn}>Save Changes</button>
      </div>
    </div>
  );
}
