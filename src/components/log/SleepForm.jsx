import { useState } from "react";

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
    onSave({
      bedTime: form.bedTime,
      wakeTime: form.wakeTime,
    });
  };

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
