import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Heart,
  Megaphone,
  Moon,
  Volume2,
  Save,
} from "lucide-react";
import "../../styles/Parishioner/Settings.css";

function Settings() {
  const navigate = useNavigate();

  const defaultSettings = {
    bookingReminders: true,
    donationUpdates: true,
    eventAnnouncements: true,
    massReminders: true,
    soundEffects: true,
    darkMode: false,
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = JSON.parse(
      localStorage.getItem("parishionerSettings")
    );

    if (savedSettings) {
      setSettings({ ...defaultSettings, ...savedSettings });
    }
  }, []);

  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));

    setSaved(false);
  };

  const playSuccessSound = () => {
  if (!settings.soundEffects) return;

  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(700, audioContext.currentTime);

  gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 0.2
  );

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.2);
};

  const saveSettings = () => {
    localStorage.setItem("parishionerSettings", JSON.stringify(settings));

    if (settings.darkMode) {
      document.body.classList.add("faithlink-dark-mode");
      document.documentElement.classList.add("faithlink-dark-mode");
    } else {
      document.body.classList.remove("faithlink-dark-mode");
      document.documentElement.classList.remove("faithlink-dark-mode");
    }

    playSuccessSound();

    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="mobile-dashboard settings-page">
      <div className="top-bar">
        <div className="brand">
          <button className="back-btn" onClick={() => navigate("/profile")}>
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h2>Settings</h2>
        </div>
      </div>

      <div className="settings-content">
        <p className="settings-subtitle">
          Manage your app preferences and parish updates.
        </p>

        <div className="settings-section-title">Notifications</div>

        <SettingItem
          icon={<CalendarDays size={20} />}
          title="Booking Reminders"
          description="Get reminders for your sacrament bookings."
          checked={settings.bookingReminders}
          onChange={() => toggleSetting("bookingReminders")}
        />

        <SettingItem
          icon={<Heart size={20} />}
          title="Donation Updates"
          description="Receive updates about donation status and verification."
          checked={settings.donationUpdates}
          onChange={() => toggleSetting("donationUpdates")}
        />

        <SettingItem
          icon={<Megaphone size={20} />}
          title="Parish Announcements"
          description="Receive updates about parish events and activities."
          checked={settings.eventAnnouncements}
          onChange={() => toggleSetting("eventAnnouncements")}
        />

        <SettingItem
          icon={<Bell size={20} />}
          title="Mass Reminders"
          description="Get notified about live mass and upcoming schedules."
          checked={settings.massReminders}
          onChange={() => toggleSetting("massReminders")}
        />

        <div className="settings-section-title">App Preferences</div>

        <SettingItem
          icon={<Volume2 size={20} />}
          title="Sound Effects"
          description="Play a short sound after successful actions."
          checked={settings.soundEffects}
          onChange={() => toggleSetting("soundEffects")}
        />

        <SettingItem
          icon={<Moon size={20} />}
          title="Dark Mode"
          description="Switch the app appearance to a darker theme."
          checked={settings.darkMode}
          onChange={() => toggleSetting("darkMode")}
        />

        <button className="save-settings-btn" onClick={saveSettings}>
          <Save size={18} />
          {saved ? "Settings Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

function SettingItem({ icon, title, description, checked, onChange }) {
  return (
    <div className="settings-card">
      <div className="settings-icon">{icon}</div>

      <div className="settings-text">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>

      <label className="switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="slider"></span>
      </label>
    </div>
  );
}

export default Settings;