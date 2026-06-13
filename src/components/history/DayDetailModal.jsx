import { formatDisplayDate, formatSleepDuration } from "../../utils/dateUtils";

const categoryLabels = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
  junk_food: "Junk food",
  cheat_meal: "Cheat meal",
};

const timeLabels = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  late_night: "Late night",
};

export default function DayDetailModal({ date, log, onClose }) {
  if (!date) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{formatDisplayDate(date)}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            Close
          </button>
        </div>

        {!log ? (
          <p className="modal-empty">No log recorded for this day.</p>
        ) : (
          <div className="modal-body">
            <div className="modal-section">
              <h4>Sleep</h4>
              {log.sleep?.bedTime ? (
                <div className="modal-detail-row">
                  <span>Bed: {log.sleep.bedTime}</span>
                  <span>Wake: {log.sleep.wakeTime}</span>
                  {log.sleep.durationMinutes && (
                    <span>{formatSleepDuration(log.sleep.durationMinutes)}</span>
                  )}
                </div>
              ) : (
                <p className="modal-not-logged">Not logged</p>
              )}
            </div>

            <div className="modal-section">
              <h4>Workouts</h4>
              {log.workouts?.length > 0 ? (
                log.workouts.map((session, i) => (
                  <div key={i} className="modal-workout-session">
                    <div className="modal-session-time">
                      {timeLabels[session.timeOfDay] || session.timeOfDay}
                    </div>
                    <div className="modal-exercises">
                      {session.exercises.map((ex, j) => (
                        <div key={j} className="modal-exercise-row">
                          <span className="modal-exercise-name">{ex.name}</span>
                          <span className="modal-exercise-detail">
                            {ex.type === "sets_reps"
                              ? `${ex.sets} sets x ${ex.reps} reps`
                              : `${ex.durationMinutes} min`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="modal-not-logged">Not logged</p>
              )}
            </div>

            <div className="modal-section">
              <h4>Meals</h4>
              {log.meals?.length > 0 ? (
                log.meals.map((meal, i) => (
                  <div key={i} className="modal-meal">
                    <div className="modal-meal-category">
                      {categoryLabels[meal.category] || meal.category}
                    </div>
                    <div className="modal-meal-items">
                      {meal.items.map((item, j) => (
                        <span key={j} className="modal-meal-item">
                          {item.amount} {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="modal-not-logged">Not logged</p>
              )}
            </div>

            {log.aiDailySuggestion && (() => {
              let parsedSuggestions = [];
              try {
                parsedSuggestions = JSON.parse(log.aiDailySuggestion);
              } catch {
                return null;
              }
              return (
                <div className="modal-section modal-ai-section">
                  <h4>AI Suggestions That Day</h4>
                  <div className="modal-ai-suggestions">
                    {parsedSuggestions.map((s, i) => (
                      <div key={i} className="modal-ai-card">
                        <span className="modal-ai-category">{s.category}</span>
                        <p>{s.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
