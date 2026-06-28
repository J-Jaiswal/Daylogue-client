import { calculateDailyScore } from "../../utils/scoreUtils";

const RADIUS = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const MoonIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <path d="M12 3a6.8 6.8 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const DumbbellIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <path d="m6.5 6.5 11 11M14 4l6 6M4 14l6 6M3 7l4-4M17 21l4-4" />
  </svg>
);

const SaladIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M12 6c1-2 3-2 3-2M12 6c-1-2-3-2-3-2" />
  </svg>
);

export default function PerformanceScore({ log }) {
  const hasScore = log && (
    log.sleep?.fellAsleepTime ||
    (log.workouts?.length ?? 0) > 0 ||
    (log.meals?.length ?? 0) > 0
  );

  const score = hasScore ? calculateDailyScore(log) : null;

  // Dynamic fill offset
  const offset = score !== null ? CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE : CIRCUMFERENCE;

  // Score tier label & color mapping
  let labelText = "Not scored";
  let labelColor = "var(--text-3)";
  if (score !== null) {
    if (score >= 90) {
      labelText = "Great day";
      labelColor = "#0F6E56"; // teal
    } else if (score >= 75) {
      labelText = "On track";
      labelColor = "#0F6E56"; // teal
    } else if (score >= 50) {
      labelText = "Getting there";
      labelColor = "#BA7517"; // amber
    } else {
      labelText = "Not Okay";
      labelColor = "#BA7517"; // amber
    }
  }

  return (
    <div className="score-flat-container">
      {/* Left Column: Ring */}
      <div className="score-ring-wrap-flat">
        <svg width="52" height="52" viewBox="0 0 52 52">
          {/* track */}
          <circle
            cx="26"
            cy="26"
            r={RADIUS}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="3.5"
          />
          {/* fill progress */}
          {score !== null && (
            <circle
              cx="26"
              cy="26"
              r={RADIUS}
              fill="none"
              stroke={labelColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              transform="rotate(-90 26 26)"
              className="score-ring-fill-flat"
            />
          )}
        </svg>
        <div className="score-ring-text-flat">
          <span
            className="score-num-flat"
            style={{ color: score !== null ? labelColor : "var(--text-3)" }}
          >
            {score !== null ? score : "—"}
          </span>
          <span className="score-of-flat">/100</span>
        </div>
      </div>

      {/* Right Column: Score details */}
      <div className="score-details-flat">
        <span className="profile-micro-label">Yesterday's score</span>
        <div className="score-label-flat" style={{ color: labelColor }}>
          {labelText}
        </div>
        <p className="score-subtitle-flat">
          Based on sleep, training & nutrition.
        </p>

        {score !== null && score !== undefined && (
          <div className="score-stat-pills-row mt-8">
            <span className="stat-pill-item">
              <MoonIcon />
              <span className="stat-pill-val" style={{ color: log?.sleep?.fellAsleepTime ? "inherit" : "var(--text-3)" }}>
                {log?.sleep?.fellAsleepTime
                  ? (log.sleep.duration
                      ? `${Math.floor(log.sleep.duration / 60)}h ${log.sleep.duration % 60}m`
                      : "Logged")
                  : "—"}
              </span>
            </span>

            <span className="stat-pill-item">
              <DumbbellIcon />
              <span className="stat-pill-val" style={{ color: (log?.workouts?.length ?? 0) > 0 ? "inherit" : "var(--text-3)" }}>
                {(log?.workouts?.length ?? 0) > 0
                  ? `${log.workouts.length} session${log.workouts.length > 1 ? "s" : ""}`
                  : "—"}
              </span>
            </span>

            <span className="stat-pill-item">
              <SaladIcon />
              <span className="stat-pill-val" style={{ color: (log?.meals?.length ?? 0) > 0 ? "inherit" : "var(--text-3)" }}>
                {(log?.meals?.length ?? 0) > 0
                  ? `${log.meals.length} meal${log.meals.length > 1 ? "s" : ""}`
                  : "—"}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
