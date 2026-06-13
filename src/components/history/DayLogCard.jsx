import { formatDisplayDate, formatSleepDuration } from "../../utils/dateUtils";
import { calculateDailyScore, getScoreLabel } from "../../utils/scoreUtils";

const mealCategoryLabels = {
  breakfast:   "Breakfast",
  lunch:       "Lunch",
  dinner:      "Dinner",
  snacks:      "Snacks",
  junk_food:   "Junk food",
  cheat_meal:  "Cheat meal",
};

const timeLabels = {
  morning:    "Morning",
  afternoon:  "Afternoon",
  evening:    "Evening",
  late_night: "Late night",
};

export default function DayLogCard({ date, log }) {
  const hasLog = !!log;
  const score  = hasLog ? calculateDailyScore(log) : null;
  const { label: scoreLabel, color: scoreColor } = score !== null
    ? getScoreLabel(score)
    : { label: "", color: "" };

  // ── AI suggestions stored in the log ────────────────────
  let aiSuggestions = [];
  if (log?.aiDailySuggestion) {
    try { aiSuggestions = JSON.parse(log.aiDailySuggestion); } catch { /* ignore */ }
  }

  return (
    <article className="day-log-card">
      {/* header row */}
      <div className="day-log-card-header">
        <div className="day-log-date">{formatDisplayDate(date)}</div>
        {score !== null && (
          <div className="day-score-badge" style={{ color: scoreColor, borderColor: scoreColor }}>
            <span className="day-score-number">{score}</span>
            <span className="day-score-label">{scoreLabel}</span>
          </div>
        )}
        {!hasLog && (
          <span className="day-missed-badge">No log</span>
        )}
      </div>

      {!hasLog ? (
        <p className="day-log-empty">Nothing logged for this day.</p>
      ) : (
        <div className="day-log-sections">

          {/* Sleep */}
          <div className="day-log-section">
            <span className="day-log-section-icon">🌙</span>
            <div className="day-log-section-body">
              <span className="day-log-section-title">Sleep</span>
              {log.sleep?.bedTime ? (
                <span className="day-log-section-value">
                  {log.sleep.bedTime} → {log.sleep.wakeTime}
                  {log.sleep.durationMinutes > 0 &&
                    <em> · {formatSleepDuration(log.sleep.durationMinutes)}</em>
                  }
                </span>
              ) : (
                <span className="day-log-section-missing">Not logged</span>
              )}
            </div>
          </div>

          {/* Workouts */}
          <div className="day-log-section">
            <span className="day-log-section-icon">💪</span>
            <div className="day-log-section-body">
              <span className="day-log-section-title">Training</span>
              {log.workouts?.length > 0 ? (
                <div className="day-log-workouts">
                  {log.workouts.map((session, i) => (
                    <div key={i} className="day-log-session">
                      <span className="day-log-session-time">
                        {timeLabels[session.timeOfDay] || session.timeOfDay}
                      </span>
                      {session.exercises?.map((ex, j) => (
                        <span key={j} className="day-log-exercise">
                          {ex.name}
                          <em>
                            {ex.type === "sets_reps"
                              ? ` ${ex.sets}×${ex.reps}`
                              : ` ${ex.durationMinutes}m`}
                          </em>
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="day-log-section-missing">Not logged</span>
              )}
            </div>
          </div>

          {/* Meals */}
          <div className="day-log-section">
            <span className="day-log-section-icon">🥗</span>
            <div className="day-log-section-body">
              <span className="day-log-section-title">Nutrition</span>
              {log.meals?.length > 0 ? (
                <div className="day-log-meals">
                  {log.meals.map((meal, i) => (
                    <span key={i} className="day-log-meal-chip">
                      {mealCategoryLabels[meal.category] || meal.category}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="day-log-section-missing">Not logged</span>
              )}
            </div>
          </div>

          {/* AI note (if saved) */}
          {aiSuggestions.length > 0 && (
            <div className="day-log-ai-section">
              <span className="day-log-ai-title">AI coach that day</span>
              <div className="day-log-ai-list">
                {aiSuggestions.map((s, i) => (
                  <span key={i} className="day-log-ai-chip">
                    <em>{s.category}:</em> {s.suggestion}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </article>
  );
}
