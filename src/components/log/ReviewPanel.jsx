import React, { useState } from "react";

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

const formatDurationHM = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
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

export default function ReviewPanel({
  todayLog,
  sleepDraft,
  napDrafts,
  workoutDraft,
  mealDraft,
  handleSaveSleep,
  handleSaveFoodExercise,
  deleteSleep,
  deleteNap,
  deleteDbWorkout,
  deleteDbMeal,
  deleteWorkoutDraft,
  deleteMealDraft,
  isPending,
}) {
  const [showDeleteSleepModal, setShowDeleteSleepModal] = useState(false);
  const [dbSleepToDelete, setDbSleepToDelete] = useState(false);

  // Draft flags
  const hasSleepDraft = !!sleepDraft;
  const hasNapDrafts = !!(napDrafts && napDrafts.length > 0);
  const hasWorkoutDrafts = !!(workoutDraft && workoutDraft.length > 0);
  const hasMealDrafts = !!(mealDraft && mealDraft.length > 0);

  const hasAnySleepDrafts = hasSleepDraft || hasNapDrafts;
  const hasAnyFoodExerciseDrafts = hasWorkoutDrafts || hasMealDrafts;

  // Saved database flags
  const hasSavedSleep = !!(todayLog?.sleep && todayLog.sleep.fellAsleepTime && todayLog.sleep.wokeUpTime);
  const hasSavedNaps = !!(todayLog?.naps && todayLog.naps.length > 0);
  const hasSavedWorkouts = !!(todayLog?.workouts && todayLog.workouts.length > 0);
  const hasSavedMeals = !!(todayLog?.meals && todayLog.meals.length > 0);
  const hasUploadedData = hasSavedSleep || hasSavedNaps || hasSavedWorkouts || hasSavedMeals;

  const handleDeleteSleepClick = (isDbRecord = false) => {
    setDbSleepToDelete(isDbRecord);
    setShowDeleteSleepModal(true);
  };

  const confirmDeleteSleep = () => {
    deleteSleep();
    setShowDeleteSleepModal(false);
  };

  return (
    <div className="log-review-panel">
      <div className="review-header">
        <h2 className="review-title">Review &amp; Upload Today's Logs</h2>
        <p className="review-subtitle">
          Verify your manual entries and sleep logs before uploading them.
        </p>
      </div>

      <div className="review-grid">
        {/* Sleep & Naps Card (Drafts) */}
        <div className="review-card" style={{ "--tc": "var(--text-3)" }}>
          <div>
            <div className="zone-header">
              <span className="zone-label-text" style={{ color: "var(--tc)" }}>Sleep &amp; Naps (Drafts)</span>
            </div>
            <div className="review-card-body">
              {/* Draft Night Sleep */}
              <div className="review-item-group">
                <div className="review-group-label" style={{ "--tc": "var(--text-3)" }}>Night Sleep Draft</div>
                {hasSleepDraft ? (
                  <div className="log-entry" style={{ margin: "4px 0" }}>
                    <div className="log-entry-left">
                      <span className="log-entry-icon">🌙</span>
                      <div>
                        <div className="log-entry-name">Sleep Logged</div>
                        <div className="log-entry-meta">
                          {formatTimeAMPM(sleepDraft.fellAsleepTime)} – {formatTimeAMPM(sleepDraft.wokeUpTime)}
                          {sleepDraft.crossesMidnight
                            ? ` (${formatDateShort(sleepDraft.fellAsleepDate)} – ${formatDateShort(sleepDraft.wokeUpDate)})`
                            : ` (${formatDateShort(sleepDraft.wokeUpDate)})`
                          }
                          {" · "}
                          {formatDurationHM(sleepDraft.duration)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rm-btn"
                      onClick={() => handleDeleteSleepClick(false)}
                      title="Delete sleep draft"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="review-empty-state">No sleep draft pending.</div>
                )}
              </div>

              {/* Draft Naps */}
              <div className="review-item-group">
                <div className="review-group-label" style={{ "--tc": "var(--text-3)" }}>Naps Drafted</div>
                {hasNapDrafts ? (
                  napDrafts.map((nap) => {
                    const capTimeOfDay = nap.timeOfDay
                      ? nap.timeOfDay.charAt(0).toUpperCase() + nap.timeOfDay.slice(1)
                      : "";
                    return (
                      <div key={nap._id} className="log-entry" style={{ margin: "4px 0" }}>
                        <div className="log-entry-left">
                          <span className="log-entry-icon">😴</span>
                          <div>
                            <div className="log-entry-name">Nap ({capTimeOfDay})</div>
                            <div className="log-entry-meta">
                              {formatTimeAMPM(nap.startTime)} – {formatTimeAMPM(nap.endTime)}
                              {" · "}
                              {formatDurationHM(nap.duration)}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="rm-btn"
                          onClick={() => deleteNap(nap._id)}
                          title="Remove nap draft"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="review-empty-state">No naps drafted.</div>
                )}
              </div>
            </div>
          </div>

          <div className="review-card-footer">
            {!hasAnySleepDrafts ? (
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
                No pending sleep/nap drafts
              </div>
            ) : (
              <>
                <button
                  className="review-upload-btn sleep-btn"
                  onClick={handleSaveSleep}
                  disabled={isPending}
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
              </>
            )}
          </div>
        </div>

        {/* Food & Exercise Card (Drafts) */}
        <div className="review-card" style={{ "--tc": "var(--text-3)" }}>
          <div>
            <div className="zone-header">
              <span className="zone-label-text" style={{ color: "var(--tc)" }}>Food &amp; Exercise (Drafts)</span>
            </div>
            <div className="review-card-body">
              {/* Draft Workouts */}
              <div className="review-item-group">
                <div className="review-group-label" style={{ "--tc": "var(--text-3)" }}>Workouts Drafted</div>
                {hasWorkoutDrafts ? (
                  workoutDraft.map((s, idx) => (
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
                      <button
                        type="button"
                        className="rm-btn"
                        onClick={() => deleteWorkoutDraft(idx)}
                        title="Remove workout draft"
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="review-empty-state">No workouts drafted.</div>
                )}
              </div>

              {/* Draft Meals */}
              <div className="review-item-group">
                <div className="review-group-label" style={{ "--tc": "var(--text-3)" }}>Meals &amp; Drinks Drafted</div>
                {hasMealDrafts ? (
                  mealDraft.map((m, idx) => (
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
                      <button
                        type="button"
                        className="rm-btn"
                        onClick={() => deleteMealDraft(idx)}
                        title="Remove meal draft"
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="review-empty-state">No meals drafted.</div>
                )}
              </div>
            </div>
          </div>

          <div className="review-card-footer">
            {!hasAnyFoodExerciseDrafts ? (
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
                No pending food/exercise drafts
              </div>
            ) : (
              <>
                <button
                  className="review-upload-btn diet-btn"
                  onClick={handleSaveFoodExercise}
                  disabled={isPending}
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

      {/* Today's Uploaded Snapshot */}
      {hasUploadedData && (
        <div className="uploaded-snapshot-section">
          <div className="snapshot-header">
            <h3 className="snapshot-title">
              <span className="badge-dot" /> Today's Uploaded Logs
            </h3>
            <p className="snapshot-subtitle">These logs are saved in the database. Deleting them here will update your profile.</p>
          </div>

          <div className="snapshot-grid">
            {/* Saved Sleep */}
            {hasSavedSleep && (
              <div className="log-entry">
                <div className="log-entry-left">
                  <span className="log-entry-icon">🌙</span>
                  <div>
                    <div className="log-entry-name">Saved Sleep Session</div>
                    <div className="log-entry-meta">
                      {formatTimeAMPM(todayLog.sleep.fellAsleepTime)} – {formatTimeAMPM(todayLog.sleep.wokeUpTime)}
                      {todayLog.sleep.crossesMidnight
                        ? ` (${formatDateShort(todayLog.sleep.fellAsleepDate)} – ${formatDateShort(todayLog.sleep.wokeUpDate)})`
                        : ` (${formatDateShort(todayLog.sleep.wokeUpDate)})`
                      }
                      {" · "}
                      {formatDurationHM(todayLog.sleep.duration)}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="rm-btn snapshot-delete"
                  onClick={() => handleDeleteSleepClick(true)}
                  title="Delete sleep from database"
                >
                  🗑️
                </button>
              </div>
            )}

            {/* Saved Naps */}
            {hasSavedNaps &&
              todayLog.naps.map((nap) => {
                const capTimeOfDay = nap.timeOfDay
                  ? nap.timeOfDay.charAt(0).toUpperCase() + nap.timeOfDay.slice(1)
                  : "";
                return (
                  <div key={nap._id} className="log-entry">
                    <div className="log-entry-left">
                      <span className="log-entry-icon">😴</span>
                      <div>
                        <div className="log-entry-name">Saved Nap ({capTimeOfDay})</div>
                        <div className="log-entry-meta">
                          {formatTimeAMPM(nap.startTime)} – {formatTimeAMPM(nap.endTime)}
                          {" · "}
                          {formatDurationHM(nap.duration)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rm-btn snapshot-delete"
                      onClick={() => deleteNap(nap._id)}
                      title="Delete nap from database"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}

            {/* Saved Workouts */}
            {hasSavedWorkouts &&
              todayLog.workouts.map((s, idx) => (
                <div key={idx} className="log-entry">
                  <div className="log-entry-left">
                    <span className="log-entry-icon">🏋️</span>
                    <div>
                      <div className="log-entry-name" style={{ textTransform: "capitalize" }}>
                        Saved {s.timeOfDay} Session
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
                  <button
                    type="button"
                    className="rm-btn snapshot-delete"
                    onClick={() => deleteDbWorkout(idx)}
                    title="Delete workout from database"
                  >
                    🗑️
                  </button>
                </div>
              ))}

            {/* Saved Meals */}
            {hasSavedMeals &&
              todayLog.meals.map((m, idx) => (
                <div key={idx} className="log-entry">
                  <div className="log-entry-left">
                    <span className="log-entry-icon">🍳</span>
                    <div>
                      <div className="log-entry-name" style={{ textTransform: "capitalize" }}>
                        Saved {m.category}
                      </div>
                      <div className="log-entry-meta">
                        {m.items.map((i) => `${i.name} (${i.amount})`).join(" · ")}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rm-btn snapshot-delete"
                    onClick={() => deleteDbMeal(idx)}
                    title="Delete meal from database"
                  >
                    🗑️
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Delete Sleep Confirmation Modal */}
      {showDeleteSleepModal && (
        <div className="sleep-modal-backdrop">
          <div className="sleep-modal-content">
            <h3 className="sleep-modal-title">Delete sleep entry?</h3>
            <p className="sleep-modal-text">
              {dbSleepToDelete
                ? "Are you sure you want to delete your sleep session from the database? This cannot be undone."
                : "Are you sure you want to delete your drafted sleep session? This will remove it from your drafts."}
            </p>
            <div className="sleep-modal-actions">
              <button
                type="button"
                className="pill-button primary-pill"
                style={{ background: "#ef4444", width: "auto" }}
                onClick={confirmDeleteSleep}
              >
                Yes, delete
              </button>
              <button
                type="button"
                className="pill-button ghost-pill"
                style={{ width: "auto" }}
                onClick={() => setShowDeleteSleepModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
