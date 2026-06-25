import React, { useState, useEffect } from "react";

// Formatting utilities
const formatTimeAMPM = (timeStr) => {
  if (!timeStr) return "";
  const d = new Date(timeStr);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12;
  const mStr = String(m).padStart(2, "0");
  return `${h}:${mStr} ${ampm}`;
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  if (dateStr.includes("T")) {
    const d = new Date(dateStr);
    return `${months[d.getMonth()]} ${d.getDate()}`;
  }
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${months[m - 1]} ${d}`;
};

const formatDurationHM = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export default function WakeUpConfirm({ activeSession, confirmWakeUp, onNotYet }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Keep currentTime fresh
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!activeSession) return null;

  const start = new Date(activeSession.fellAsleepTime);
  const diffMs = currentTime - start;
  const durationMinutes = Math.max(0, Math.floor(diffMs / 60000));

  const handleConfirm = () => {
    confirmWakeUp(new Date().toISOString());
  };

  return (
    <div className="sleep-card-flat">
      <span className="profile-micro-label" style={{ color: "#ef9f27" }}>
        ☀️ Up for the day?
      </span>
      <p className="sleep-timer-title" style={{ fontSize: "20px" }}>
        You slept for {formatDurationHM(durationMinutes)}
      </p>
      <p className="sleep-timer-label" style={{ marginTop: "-6px" }}>
        {formatTimeAMPM(activeSession.fellAsleepTime)} ({formatDateShort(activeSession.fellAsleepDate)}) →{" "}
        {formatTimeAMPM(currentTime.toISOString())} (Today)
      </p>
      <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
        <button
          type="button"
          className="pill-button primary-pill"
          style={{ width: "auto" }}
          onClick={handleConfirm}
        >
          Yes, I'm up
        </button>
        <button
          type="button"
          className="pill-button ghost-pill"
          style={{ width: "auto" }}
          onClick={onNotYet}
        >
          Not yet
        </button>
      </div>
    </div>
  );
}
