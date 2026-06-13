import { useState } from "react";
import toast from "react-hot-toast";

const TIME_OPTIONS = [
  { value: "morning",    label: "Morning" },
  { value: "afternoon",  label: "Afternoon" },
  { value: "evening",    label: "Evening" },
  { value: "late_night", label: "Late Night" },
];

const emptyExercise = () => ({
  id: Date.now() + Math.random(),
  name: "",
  type: "sets_reps",
  sets: "",
  reps: "",
  durationMinutes: "",
});

export default function WorkoutForm({ sessions, onSave }) {
  const [timeOfDay, setTimeOfDay] = useState("morning");
  const [exercises, setExercises] = useState([emptyExercise()]);

  const addExercise = () => setExercises([...exercises, emptyExercise()]);

  const removeExercise = (id) => {
    if (exercises.length === 1) return;
    setExercises(exercises.filter((e) => e.id !== id));
  };

  const updateExercise = (id, field, value) =>
    setExercises(exercises.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const handleSave = () => {
    const valid = exercises.every((e) => {
      if (!e.name.trim()) return false;
      if (e.type === "sets_reps" && (!e.sets || !e.reps)) return false;
      if (e.type === "duration" && !e.durationMinutes) return false;
      return true;
    });

    if (!valid) {
      toast.error("Fill in all exercise fields");
      return;
    }

    const session = {
      timeOfDay,
      exercises: exercises.map((e) => ({
        name: e.name.trim(),
        type: e.type,
        sets: e.type === "sets_reps" ? Number(e.sets) : undefined,
        reps: e.type === "sets_reps" ? Number(e.reps) : undefined,
        durationMinutes: e.type === "duration" ? Number(e.durationMinutes) : undefined,
      })),
    };

    onSave([...(sessions || []), session]);
    setTimeOfDay("morning");
    setExercises([emptyExercise()]);
    toast.success("Workout session added");
  };

  const hasPreview = exercises.some((e) => e.name.trim());
  const selectedTime = TIME_OPTIONS.find((t) => t.value === timeOfDay);

  return (
    <div className="workout-section-card">
      <span className="workout-card-header-label">WORKOUT</span>

      {/* Existing session badges */}
      {sessions?.length > 0 && (
        <div className="workout-sessions-summary-wrap">
          {sessions.map((s, i) => (
            <div key={i} className="workout-session-badge">
              {s.timeOfDay.toUpperCase()} · {s.exercises.length} EXERCISE{s.exercises.length > 1 ? "S" : ""}
            </div>
          ))}
        </div>
      )}

      {/* Session time — dropdown */}
      <div className="workout-input-group">
        <span className="workout-input-label">SESSION TIME</span>
        <select
          className="workout-time-select"
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
        >
          {TIME_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Exercises */}
      <div className="workout-exercises-list-container">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="workout-exercise-row-card">
            <div className="workout-exercise-row-top">
              <input
                className="workout-exercise-name-input"
                type="text"
                placeholder="Exercise name (e.g. Bicep Curl)"
                value={exercise.name}
                onChange={(e) => updateExercise(exercise.id, "name", e.target.value)}
              />

              <select
                value={exercise.type}
                onChange={(e) => updateExercise(exercise.id, "type", e.target.value)}
                className="workout-exercise-type-select"
              >
                <option value="sets_reps">Sets × Reps</option>
                <option value="duration">Duration</option>
              </select>

              <button
                type="button"
                className="workout-exercise-remove-btn"
                onClick={() => removeExercise(exercise.id)}
                disabled={exercises.length === 1}
              >
                ✕
              </button>
            </div>

            <div className="workout-exercise-row-bottom">
              {exercise.type === "sets_reps" ? (
                <div className="workout-sets-reps-inputs">
                  <input
                    type="number"
                    placeholder="Sets"
                    value={exercise.sets}
                    min="1"
                    className="workout-exercise-num-input"
                    onChange={(e) => updateExercise(exercise.id, "sets", e.target.value)}
                  />
                  <span className="workout-exercise-multiply">×</span>
                  <input
                    type="number"
                    placeholder="Reps"
                    value={exercise.reps}
                    min="1"
                    className="workout-exercise-num-input"
                    onChange={(e) => updateExercise(exercise.id, "reps", e.target.value)}
                  />
                </div>
              ) : (
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={exercise.durationMinutes}
                  min="1"
                  className="workout-exercise-duration-input"
                  onChange={(e) => updateExercise(exercise.id, "durationMinutes", e.target.value)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Live preview */}
      {hasPreview && (
        <div className="log-preview-card">
          <span className="log-preview-label">PREVIEW</span>
          <div className="log-preview-session-header">
            <span className="log-preview-session-time">{selectedTime?.label}</span>
          </div>
          <div className="log-preview-chips">
            {exercises
              .filter((e) => e.name.trim())
              .map((e, idx) => (
                <span key={idx} className="log-preview-chip workout-chip">
                  💪 {e.name}
                  {e.type === "sets_reps" && e.sets && e.reps && (
                    <em> {e.sets}×{e.reps}</em>
                  )}
                  {e.type === "duration" && e.durationMinutes && (
                    <em> {e.durationMinutes}m</em>
                  )}
                </span>
              ))}
          </div>
        </div>
      )}

      <div className="workout-action-buttons">
        <button type="button" className="workout-add-exercise-btn" onClick={addExercise}>
          + Add Exercise
        </button>
        <button type="button" className="workout-save-session-btn" onClick={handleSave}>
          Save Session
        </button>
      </div>
    </div>
  );
}
