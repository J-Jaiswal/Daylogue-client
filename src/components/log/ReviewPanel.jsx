import React from "react";

export default function ReviewPanel({
  sleepDone,
  sleepText,
  naps,
  workouts,
  meals,
  workoutDone,
  mealsDone,
  workoutDraft,
  mealDraft,
  handleSaveSleep,
  handleSaveFoodExercise,
  isPending,
}) {
  return (
    <div className="log-review-panel">
      <div className="review-header">
        <h2 className="review-title">Review &amp; Upload Today's Logs</h2>
        <p className="review-subtitle">
          Verify your manual entries and sleep logs before uploading them.
        </p>
      </div>

      <div className="review-grid">
        {/* Sleep Log Review */}
        <div className="review-card" style={{ "--tc": "var(--text-3)" }}>
          <div>
            <div className="zone-header">
              <span className="zone-label-text" style={{ color: "var(--tc)" }}>Sleep &amp; Naps</span>
            </div>
            <div className="review-card-body">
              <div className="review-item-group">
                <div className="review-group-label" style={{ "--tc": "var(--text-3)" }}>Night Sleep</div>
                {sleepDone ? (
                  <div className="log-entry" style={{ margin: "4px 0" }}>
                    <div className="log-entry-left">
                      <span className="log-entry-icon">🌙</span>
                      <div>
                        <div className="log-entry-name">Sleep Logged</div>
                        <div className="log-entry-meta">{sleepText}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="review-empty-state">No sleep logged yet today.</div>
                )}
              </div>

              <div className="review-item-group">
                <div className="review-group-label" style={{ "--tc": "var(--text-3)" }}>Naps Logged</div>
                {naps && naps.length > 0 ? (
                  naps.map((nap, idx) => (
                    <div key={idx} className="log-entry" style={{ margin: "4px 0" }}>
                      <div className="log-entry-left">
                        <span className="log-entry-icon">😴</span>
                        <div>
                          <div className="log-entry-name">Nap ({nap.duration}m)</div>
                          {nap.notes && <div className="log-entry-meta">{nap.notes}</div>}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="review-empty-state">No naps logged.</div>
                )}
              </div>
            </div>
          </div>

          <div className="review-card-footer">
            <button
              className="review-upload-btn sleep-btn"
              onClick={handleSaveSleep}
              disabled={isPending || !sleepDone}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: "6px" }}
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
              </svg>
              Upload Sleep Data
            </button>
            <p className="review-hint">
              Synchronize tracked sleep and nap information with the server.
            </p>
          </div>
        </div>

        {/* Diet & Workouts Review */}
        <div className="review-card" style={{ "--tc": "var(--text-3)" }}>
          <div>
            <div className="zone-header">
              <span className="zone-label-text" style={{ color: "var(--tc)" }}>Food &amp; Exercise</span>
            </div>
            <div className="review-card-body">
              <div className="review-item-group">
                <div className="review-group-label" style={{ "--tc": "var(--text-3)" }}>Workouts Drafted</div>
                {workoutDone ? (
                  workouts.map((s, idx) => (
                    <div key={idx} className="log-entry" style={{ margin: "4px 0" }}>
                      <div className="log-entry-left">
                        <span className="log-entry-icon">🏋️</span>
                        <div>
                          <div className="log-entry-name" style={{ textTransform: "capitalize" }}>
                            {s.timeOfDay} Session
                          </div>
                          <div className="log-entry-meta">
                            {s.exercises
                              .map((e) => {
                                const detail =
                                  e.type === "sets_reps"
                                    ? `${e.sets}×${e.reps}`
                                    : `${e.durationMinutes}m`;
                                return `${e.name} (${detail})`;
                              })
                              .join(" · ")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="review-empty-state">No workouts logged yet.</div>
                )}
              </div>

              <div className="review-item-group">
                <div className="review-group-label" style={{ "--tc": "var(--text-3)" }}>Meals &amp; Drinks Drafted</div>
                {mealsDone ? (
                  meals.map((m, idx) => (
                    <div key={idx} className="log-entry" style={{ margin: "4px 0" }}>
                      <div className="log-entry-left">
                        <span className="log-entry-icon">🍳</span>
                        <div>
                          <div className="log-entry-name" style={{ textTransform: "capitalize" }}>
                            {m.category}
                          </div>
                          <div className="log-entry-meta">
                            {m.items.map((i) => `${i.name} (${i.amount})`).join(" · ")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="review-empty-state">No meals logged yet.</div>
                )}
              </div>
            </div>
          </div>

          <div className="review-card-footer">
            {workoutDraft === null && mealDraft === null ? (
              <div className="review-success-badge">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginRight: "4px" }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                All changes saved to database
              </div>
            ) : (
              <>
                <button
                  className="review-upload-btn diet-btn"
                  onClick={handleSaveFoodExercise}
                  disabled={isPending || (!workoutDone && !mealsDone)}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: "6px" }}
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                  </svg>
                  Upload Food &amp; Exercise
                </button>
                <p className="review-hint">
                  Upload your drafted exercises and meals to sync with the database.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
