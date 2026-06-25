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

const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function SleepRecording({ activeSession, cancelSleep, onWakeUp }) {
  const [elapsedText, setElapsedText] = useState("00:00:00");
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!activeSession || !activeSession.fellAsleepTime) return;

    const tick = () => {
      const start = new Date(activeSession.fellAsleepTime);
      const now = new Date();
      const diffMs = now - start;
      if (diffMs < 0) {
        setElapsedText("00:00:00");
        return;
      }
      const diffSecs = Math.floor(diffMs / 1000);
      const h = String(Math.floor(diffSecs / 3600)).padStart(2, "0");
      const m = String(Math.floor((diffSecs % 3600) / 60)).padStart(2, "0");
      const s = String(diffSecs % 60).padStart(2, "0");
      setElapsedText(`${h}:${m}:${s}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const crossesMidnight = activeSession && activeSession.fellAsleepDate !== getTodayDateStr();

  return (
    <div className="sleep-card-flat">
      <div className="sleep-timer-container">
        <span className="sleep-rec-dot" />
        <span className="sleep-timer-title">{elapsedText}</span>
        <span className="sleep-timer-label">REC</span>
      </div>
      <div>
        <span className="sleep-timer-label" style={{ display: "block", fontWeight: 600 }}>
          Sleeping since {formatTimeAMPM(activeSession?.fellAsleepTime)}
        </span>
        {crossesMidnight && (
          <span className="sleep-session-dates">
            Started: {formatDateShort(activeSession?.fellAsleepDate)}
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          type="button"
          className="pill-button primary-pill"
          style={{ width: "auto" }}
          onClick={onWakeUp}
        >
          ☀️ Wake Up
        </button>
        <button
          type="button"
          className="pill-button ghost-pill"
          style={{ width: "auto" }}
          onClick={() => setShowCancelModal(true)}
        >
          ✕ Cancel
        </button>
      </div>

      {showCancelModal && (
        <div className="sleep-modal-backdrop">
          <div className="sleep-modal-content">
            <h3 className="sleep-modal-title">Delete this sleep session?</h3>
            <p className="sleep-modal-text">
              Started {formatDateShort(activeSession?.fellAsleepDate)} at {formatTimeAMPM(activeSession?.fellAsleepTime)}. This cannot be undone.
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
