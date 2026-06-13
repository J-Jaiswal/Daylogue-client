import { calculateDailyScore, getScoreLabel } from "../../utils/scoreUtils";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function PerformanceScore({ log }) {
  const score = calculateDailyScore(log);
  const { label, color } = getScoreLabel(score);
  const hasAnyLog = log && (
    log.sleep?.bedTime ||
    (log.workouts?.length ?? 0) > 0 ||
    (log.meals?.length ?? 0) > 0
  );

  // How much of the ring to fill
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;

  return (
    <div className="score-card">
      <div className="score-card-inner">
        {/* SVG ring */}
        <div className="score-ring-wrap">
          <svg
            className="score-ring-svg"
            viewBox="0 0 100 100"
            aria-label={`Daily performance score: ${score}`}
          >
            {/* track */}
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth="8"
            />
            {/* fill */}
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={hasAnyLog ? offset : CIRCUMFERENCE}
              transform="rotate(-90 50 50)"
              className="score-ring-fill"
            />
          </svg>
          <div className="score-ring-number">
            <span className="score-number" style={{ color }}>
              {hasAnyLog ? score : "—"}
            </span>
            <span className="score-of">/ 100</span>
          </div>
        </div>

        {/* label + context */}
        <div className="score-text">
          <div className="score-label" style={{ color }}>
            {hasAnyLog ? label : "Not yet scored"}
          </div>
          <p className="score-description">
            {hasAnyLog
              ? "Today's wellbeing score based on sleep, training & nutrition."
              : "Log your sleep, workout, or meals to get today's score."}
          </p>
          <div className="score-pillars">
            <ScorePillar
              icon="🌙"
              label="Sleep"
              value={log?.sleep?.bedTime
                ? (log.sleep.durationMinutes
                    ? `${Math.floor(log.sleep.durationMinutes / 60)}h ${log.sleep.durationMinutes % 60}m`
                    : "Logged")
                : "—"}
              done={!!log?.sleep?.bedTime}
            />
            <ScorePillar
              icon="💪"
              label="Training"
              value={log?.workouts?.length
                ? `${log.workouts.length} session${log.workouts.length > 1 ? "s" : ""}`
                : "—"}
              done={(log?.workouts?.length ?? 0) > 0}
            />
            <ScorePillar
              icon="🥗"
              label="Nutrition"
              value={log?.meals?.length
                ? `${log.meals.length} meal${log.meals.length > 1 ? "s" : ""}`
                : "—"}
              done={(log?.meals?.length ?? 0) > 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScorePillar({ icon, label, value, done }) {
  return (
    <div className={`score-pillar ${done ? "done" : "empty"}`}>
      <span className="score-pillar-icon">{icon}</span>
      <span className="score-pillar-label">{label}</span>
      <span className="score-pillar-value">{value}</span>
    </div>
  );
}
