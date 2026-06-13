import { useState, useMemo } from "react";

function formatDuration(bedTime, wakeTime) {
  if (!bedTime || !wakeTime) return null;
  const [bh, bm] = bedTime.split(":").map(Number);
  const [wh, wm] = wakeTime.split(":").map(Number);
  let totalMins = wh * 60 + wm - (bh * 60 + bm);
  if (totalMins < 0) totalMins += 24 * 60; // crosses midnight
  if (totalMins <= 0) return null;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function SleepForm({ initial, onSave }) {
  const [form, setForm] = useState({
    bedTime: "",
    wakeTime: "",
    ...initial,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!form.bedTime || !form.wakeTime) return;
    onSave({ bedTime: form.bedTime, wakeTime: form.wakeTime });
  };

  const duration = useMemo(
    () => formatDuration(form.bedTime, form.wakeTime),
    [form.bedTime, form.wakeTime]
  );

  const hasPreview = form.bedTime && form.wakeTime;

  return (
    <div className="sleep-section-card">
      <span className="sleep-card-header-label">SLEEP</span>

      <div className="sleep-inputs-row">
        <div className="sleep-input-group">
          <span className="sleep-input-label">BED TIME</span>
          <div className="sleep-input-wrapper">
            <input
              type="time"
              name="bedTime"
              value={form.bedTime}
              onChange={handleChange}
              className="sleep-time-input"
            />
            <span className="sleep-clock-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 15 15"></polyline>
              </svg>
            </span>
          </div>
        </div>

        <div className="sleep-input-group">
          <span className="sleep-input-label">WAKE TIME</span>
          <div className="sleep-input-wrapper">
            <input
              type="time"
              name="wakeTime"
              value={form.wakeTime}
              onChange={handleChange}
              className="sleep-time-input"
            />
            <span className="sleep-clock-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 15 15"></polyline>
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Live preview */}
      {hasPreview && (
        <div className="log-preview-card sleep-preview">
          <span className="log-preview-label">PREVIEW</span>
          <div className="sleep-preview-body">
            <span className="sleep-preview-icon">🌙</span>
            <div className="sleep-preview-text">
              <span className="sleep-preview-times">
                {form.bedTime} <span className="sleep-preview-arrow">→</span> {form.wakeTime}
              </span>
              {duration && (
                <span className="sleep-preview-duration">{duration}</span>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        className="sleep-save-btn"
        onClick={handleSave}
        disabled={!form.bedTime || !form.wakeTime}
      >
        SAVE SLEEP
      </button>
    </div>
  );
}
