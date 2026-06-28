import React, { useState } from "react";

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

export default function SleepCompleted({ sleepEntry, deleteSleep }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!sleepEntry) return null;

  const handleDelete = () => {
    deleteSleep();
    setShowConfirmModal(false);
  };

  return (
    <>
      <div className="section-label">LOGGED TODAY</div>
      <div className="log-entry">
        <div className="log-entry-left">
          <span className="log-entry-icon">🌙</span>
          <div>
            <div className="log-entry-name">Sleep session</div>
            <div className="log-entry-meta">
              {formatTimeAMPM(sleepEntry.fellAsleepTime)} – {formatTimeAMPM(sleepEntry.wokeUpTime)}
              {sleepEntry.crossesMidnight 
                ? ` (${formatDateShort(sleepEntry.fellAsleepDate)} – ${formatDateShort(sleepEntry.wokeUpDate)})` 
                : ` (${formatDateShort(sleepEntry.wokeUpDate)})`
              }
              {" · "}
              {formatDurationHM(sleepEntry.duration)}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="rm-btn"
          onClick={() => setShowConfirmModal(true)}
          title="Delete sleep log"
        >
          ×
        </button>
      </div>

      {showConfirmModal && (
        <div className="sleep-modal-backdrop">
          <div className="sleep-modal-content">
            <h3 className="sleep-modal-title">Delete sleep entry?</h3>
            <p className="sleep-modal-text">
              Are you sure you want to delete your drafted sleep session? This will remove it from your drafts and cannot be undone.
            </p>
            <div className="sleep-modal-actions">
              <button
                type="button"
                className="pill-button primary-pill"
                style={{ background: "#ef4444", width: "auto" }}
                onClick={handleDelete}
              >
                Yes, delete
              </button>
              <button
                type="button"
                className="pill-button ghost-pill"
                style={{ width: "auto" }}
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
