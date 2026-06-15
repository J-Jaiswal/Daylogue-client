import { useState } from "react";

// Safe date manipulation helpers
const getNextDate = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  dateObj.setDate(dateObj.getDate() + 1);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Formats minutes into "Xh Ym" or "0h"
const formatSleepDuration = (minutes) => {
  if (!minutes) return "0h";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

// Formats date and time strings to "Jun 15, 10:00 PM"
const formatDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, min] = timeStr.split(":").map(Number);
  const monthStr = months[m - 1];
  
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayMin = min < 10 ? `0${min}` : min;
  
  return `${monthStr} ${d}, ${displayH}:${displayMin} ${ampm}`;
};

// Icon determination: 🌙 if fell asleep between 6 PM - 6 AM, 😴 if between 6 AM - 6 PM
const getSleepIcon = (timeStr) => {
  if (!timeStr) return "🌙";
  const [h] = timeStr.split(":").map(Number);
  if (h >= 18 || h < 6) return "🌙";
  return "😴";
};

// Live duration calculation in minutes
const getDurationMinutes = (startDateStr, startTimeStr, endDateStr, endTimeStr) => {
  if (!startDateStr || !startTimeStr || !endDateStr || !endTimeStr) return 0;
  const start = new Date(`${startDateStr}T${startTimeStr}:00`);
  const end = new Date(`${endDateStr}T${endTimeStr}:00`);
  const diffMs = end - start;
  if (diffMs < 0) return 0;
  return Math.floor(diffMs / (1000 * 60));
};

