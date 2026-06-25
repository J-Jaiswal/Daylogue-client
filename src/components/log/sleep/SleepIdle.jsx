import React from "react";

export default function SleepIdle({ startSleep }) {
  return (
    <>
      <div className="section-label">LOGGED TODAY</div>
      <div style={{ color: "var(--text-3)", fontSize: "13.5px", fontStyle: "italic", padding: "4px 0 2px" }}>
        No sleep logged yet today.
      </div>

      <div className="sleep-cta">
        <div className="sleep-cta-text">
          <strong>Ready to sleep?</strong>
          Track tonight's session
        </div>
        <button
          type="button"
          className="btn-bed"
          onClick={startSleep}
        >
          🌙 Go to bed
        </button>
      </div>
    </>
  );
}
