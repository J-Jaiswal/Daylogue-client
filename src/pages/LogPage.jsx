import { useState } from "react";
import { useTodayLog, useUpsertLog } from "../hooks/useTodayLog";
import SleepSection from "../components/log/sleep/SleepSection";
import WorkoutForm from "../components/log/WorkoutForm";
import MealForm from "../components/log/MealForm";
import ReviewPanel from "../components/log/ReviewPanel";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { logApi } from "../api/logApi";



const formatDateLabel = () => {
  const d = new Date();
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function LogPage() {
  const { data: todayLog, isLoading } = useTodayLog();
  const { mutate: upsertLog, isPending } = useUpsertLog();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("sleep");
  const [workoutDraft, setWorkoutDraft] = useState(null);
  const [mealDraft, setMealDraft] = useState(null);

  const sleep = todayLog?.sleep ?? null;
  const workouts = workoutDraft ?? todayLog?.workouts ?? [];
  const meals = mealDraft ?? todayLog?.meals ?? [];

  const handleWorkoutsChange = (updatedSessions) => setWorkoutDraft(updatedSessions);
  const handleMealsChange = (updatedMeals) => setMealDraft(updatedMeals);

  // Sync sleep only
  const handleSaveSleep = () => {
    upsertLog(
      { sleep },
      {
        onSuccess: () => {
          toast.success("Sleep log synchronized ✓");
        },
        onError: () => toast.error("Failed to sync sleep log"),
      }
    );
  };

  // Sync food & exercise only
  const handleSaveFoodExercise = () => {
    upsertLog(
      { workouts, meals },
      {
        onSuccess: () => {
          toast.success("Food & Exercise logs uploaded ✓");
          setWorkoutDraft(null);
          setMealDraft(null);
        },
        onError: () => toast.error("Failed to sync food/exercise logs"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="log-loading-wrap">
        <div className="log-loading-spinner" />
        <p className="log-loading">Loading today's log…</p>
      </div>
    );
  }

  // Determine logged state for each category
  const sleepDone = !!(sleep && sleep.duration !== null);
  const workoutDone = workouts.length > 0;
  const mealsDone = meals.length > 0;

  const completedCount = [sleepDone, workoutDone, mealsDone].filter(Boolean).length;

  // Sleep snapshot value - show sleep or wake up timings instead of duration
  const getSleepSnapshotValue = () => {
    if (!sleep || !sleep.fellAsleepTime || !sleep.wokeUpTime) return "—";

    const formatTime = (timeStr) => {
      const d = new Date(timeStr);
      let h = d.getHours();
      const m = String(d.getMinutes()).padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return `${h}:${m} ${ampm}`;
    };

    return `${formatTime(sleep.fellAsleepTime)} - ${formatTime(sleep.wokeUpTime)}`;
  };

  const tabs = [
    { key: "sleep", label: "Sleep", dotColor: "#7F77DD", done: sleepDone },
    { key: "workout", label: "Exercise", dotColor: "#EF9F27", done: workoutDone },
    { key: "meals", label: "Food", dotColor: "#1D9E75", done: mealsDone },
  ];

  return (
    <div className="log-page-container">
      <div className="log-inner">
        {/* ── Page Header ───────────────────────────── */}
        <div className="log-page-header">
          <div className="log-page-header-left">
            <h1 className="log-page-title">Today's log</h1>
            <p className="log-page-subtitle">{formatDateLabel()}</p>
          </div>
        </div>

        {/* ── Progress Strip ─────────────────────────── */}
        <div className="progress-strip">
          <span className="progress-text">{completedCount} of 3 logged</span>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${(completedCount / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* ── Tab Switcher Strip ──────────────────────── */}
        <div className="tab-strip">
          <div className="tab-strip-left">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
                style={{ "--tc": tab.dotColor }}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            className={`tab-review-btn ${activeTab === "review" ? "active" : ""}`}
            onClick={() => setActiveTab("review")}
            title="Review &amp; Sync logs"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </button>
        </div>

        {/* ── Main Content Grid ─────────────────────── */}
        <div className={`log-content-grid ${activeTab === "review" ? "review-mode" : ""}`}>
          {activeTab !== "review" ? (
            <div className="log-form-panel">
              <div className="log-form-card">
                {activeTab === "sleep" && (
                  <SleepSection />
                )}
                {activeTab === "workout" && (
                  <WorkoutForm
                    sessions={workouts}
                    onSave={handleWorkoutsChange}
                    isPending={isPending}
                  />
                )}
                {activeTab === "meals" && (
                  <MealForm
                    meals={meals}
                    onSave={handleMealsChange}
                    isPending={isPending}
                  />
                )}
              </div>
            </div>
          ) : (
            <ReviewPanel
              sleepDone={sleepDone}
              sleepText={getSleepSnapshotValue()}
              naps={todayLog?.naps ?? []}
              workouts={workouts}
              meals={meals}
              workoutDone={workoutDone}
              mealsDone={mealsDone}
              workoutDraft={workoutDraft}
              mealDraft={mealDraft}
              handleSaveSleep={handleSaveSleep}
              handleSaveFoodExercise={handleSaveFoodExercise}
              isPending={isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}
