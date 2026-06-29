import { useState } from "react";
import { formatDisplayDate, formatSleepDuration } from "../../utils/dateUtils";
import { calculateDailyScore, getScoreLabel } from "../../utils/scoreUtils";

const mealCategoryLabels = {
  breakfast:  "Breakfast",
  lunch:      "Lunch",
  dinner:     "Dinner",
  snacks:     "Snacks",
  junk_food:  "Junk food",
  cheat_meal: "Cheat meal",
};

const mealCategoryIcons = {
  breakfast:  "🌅",
  lunch:      "☀️",
  dinner:     "🌆",
  snacks:     "🍎",
  junk_food:  "🍔",
  cheat_meal: "🍕",
};

const drinkIcons = {
  water:         "💧",
  coffee:        "☕",
  tea:           "🍵",
  juice:         "🥤",
  protein_shake: "🧃",
  alcohol:       "🍺",
  soda:          "🥃",
  custom:        "🍹",
  other:         "🫗",
};

const drinkLabels = {
  water:         "Water",
  coffee:        "Coffee",
  tea:           "Tea",
  juice:         "Juice",
  protein_shake: "Protein Shake",
  alcohol:       "Alcohol",
  soda:          "Soda",
  custom:        "Custom",
};

const DRINK_CATEGORIES = new Set([
  "water", "coffee", "tea", "juice", "protein_shake", "alcohol", "soda", "custom"
]);

const timeLabels = {
  morning:    "Morning",
  afternoon:  "Afternoon",
  evening:    "Evening",
  late_night: "Late night",
};

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

export default function DayLogCard({ date, log }) {
  const [expanded, setExpanded] = useState(false);

  const hasLog = !!log;
  const score  = hasLog ? calculateDailyScore(log) : null;
  const { label: scoreLabel, color: scoreColor } = score !== null
    ? getScoreLabel(score)
    : { label: "", color: "" };

  const hasMeals = (log?.meals || []).some((m) => !DRINK_CATEGORIES.has(m.category));
  const hasDrinks = (log?.meals || []).some((m) => DRINK_CATEGORIES.has(m.category));

  let aiSuggestions = [];
  if (log?.aiDailySuggestion) {
    try { aiSuggestions = JSON.parse(log.aiDailySuggestion); } catch { /* ignore */ }
  }

  return (
    <article className={`day-log-card ${expanded ? "expanded" : ""}`}>
      {/* ── Collapsed header row — always visible ── */}
      <button
        className="day-log-card-header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="day-log-header-left">
          <span className="day-log-date">{formatDisplayDate(date)}</span>

          {/* Pill summary when collapsed */}
          {!expanded && hasLog && (
            <div className="day-log-mini-pillars">
              {(log.sleep?.fellAsleepTime || (log.naps && log.naps.length > 0)) && (
                <span className="mini-pillar-dot sleep-d" title="Rest logged" />
              )}
              {log.workouts?.length > 0 && (
                <span className="mini-pillar-dot workout-d" title="Workout logged" />
              )}
              {hasMeals && (
                <span className="mini-pillar-dot meal-d" title="Meals logged" />
              )}
              {hasDrinks && (
                <span className="mini-pillar-dot drink-d" title="Drinks logged" />
              )}
            </div>
          )}
        </div>

        <div className="day-log-header-right">
          {score !== null && (
            <div
              className="day-score-badge"
              style={{ color: scoreColor, borderColor: scoreColor }}
            >
              <span className="day-score-number">{score}</span>
              <span className="day-score-label">{scoreLabel}</span>
            </div>
          )}
          {!hasLog && <span className="day-missed-badge">No log</span>}

          {/* Chevron */}
          <svg
            className={`day-log-chevron ${expanded ? "open" : ""}`}
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* ── Expanded detail ── */}
      <div className={`day-log-detail ${expanded ? "open" : ""}`}>
        <div className="day-log-detail-inner">
          {!hasLog ? (
            <p className="day-log-empty">Nothing logged for this day.</p>
          ) : (
            <div className="day-log-sections">

              {/* Rest (Sleep & Naps) */}
              <div className="day-log-section">
                <span className="day-log-section-icon">🌙</span>
                <div className="day-log-section-body">
                  <span className="day-log-section-title">Rest</span>
                  {(log.sleep?.fellAsleepTime || (log.naps && log.naps.length > 0)) ? (
                    <div className="day-log-rest-chips">
                      {log.sleep?.fellAsleepTime && log.sleep?.wokeUpTime && (
                        <span className="day-log-rest-chip">
                          🛌 <strong>Night Sleep</strong> · {formatTimeAMPM(log.sleep.fellAsleepTime)} – {formatTimeAMPM(log.sleep.wokeUpTime)}
                          {log.sleep.crossesMidnight 
                            ? ` (${formatDateShort(log.sleep.fellAsleepDate)} – ${formatDateShort(log.sleep.wokeUpDate)})` 
                            : ` (${formatDateShort(log.sleep.wokeUpDate)})`
                          }
                          {log.sleep.duration > 0 &&
                            <em> · {formatSleepDuration(log.sleep.duration)}</em>
                          }
                        </span>
                      )}

                      {log.naps && log.naps.length > 0 &&
                        log.naps.map((nap, idx) => {
                          const capTime = nap.timeOfDay
                            ? nap.timeOfDay.charAt(0).toUpperCase() + nap.timeOfDay.slice(1)
                            : "";
                          return (
                            <span key={nap._id || idx} className="day-log-rest-chip">
                              😴 <strong>Nap ({capTime})</strong> · {formatTimeAMPM(nap.startTime)} – {formatTimeAMPM(nap.endTime)}
                              <em> · {formatSleepDuration(nap.duration)}</em>
                            </span>
                          );
                        })
                      }
                    </div>
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
                  {hasMeals ? (
                    <div className="day-log-meals">
                      {log.meals
                        .filter((m) => !DRINK_CATEGORIES.has(m.category))
                        .map((meal, i) => (
                          <span key={i} className="day-log-meal-chip">
                            {mealCategoryIcons[meal.category]}{" "}
                            {mealCategoryLabels[meal.category] || meal.category}
                            {meal.items?.length > 0 && (
                              <em>
                                {" "}·{" "}
                                {meal.items
                                  .map((it) => `${it.name}${it.amount ? ` (${it.amount})` : ""}`)
                                  .join(", ")}
                              </em>
                            )}
                          </span>
                        ))}
                    </div>
                  ) : (
                    <span className="day-log-section-missing">Not logged</span>
                  )}
                </div>
              </div>

              {/* Drinks */}
              {hasDrinks && (
                <div className="day-log-section">
                  <span className="day-log-section-icon">💧</span>
                  <div className="day-log-section-body">
                    <span className="day-log-section-title">Drinks</span>
                    <div className="day-log-drinks">
                      {log.meals
                        .filter((m) => DRINK_CATEGORIES.has(m.category))
                        .map((meal, i) =>
                          meal.items?.map((item, j) => {
                            const label = drinkLabels[meal.category] || meal.category;
                            const hasCustomName = item.name && item.name.toLowerCase() !== label.toLowerCase();
                            const suffix = item.times && item.times > 1 ? ` × ${item.times}` : "";
                            return (
                              <span key={`${i}-${j}`} className="day-log-drink-chip">
                                {drinkIcons[meal.category] || "🫗"}{" "}
                                {label} · {item.amount}{suffix}
                                {hasCustomName && <em> ({item.name})</em>}
                              </span>
                            );
                          })
                        )}
                    </div>
                  </div>
                </div>
              )}

              {/* AI suggestions */}
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
        </div>
      </div>
    </article>
  );
}
