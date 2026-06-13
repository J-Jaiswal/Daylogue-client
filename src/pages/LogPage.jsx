import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTodayLog, useUpsertLog } from "../hooks/useTodayLog";
import SleepForm from "../components/log/SleepForm";
import WorkoutForm from "../components/log/WorkoutForm";
import MealForm from "../components/log/MealForm";
import DrinksForm from "../components/log/DrinksForm";
import toast from "react-hot-toast";

const SECTIONS = [
  { key: "sleep",   label: "Sleep",   icon: "🌙" },
  { key: "workout", label: "Train",   icon: "💪" },
  { key: "meals",   label: "Meals",   icon: "🥗" },
  { key: "drinks",  label: "Drinks",  icon: "💧" },
];

export default function LogPage() {
  const { data: todayLog, isLoading } = useTodayLog();
  const { mutate: upsertLog, isPending } = useUpsertLog();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("sleep");

  const [sleepDraft, setSleepDraft]     = useState(null);
  const [workoutDraft, setWorkoutDraft] = useState(null);
  const [mealDraft, setMealDraft]       = useState(null);
  const [drinksDraft, setDrinksDraft]   = useState(null);

  const sleep    = sleepDraft    ?? todayLog?.sleep    ?? null;
  const workouts = workoutDraft  ?? todayLog?.workouts ?? [];
  const meals    = mealDraft     ?? todayLog?.meals    ?? [];
  const drinks   = drinksDraft   ?? todayLog?.drinks   ?? [];

  const handleSaveSleep = (sleepData) => {
    setSleepDraft(sleepData);
    upsertLog({ sleep: sleepData }, {
      onSuccess: () => {
        toast.success("Sleep saved");
        setActiveSection("workout");
      },
    });
  };

  const handleSaveWorkouts = (updatedSessions) => {
    setWorkoutDraft(updatedSessions);
    upsertLog({ workouts: updatedSessions });
  };

  const handleSaveMeals = (updatedMeals) => {
    setMealDraft(updatedMeals);
    upsertLog({ meals: updatedMeals });
  };

  const handleSaveDrinks = (updatedDrinks) => {
    setDrinksDraft(updatedDrinks);
    upsertLog({ drinks: updatedDrinks });
  };

  // Completion check per section
  const isDone = (key) => {
    if (key === "sleep")   return !!sleep?.bedTime;
    if (key === "workout") return workouts.length > 0;
    if (key === "meals")   return meals.length > 0;
    if (key === "drinks")  return drinks.length > 0;
    return false;
  };

  if (isLoading) {
    return (
      <div className="log-page-container">
        <div className="log-loading">Loading today's log…</div>
      </div>
    );
  }

  return (
    <div className="log-page-container">
      <div className="log-page-centered">
        <h2 className="log-page-title">Today's Log</h2>

        {/* Segmented Tab Switcher */}
        <div className="log-segmented-tabs">
          {SECTIONS.map(({ key, label, icon }) => {
            const done   = isDone(key);
            const active = activeSection === key;
            return (
              <button
                key={key}
                className={`log-segmented-tab ${active ? "active" : ""} ${done ? "completed" : ""}`}
                onClick={() => setActiveSection(key)}
              >
                <span className="log-tab-icon">{icon}</span>
                <span className="log-tab-label">{label}</span>
                {/* Dot indicator replaces green fill */}
                <span className={`log-tab-dot ${done ? "done" : "pending"}`} />
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
          {activeSection === "drinks" && (
            <DrinksForm drinks={drinks} onSave={handleSaveDrinks} />
          )}
        </div>

        {/* Section nav arrows */}
        <div className="log-nav-row">
          <button
            className="log-nav-btn"
            disabled={SECTIONS.findIndex((s) => s.key === activeSection) === 0}
            onClick={() => {
              const idx = SECTIONS.findIndex((s) => s.key === activeSection);
              if (idx > 0) setActiveSection(SECTIONS[idx - 1].key);
            }}
          >
            ← Prev
          </button>

          <button
            className="log-back-btn"
            onClick={() => navigate("/")}
            disabled={isPending}
          >
            ← Back to Home
          </button>

          <button
            className="log-nav-btn"
            disabled={SECTIONS.findIndex((s) => s.key === activeSection) === SECTIONS.length - 1}
            onClick={() => {
              const idx = SECTIONS.findIndex((s) => s.key === activeSection);
              if (idx < SECTIONS.length - 1) setActiveSection(SECTIONS[idx + 1].key);
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
