import React, { useState } from "react";
import toast from "react-hot-toast";

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

export default function StaleSessionRecovery({ activeSession, confirmWakeUp, cancelSleep }) {
  const [wakeTime, setWakeTime] = useState("07:00");
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (!activeSession) return null;

  const handleSave = () => {
    if (!wakeTime) {
      toast.error("Please enter a wake up time");
      return;
    }

    const start = new Date(activeSession.fellAsleepTime);
    const [h, m] = wakeTime.split(":").map(Number);

    const wokeUpDateObj = new Date(start);
    wokeUpDateObj.setHours(h, m, 0, 0);

    if (wokeUpDateObj <= start) {
      wokeUpDateObj.setDate(wokeUpDateObj.getDate() + 1);
    }

    confirmWakeUp(wokeUpDateObj.toISOString());
  };

  return (
    <div className="sleep-stale-box">
      <span className="sleep-stale-title">
        🌙 Looks like you forgot to log your wake time.
      </span>
      <p className="sleep-timer-label" style={{ margin: 0 }}>
        You started sleeping at {formatTimeAMPM(activeSession.fellAsleepTime)} on {formatDateShort(activeSession.fellAsleepDate)}.
      </p>

      <div className="sleep-stale-inputs">
        <span className="nap-form-label">When did you wake up?</span>
        <input
          type="time"
          value={wakeTime}
          onChange={(e) => setWakeTime(e.target.value)}
          className="log-time-input"
        />
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          type="button"
          className="pill-button primary-pill"
          style={{ width: "auto" }}
          onClick={handleSave}
        >
          Save
        </button>
        <button
          type="button"
          className="pill-button ghost-pill"
          style={{ width: "auto" }}
          onClick={() => setShowCancelModal(true)}
        >
          Discard session
        </button>
      </div>

      {showCancelModal && (
        <div className="sleep-modal-backdrop">
          <div className="sleep-modal-content">
            <h3 className="sleep-modal-title">Delete this sleep session?</h3>
            <p className="sleep-modal-text">
              Started {formatDateShort(activeSession.fellAsleepDate)} at {formatTimeAMPM(activeSession.fellAsleepTime)}. This cannot be undone.
            </p>
            <div className="sleep-modal-actions">
              <button
                type="button"
                className="pill-button primary-pill"
                style={{ background: "#ef4444", width: "auto" }}
                onClick={cancelSleep}
              >
                Yes, delete
              </button>
              <button
                type="button"
                className="pill-button ghost-pill"
                style={{ width: "auto" }}
                onClick={() => setShowCancelModal(false)}
              >
                Keep it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
