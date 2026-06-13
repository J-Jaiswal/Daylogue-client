import { useState } from "react";
import toast from "react-hot-toast";

const TIME_OPTIONS = ["morning", "afternoon", "evening", "late_night"];

const emptyExercise = () => ({
  id: Date.now(),
  name: "",
  type: "sets_reps",
  sets: "",
  reps: "",
  durationMinutes: "",
});

export default function WorkoutForm({ sessions, onSave }) {
  const [timeOfDay, setTimeOfDay] = useState("morning");
  const [exercises, setExercises] = useState([emptyExercise()]);

  const addExercise = () => {
    setExercises([...exercises, emptyExercise()]);
  };

  const removeExercise = (id) => {
    if (exercises.length === 1) return;
    setExercises(exercises.filter((e) => e.id !== id));
  };

  const updateExercise = (id, field, value) => {
    setExercises(
      exercises.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

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
        durationMinutes:
          e.type === "duration" ? Number(e.durationMinutes) : undefined,
      })),
    };

    // append new session to existing sessions
    onSave([...(sessions || []), session]);

    // reset form
    setTimeOfDay("morning");
    setExercises([emptyExercise()]);
    toast.success("Workout session added");
  };

  return (
    <div className="workout-section-card">
      <span className="workout-card-header-label">WORKOUT</span>

      {/* existing sessions summary */}
      {sessions?.length > 0 && (
        <div className="workout-sessions-summary-wrap">
          {sessions.map((s, i) => (
            <div key={i} className="workout-session-badge">
              {s.timeOfDay.toUpperCase()} · {s.exercises.length} EXERCISE{s.exercises.length > 1 ? "S" : ""}
            </div>
          ))}
        </div>
      )}

      {/* time of day */}
      <div className="workout-input-group">
        <span className="workout-input-label">SESSION TIME</span>
        <div className="workout-time-selector-row">
          {TIME_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              className={`workout-time-pill-btn ${timeOfDay === t ? "active" : ""}`}
              onClick={() => setTimeOfDay(t)}
            >
              {t.replace("_", " ").toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* exercises */}
      <div className="workout-exercises-list-container">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="workout-exercise-row-card">
            <div className="workout-exercise-row-top">
              <input
                className="workout-exercise-name-input"
                type="text"
                placeholder="Exercise name (e.g. Bicep Curl)"
                value={exercise.name}
                onChange={(e) =>
                  updateExercise(exercise.id, "name", e.target.value)
                }
              />

              <select
                value={exercise.type}
                onChange={(e) =>
                  updateExercise(exercise.id, "type", e.target.value)
                }
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
                    onChange={(e) =>
                      updateExercise(exercise.id, "sets", e.target.value)
                    }
                  />
                  <span className="workout-exercise-multiply">×</span>
                  <input
                    type="number"
                    placeholder="Reps"
                    value={exercise.reps}
                    min="1"
                    className="workout-exercise-num-input"
                    onChange={(e) =>
                      updateExercise(exercise.id, "reps", e.target.value)
                    }
                  />
                </div>
              ) : (
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={exercise.durationMinutes}
                  min="1"
                  className="workout-exercise-duration-input"
                  onChange={(e) =>
                    updateExercise(
                      exercise.id,
                      "durationMinutes",
                      e.target.value,
                    )
                  }
                />
              )}
            </div>
          </div>
        ))}
      </div>

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
