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

const formatDurationHM = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const getNapDurationMinutes = (start, end) => {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60;
  return diff;
};

const deriveTimeOfDay = (timeStr) => {
  if (!timeStr) return "afternoon";
  const [h] = timeStr.split(":").map(Number);
  if (h < 12) return "morning";
  if (h <= 17) return "afternoon";
  return "evening";
};

const convertTimeToISO = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export default function NapSection({ naps, addNap, deleteNap }) {
  const [showNapForm, setShowNapForm] = useState(false);
  const [napStartTime, setNapStartTime] = useState("14:00");
  const [napEndTime, setNapEndTime] = useState("15:00");

  const handleSaveNap = async () => {
    const [sh, sm] = napStartTime.split(":").map(Number);
    const [eh, em] = napEndTime.split(":").map(Number);
    const startTotal = sh * 60 + sm;
    const endTotal = eh * 60 + em;

    if (endTotal <= startTotal) {
      toast.error("End time must be after start time");
      return;
    }

    const duration = getNapDurationMinutes(napStartTime, napEndTime);
    if (duration <= 0) {
      toast.error("Nap duration must be greater than 0 minutes");
      return;
    }

    const startTimeISO = convertTimeToISO(napStartTime);
    const endTimeISO = convertTimeToISO(napEndTime);

    await addNap({
      startTime: startTimeISO,
      endTime: endTimeISO,
    });

    setShowNapForm(false);
    setNapStartTime("14:00");
    setNapEndTime("15:00");
    toast.success("Nap saved ✓");
  };

  return (
    <div className="nap-logged-section" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {naps && naps.length > 0 && (
        <div>
          <div className="section-label">NAPS</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {naps.map((nap, idx) => {
              const capTimeOfDay = nap.timeOfDay
                ? nap.timeOfDay.charAt(0).toUpperCase() + nap.timeOfDay.slice(1)
                : "";
              return (
                <div key={nap._id || idx} className="log-entry">
                  <div className="log-entry-left">
                    <span className="log-entry-icon">💤</span>
                    <div>
                      <div className="log-entry-name">Nap ({capTimeOfDay})</div>
                      <div className="log-entry-meta">
                        {formatTimeAMPM(nap.startTime)} – {formatTimeAMPM(nap.endTime)}
                        {" · "}
                        {formatDurationHM(nap.duration)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rm-btn"
                    onClick={() => deleteNap(nap._id)}
                    title="Remove nap"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!showNapForm ? (
        <button
          type="button"
          className="btn-outline"
          style={{ marginTop: "12px" }}
          onClick={() => setShowNapForm(true)}
        >
          {naps && naps.length > 0 ? "+ Log another nap" : "+ Log a nap"}
        </button>
      ) : (
        <div className="input-zone" style={{ "--zc": "#7F77DD", marginTop: "16px" }}>
          <div className="zone-header">
            <span className="zone-label-text">LOG A NAP</span>
          </div>

          <div className="field-row">
            <div className="field-wrap">
              <span className="field-label">Start time</span>
              <input
                type="time"
                value={napStartTime}
                onChange={(e) => setNapStartTime(e.target.value)}
              />
            </div>
            <div className="field-wrap">
              <span className="field-label">End time</span>
              <input
                type="time"
                value={napEndTime}
                onChange={(e) => setNapEndTime(e.target.value)}
              />
            </div>
          </div>

          <div style={{ fontSize: "12.5px", color: "var(--text-3)", marginBottom: "14px" }}>
            Duration: {formatDurationHM(getNapDurationMinutes(napStartTime, napEndTime))}
            {" · "}
            {deriveTimeOfDay(napStartTime)}
          </div>

          <div className="action-row">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowNapForm(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              style={{ background: "#7F77DD" }}
              onClick={handleSaveNap}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
