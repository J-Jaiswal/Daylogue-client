import { useState } from "react";
import toast from "react-hot-toast";

const TIME_OPTIONS = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "late_night", label: "Late night" },
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
  const [formTime, setFormTime] = useState("morning");
  const [formExercises, setFormExercises] = useState([emptyExercise()]);

  const addExercise = () => setFormExercises([...formExercises, emptyExercise()]);

  const removeExercise = (id) => {
    if (formExercises.length === 1) return;
    setFormExercises(formExercises.filter((e) => e.id !== id));
  };

  const updateExercise = (id, field, value) =>
    setFormExercises(
      formExercises.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );

  const handleSaveSession = () => {
    const valid = formExercises.every((e) => {
      if (!e.name.trim()) return false;
      if (e.type === "sets_reps" && (!e.sets || !e.reps)) return false;
      if (e.type === "duration" && !e.durationMinutes) return false;
      return true;
    });
    if (!valid) {
      toast.error("Fill in all exercise fields");
      return;
    }

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

  const timeLabel = (val) =>
    TIME_OPTIONS.find((t) => t.value === val)?.label || val;

  return (
    <div className="workout-form-container">
      {/* Saved sessions list */}
      <div className="section-label">LOGGED TODAY</div>
      {!sessions || sessions.length === 0 ? (
        <div style={{ color: "var(--text-3)", fontSize: "13.5px", fontStyle: "italic", padding: "4px 0 16px" }}>
          No workouts yet.
        </div>
      ) : (
        <div style={{ marginBottom: "16px" }}>
          {sessions.map((s, idx) => (
            <div key={idx} className="log-entry">
              <div className="log-entry-left">
                <span className="log-entry-icon">🏋️</span>
                <div>
                  <div className="log-entry-name" style={{ textTransform: "capitalize" }}>
                    {timeLabel(s.timeOfDay)} Session
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
                onClick={() => removeSession(idx)}
                title="Remove session"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input zone */}
      <div className="input-zone" style={{ "--zc": "#EF9F27" }}>
        <div className="zone-header">
          <span className="zone-label-text">ADD SESSION</span>
        </div>

        <div className="field-wrap">
          <div className="field-label">SESSION TIME</div>
          <select
            value={formTime}
            onChange={(e) => setFormTime(e.target.value)}
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="zone-header" style={{ marginTop: "16px", marginBottom: "10px" }}>
          <span className="field-label" style={{ marginBottom: 0 }}>EXERCISES</span>
          <button
            type="button"
            className="btn-ghost"
            style={{ "--zc": "#EF9F27" }}
            onClick={addExercise}
          >
            + Add exercise
          </button>
        </div>

        {/* Exercises inputs list */}
        <div className="workout-grid-rows">
          {formExercises.map((ex) => (
            <div key={ex.id} className="ex-block">
              <div className="ex-name-row">
                <div className="field-wrap">
                  <div className="field-label">NAME</div>
                  <input
                    type="text"
                    placeholder="e.g. Bench press"
                    value={ex.name}
                    onChange={(e) => updateExercise(ex.id, "name", e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="rm-btn"
                  style={{ paddingBottom: "8px" }}
                  onClick={() => removeExercise(ex.id)}
                  disabled={formExercises.length === 1}
                >
                  ×
                </button>
              </div>

              <div className="ex-stats-row">
                <div>
                  <div className="field-label">TYPE</div>
                  <select
                    value={ex.type}
                    onChange={(e) => updateExercise(ex.id, "type", e.target.value)}
                  >
                    <option value="sets_reps">Sets</option>
                    <option value="duration">Duration</option>
                  </select>
                </div>
                <div>
                  <div className="field-label">SETS</div>
                  <input
                    type="number"
                    min="1"
                    placeholder="3"
                    value={ex.type === "sets_reps" ? ex.sets : ""}
                    disabled={ex.type !== "sets_reps"}
                    onChange={(e) => updateExercise(ex.id, "sets", e.target.value)}
                  />
                </div>
                <div>
                  <div className="field-label">REPS/MIN</div>
                  <input
                    type="number"
                    min="1"
                    placeholder={ex.type === "sets_reps" ? "10" : "30"}
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
              </div>
            </div>
          ))}
        </div>

        <div className="action-row">
          <button
            type="button"
            className="btn-primary"
            style={{ "--zc": "#EF9F27", background: "#EF9F27", color: "#fff" }}
            onClick={handleSaveSession}
            disabled={isPending}
          >
            Apply session
          </button>
        </div>
      </div>
    </div>
  );
}
