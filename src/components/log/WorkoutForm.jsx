import { useState } from "react";
import toast from "react-hot-toast";

const TIME_OPTIONS = [
  { value: "morning",    label: "🌅 Morning" },
  { value: "afternoon",  label: "☀️ Afternoon" },
  { value: "evening",    label: "🌆 Evening" },
  { value: "late_night", label: "🌙 Late Night" },
];

const emptyExercise = () => ({
  id: Date.now() + Math.random(),
  name: "",
  type: "sets_reps",
  sets: 3,
  reps: 10,
  durationMinutes: 30,
});

export default function WorkoutForm({ sessions, onSave, isPending }) {
  const [formTime, setFormTime]         = useState("morning");
  const [formExercises, setFormExercises] = useState([emptyExercise()]);

  const addExercise = () => setFormExercises([...formExercises, emptyExercise()]);

  const removeExercise = (id) => {
    if (formExercises.length === 1) return;
    setFormExercises(formExercises.filter((e) => e.id !== id));
  };

  const updateExercise = (id, field, value) =>
    setFormExercises(formExercises.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const handleSaveSession = () => {
    const valid = formExercises.every((e) => {
      if (!e.name.trim()) return false;
      if (e.type === "sets_reps" && (!e.sets || !e.reps)) return false;
      if (e.type === "duration" && !e.durationMinutes) return false;
      return true;
    });
    if (!valid) { toast.error("Fill in all exercise fields"); return; }

    const newSession = {
      timeOfDay: formTime,
      exercises: formExercises.map((e) => ({
        name: e.name.trim(),
        type: e.type,
        sets: e.type === "sets_reps" ? Number(e.sets) : undefined,
        reps: e.type === "sets_reps" ? Number(e.reps) : undefined,
        durationMinutes: e.type === "duration" ? Number(e.durationMinutes) : undefined,
      })),
    };

    onSave([...(sessions || []), newSession]);
    setFormTime("morning");
    setFormExercises([emptyExercise()]);
    toast.success("Session saved");
  };

  const removeSession = (idx) => {
    onSave((sessions || []).filter((_, i) => i !== idx));
  };

  const timeLabel = (val) => TIME_OPTIONS.find((t) => t.value === val)?.label || val;

  return (
    <div className="workout-form-wrap">
      <h3 className="form-card-title">Workout Details</h3>

      {/* Saved sessions list */}
      {sessions?.length > 0 && (
        <div className="saved-sessions-container">
          <h4 className="saved-title-label">LOGGED SESSIONS</h4>
          <div className="saved-sessions-list">
            {sessions.map((s, i) => (
              <div key={i} className="saved-session-row-card">
                <span className="session-time-pills">{timeLabel(s.timeOfDay)}</span>
                <span className="session-exercises-list">
                  {s.exercises.map((e) => {
                    const detail = e.type === "sets_reps"
                      ? `${e.sets}×${e.reps}`
                      : `${e.durationMinutes}m`;
                    return `${e.name} (${detail})`;
                  }).join(" · ")}
                </span>
                <button
                  type="button"
                  className="saved-session-delete-btn"
                  onClick={() => removeSession(i)}
                  title="Remove session"
                >✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add new session card section */}
      <div className="new-session-inputs">
        {sessions?.length > 0 && (
          <div className="new-entry-divider">
            <span>Add another session</span>
          </div>
        )}

        {/* Dropdown styled */}
        <div className="workout-field-row">
          <label className="field-label">SESSION TIME</label>
          <div className="styled-select-wrapper">
            <select
              className="styled-dropdown-select"
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Exercises table / cards */}
        <div className="exercise-table-container">
          <div className="exercise-table-header desktop-only">
            <span className="col-main">EXERCISE</span>
            <span className="col-type">TYPE</span>
            <span className="col-num">SETS</span>
            <span className="col-num">REPS / MIN</span>
            <span className="col-action"></span>
          </div>

          <div className="exercise-rows-list">
            {formExercises.map((ex, index) => (
              <div key={ex.id} className="exercise-table-row">
                {/* Exercise name */}
                <div className="table-col col-main">
                  <span className="mobile-field-label">EXERCISE</span>
                  <input
                    className="styled-table-input"
                    type="text"
                    placeholder="e.g. Bench Press"
                    value={ex.name}
                    onChange={(e) => updateExercise(ex.id, "name", e.target.value)}
                  />
                </div>

                {/* Type toggle chips */}
                <div className="table-col col-type">
                  <span className="mobile-field-label">TYPE</span>
                  <div className="toggle-chips-container">
                    <button
                      type="button"
                      className={`toggle-chip-btn ${ex.type === "sets_reps" ? "active" : ""}`}
                      onClick={() => updateExercise(ex.id, "type", "sets_reps")}
                    >
                      Sets
                    </button>
                    <button
                      type="button"
                      className={`toggle-chip-btn ${ex.type === "duration" ? "active" : ""}`}
                      onClick={() => updateExercise(ex.id, "type", "duration")}
                    >
                      Time
                    </button>
                  </div>
                </div>

                {/* Sets stepper */}
                <div className="table-col col-num">
                  <span className="mobile-field-label">SETS</span>
                  <div className="stepper-control-wrap">
                    <button
                      type="button"
                      className="stepper-action-btn"
                      disabled={ex.type !== "sets_reps"}
                      onClick={() => updateExercise(ex.id, "sets", Math.max(1, Number(ex.sets || 0) - 1))}
                    >-</button>
                    <span className="stepper-value-text">
                      {ex.type === "sets_reps" ? ex.sets : "—"}
                    </span>
                    <button
                      type="button"
                      className="stepper-action-btn"
                      disabled={ex.type !== "sets_reps"}
                      onClick={() => updateExercise(ex.id, "sets", Number(ex.sets || 0) + 1)}
                    >+</button>
                  </div>
                </div>

                {/* Reps or Min input */}
                <div className="table-col col-num">
                  <span className="mobile-field-label">
                    {ex.type === "sets_reps" ? "REPS" : "MINUTES"}
                  </span>
                  <input
                    className="styled-table-input num-input"
                    type="number"
                    min="1"
                    placeholder={ex.type === "sets_reps" ? "12" : "30"}
                    value={ex.type === "sets_reps" ? ex.reps : ex.durationMinutes}
                    onChange={(e) =>
                      updateExercise(
                        ex.id,
                        ex.type === "sets_reps" ? "reps" : "durationMinutes",
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* Remove row */}
                <div className="table-col col-action">
                  <button
                    type="button"
                    className="table-row-delete-btn"
                    onClick={() => removeExercise(ex.id)}
                    disabled={formExercises.length === 1}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                    <span className="mobile-only delete-text">Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action row buttons */}
        <div className="workout-form-actions">
          <button
            type="button"
            className="dashed-ghost-add-btn"
            onClick={addExercise}
          >
            + Add Exercise
          </button>
          <button
            type="button"
            className="solid-purple-save-btn"
            onClick={handleSaveSession}
            disabled={isPending}
          >
            Apply Session
          </button>
        </div>
      </div>
    </div>
  );
}