export default function SleepForm({ sleep, onSaveSleepEntry, onDeleteSleepEntry, isPending }) {
  const getTodayDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 1. Form Inputs State
  const [fellAsleepDate, setFellAsleepDate] = useState(getTodayDateStr);
  const [fellAsleepTime, setFellAsleepTime] = useState("22:00");
  const [wokeUpDate, setWokeUpDate] = useState(() => getNextDate(getTodayDateStr()));
  const [wokeUpTime, setWokeUpTime] = useState("06:00");

  // 2. Day Reset Time Config (default 6:00 AM)
  const [resetTime, setResetTime] = useState(() => {
    return localStorage.getItem("daylogue-sleep-reset-time") || "06:00";
  });

  // 3. Log Toggle Expanded/Collapsed
  const [isLogExpanded, setIsLogExpanded] = useState(false);

  // Auto-bump wake date if wake time is less than or equal to sleep time (on same day)
  const handleFellAsleepDateChange = (e) => {
    const date = e.target.value;
    setFellAsleepDate(date);
    const [sleepH, sleepM] = fellAsleepTime.split(":").map(Number);
    const [wakeH, wakeM] = wokeUpTime.split(":").map(Number);
    if (wakeH * 60 + wakeM <= sleepH * 60 + sleepM) {
      setWokeUpDate(getNextDate(date));
    } else {
      setWokeUpDate(date);
    }
  };

  const handleFellAsleepTimeChange = (e) => {
    const time = e.target.value;
    setFellAsleepTime(time);
    const [sleepH, sleepM] = time.split(":").map(Number);
    const [wakeH, wakeM] = wokeUpTime.split(":").map(Number);
    if (wakeH * 60 + wakeM <= sleepH * 60 + sleepM) {
      setWokeUpDate(getNextDate(fellAsleepDate));
    } else {
      setWokeUpDate(fellAsleepDate);
    }
  };

  const handleWokeUpTimeChange = (e) => {
    const time = e.target.value;
    setWokeUpTime(time);
    const [sleepH, sleepM] = fellAsleepTime.split(":").map(Number);
    const [wakeH, wakeM] = time.split(":").map(Number);
    if (wakeH * 60 + wakeM <= sleepH * 60 + sleepM) {
      setWokeUpDate(getNextDate(fellAsleepDate));
    } else {
      setWokeUpDate(fellAsleepDate);
    }
  };

  const handleWokeUpDateChange = (e) => {
    setWokeUpDate(e.target.value);
  };

  const handleResetTimeChange = (e) => {
    const newTime = e.target.value;
    setResetTime(newTime);
    localStorage.setItem("daylogue-sleep-reset-time", newTime);
  };

  // Save entry handler
  const handleSave = () => {
    const duration = getDurationMinutes(fellAsleepDate, fellAsleepTime, wokeUpDate, wokeUpTime);
    if (duration <= 0) {
      alert("Invalid sleep duration. Please check your fell asleep and woke up times.");
      return;
    }
    
    onSaveSleepEntry({
      fellAsleepDate,
      fellAsleepTime,
      wokeUpDate,
      wokeUpTime,
      durationMinutes: duration
    }, resetTime);
  };

  // Convert legacy format logs or get entries
  const getSleepEntries = () => {
    if (!sleep) return [];
    if (sleep.entries && sleep.entries.length > 0) {
      return sleep.entries;
    }
    if (sleep.bedTime && sleep.wakeTime) {
      return [{
        _id: "legacy",
        fellAsleepDate: getTodayDateStr(), // fallback approximation
        fellAsleepTime: sleep.bedTime,
        wokeUpDate: sleep.wakeTime <= sleep.bedTime ? getNextDate(getTodayDateStr()) : getTodayDateStr(),
        wokeUpTime: sleep.wakeTime,
        durationMinutes: sleep.durationMinutes || 0
      }];
    }
    return [];
  };

  const entries = getSleepEntries();
  const sortedEntries = [...entries].sort((a, b) => {
    const startA = new Date(`${a.fellAsleepDate}T${a.fellAsleepTime}`);
    const startB = new Date(`${b.fellAsleepDate}T${b.fellAsleepTime}`);
    return startB - startA; // newest first
  });

  const totalDuration = entries.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
  const liveDuration = getDurationMinutes(fellAsleepDate, fellAsleepTime, wokeUpDate, wokeUpTime);

  return (
    <div className="sleep-form-wrap">
      <h3 className="form-card-title">Sleep Details</h3>
      
      {/* Date/Time pickers */}
      <div className="sleep-inputs-grid-new">
        <div className="sleep-inputs-row">
          <div className="time-field">
            <label className="field-label">FELL ASLEEP</label>
            <div className="time-input-group">
              <input
                type="date"
                value={fellAsleepDate}
                onChange={handleFellAsleepDateChange}
                className="date-picker-input"
              />
              <input
                type="time"
                value={fellAsleepTime}
                onChange={handleFellAsleepTimeChange}
                className="time-picker-input-small"
              />
            </div>
          </div>
        </div>

        <div className="sleep-inputs-row">
          <div className="time-field">
            <label className="field-label">WOKE UP</label>
            <div className="time-input-group">
              <input
                type="date"
                value={wokeUpDate}
                onChange={handleWokeUpDateChange}
                className="date-picker-input"
              />
              <input
                type="time"
                value={wokeUpTime}
                onChange={handleWokeUpTimeChange}
                className="time-picker-input-small"
              />
            </div>
          </div>
        </div>
      </div>

      {liveDuration > 0 && (
        <div className="sleep-duration-badge-pill">
          {formatSleepDuration(liveDuration)}
        </div>
      )}

      <button
        type="button"
        className="sleep-save-btn-gradient-new"
        onClick={handleSave}
        disabled={isPending || liveDuration <= 0}
      >
        {isPending ? "Saving..." : "Save Entry"}
      </button>

      {/* Sleep Log Collapsible Toggle */}
      <div className="sleep-log-toggle-container">
        <button
          type="button"
          className="sleep-log-toggle-btn"
          onClick={() => setIsLogExpanded(!isLogExpanded)}
        >
          <span className="sleep-log-toggle-label">
            🗒 Sleep Log · {formatSleepDuration(totalDuration)} total
          </span>
          <span className="chevron-icon">{isLogExpanded ? "▾" : "▸"}</span>
        </button>

        {isLogExpanded && (
          <div className="sleep-log-expanded-content">
            <div className="sleep-entries-list">
              {sortedEntries.length === 0 ? (
                <p className="no-sleep-entries">No sleep entries logged today.</p>
              ) : (
                sortedEntries.map((entry) => (
                  <div key={entry._id || entry.id} className="sleep-entry-row-card">
                    <span className="entry-sleep-icon">{getSleepIcon(entry.fellAsleepTime)}</span>
                    <span className="entry-time-range">
                      {formatDateTime(entry.fellAsleepDate, entry.fellAsleepTime)} → {formatDateTime(entry.wokeUpDate, entry.wokeUpTime)}
                    </span>
                    <span className="entry-duration-tag">
                      {formatSleepDuration(entry.durationMinutes)}
                    </span>
                    <button
                      type="button"
                      className="entry-delete-btn-x"
                      onClick={() => onDeleteSleepEntry(entry, resetTime)}
                      title="Delete sleep entry"
                      disabled={isPending}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="sleep-log-divider" />

            {/* Config Reset Time */}
            <div className="sleep-reset-config-block">
              <span className="reset-label">⚙ Day resets at</span>
              <div className="reset-time-picker-wrap">
                <input
                  type="time"
                  value={resetTime}
                  onChange={handleResetTimeChange}
                  className="reset-time-input"
                />
                <span className="clock-emoji">⏰</span>
              </div>
            </div>
            <p className="sleep-reset-hint">
              Entries group by the day you fell asleep.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
