import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTodayLog, useUpsertLog } from "../hooks/useTodayLog";
import SleepForm from "../components/log/SleepForm";
import WorkoutForm from "../components/log/WorkoutForm";
import MealForm from "../components/log/MealForm";
import toast from "react-hot-toast";

const SECTIONS = ["sleep", "workout", "meals"];

export default function LogPage() {
  const { data: todayLog, isLoading } = useTodayLog();
  const { mutate: upsertLog, isPending } = useUpsertLog();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("sleep");

  const [sleepDraft, setSleepDraft] = useState(null);
  const [workoutDraft, setWorkoutDraft] = useState(null);
  const [mealDraft, setMealDraft] = useState(null);

  const sleep = sleepDraft ?? todayLog?.sleep ?? null;
  const workouts = workoutDraft ?? todayLog?.workouts ?? [];
  const meals = mealDraft ?? todayLog?.meals ?? [];

  const handleSaveSleep = (sleepData) => {
    setSleepDraft(sleepData);
    upsertLog(
      { sleep: sleepData },
      {
        onSuccess: () => {
          toast.success("Sleep saved");
          setActiveSection("workout");
        },
      },
    );
  };

  const handleSaveWorkouts = (updatedSessions) => {
    setWorkoutDraft(updatedSessions);
    upsertLog({ workouts: updatedSessions });
  };

  const handleSaveMeals = (updatedMeals) => {
    setMealDraft(updatedMeals);
    upsertLog({ meals: updatedMeals });
  };

  if (isLoading) {
    return (
      <div className="page">
        <p>Loading today's log...</p>
      </div>
    );
  }

  return (
    <div className="log-page-container">
      <div className="log-page-centered">
        <h2 className="log-page-title">Today's Log</h2>

        {/* Segmented Tab Switcher */}
        <div className="log-segmented-tabs">
          {SECTIONS.map((s) => {
            const isDone =
              (s === "sleep" && !!sleep?.bedTime) ||
              (s === "workout" && workouts.length > 0) ||
              (s === "meals" && meals.length > 0);

            return (
              <button
                key={s}
                className={`log-segmented-tab ${activeSection === s ? "active" : ""} ${isDone ? "completed" : ""}`}
                onClick={() => setActiveSection(s)}
              >
                {isDone ? "✓ " : ""}
                {s.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Section Content */}
        <div className="log-section-content-wrapper">
          {activeSection === "sleep" && (
            <SleepForm key={sleep?.bedTime || "sleep"} initial={sleep} onSave={handleSaveSleep} />
          )}

          {activeSection === "workout" && (
            <WorkoutForm sessions={workouts} onSave={handleSaveWorkouts} />
          )}

          {activeSection === "meals" && (
            <MealForm meals={meals} onSave={handleSaveMeals} />
          )}
        </div>

        <button
          className="log-back-btn"
          onClick={() => navigate("/")}
          disabled={isPending}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
