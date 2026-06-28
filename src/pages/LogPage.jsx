import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTodayLog, useUpsertLog } from "../hooks/useTodayLog";
import SleepSection from "../components/log/sleep/SleepSection";
import WorkoutForm from "../components/log/WorkoutForm";
import MealForm from "../components/log/MealForm";
import ReviewPanel from "../components/log/ReviewPanel";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { logApi } from "../api/logApi";
import { useSleep } from "../hooks/useSleep";



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

  const sleepHelper = useSleep();
  const { sleepDraft, napDrafts, clearDrafts, sleepState } = sleepHelper;
  const isSleeping = sleepState === "SLEEPING" || sleepState === "STALE";

  // PWA Badging API — show home screen indicator while sleep session is active
  useEffect(() => {
    if (!("setAppBadge" in navigator)) return;
    if (isSleeping) {
      navigator.setAppBadge().catch(() => {});
    } else {
      navigator.clearAppBadge().catch(() => {});
    }
  }, [isSleeping]);

  // Read the tab to open from router state (set by auto-redirect in Navbar)
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.state?.tab ?? "sleep"
  );
  const [workoutDraft, setWorkoutDraft] = useState(null);
  const [mealDraft, setMealDraft] = useState(null);

  const sleep = sleepDraft;
  const workouts = workoutDraft ?? [];
  const meals = mealDraft ?? [];

  const handleWorkoutsChange = (updatedSessions) => setWorkoutDraft(updatedSessions);
  const handleMealsChange = (updatedMeals) => setMealDraft(updatedMeals);

  // Sync sleep & naps
  const handleSaveSleep = () => {
    const payload = {};
    // Only send sleep if sleepDraft exists
    if (sleepDraft) {
      payload.sleep = sleepDraft;
    }
    // Append nap drafts to existing naps in database
    payload.naps = [
      ...(todayLog?.naps || []),
      ...sleepHelper.napDrafts.map(({ isDraft, _id, ...nap }) => {
        if (String(_id).startsWith("draft-nap-")) {
          return nap;
        }
        return { _id, ...nap };
      })
    ];

    upsertLog(
      payload,
      {
        onSuccess: () => {
          toast.success("Sleep & Nap data synchronized ✓");
          clearDrafts();
        },
        onError: () => toast.error("Failed to sync sleep/nap logs"),
      }
    );
  };

  // Sync food & exercise only
  const handleSaveFoodExercise = () => {
    const payload = {};
    if (workoutDraft !== null) {
      payload.workouts = [
        ...(todayLog?.workouts || []),
        ...workoutDraft
      ];
    }
    if (mealDraft !== null) {
      payload.meals = [
        ...(todayLog?.meals || []),
        ...mealDraft
      ];
    }

    upsertLog(
      payload,
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
  const sleepDone = !!((sleepDraft || todayLog?.sleep) && ((sleepDraft?.fellAsleepTime && sleepDraft?.wokeUpTime) || (todayLog?.sleep?.fellAsleepTime && todayLog?.sleep?.wokeUpTime)));
  const workoutDone = (workoutDraft && workoutDraft.length > 0) || (todayLog?.workouts && todayLog.workouts.length > 0);
  const mealsDone = (mealDraft && mealDraft.length > 0) || (todayLog?.meals && todayLog.meals.length > 0);

  const completedCount = [sleepDone, workoutDone, mealsDone].filter(Boolean).length;

  // Sleep snapshot value - show sleep or wake up timings instead of duration
  const getSleepSnapshotValue = () => {
    const activeSleep = sleepDraft || todayLog?.sleep;
    if (!activeSleep || !activeSleep.fellAsleepTime || !activeSleep.wokeUpTime) return "—";

    const formatTime = (timeStr) => {
      const d = new Date(timeStr);
      let h = d.getHours();
      const m = String(d.getMinutes()).padStart(2, "0");
      const ampm = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return `${h}:${m} ${ampm}`;
    };

    return `${formatTime(activeSleep.fellAsleepTime)} - ${formatTime(activeSleep.wokeUpTime)}`;
  };

  const tabs = [
    { key: "sleep",   label: "Sleep",    dotColor: "#7F77DD", done: sleepDone },
    { key: "workout", label: "Exercise", dotColor: "#EF9F27", done: workoutDone },
    { key: "meals",   label: "Food",     dotColor: "#1D9E75", done: mealsDone },
  ];

  const deleteDbWorkout = (idx) => {
    if (!todayLog) return;
    const updated = todayLog.workouts.filter((_, i) => i !== idx);
    upsertLog({ workouts: updated });
  };

  const deleteDbMeal = (idx) => {
    if (!todayLog) return;
    const updated = todayLog.meals.filter((_, i) => i !== idx);
    upsertLog({ meals: updated });
  };

  const deleteWorkoutDraft = (idx) => {
    if (!workoutDraft) return;
    const updated = workoutDraft.filter((_, i) => i !== idx);
    setWorkoutDraft(updated.length > 0 ? updated : null);
  };

  const deleteMealDraft = (idx) => {
    if (!mealDraft) return;
    const updated = mealDraft.filter((_, i) => i !== idx);
    setMealDraft(updated.length > 0 ? updated : null);
  };

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
                  <SleepSection sleepHelper={sleepHelper} />
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
              todayLog={todayLog}
              sleepDone={sleepDone}
              sleepText={getSleepSnapshotValue()}
              workoutDone={workoutDone}
              mealsDone={mealsDone}
              workoutDraft={workoutDraft}
              mealDraft={mealDraft}
              sleepDraft={sleepDraft}
              napDrafts={napDrafts}
              handleSaveSleep={handleSaveSleep}
              handleSaveFoodExercise={handleSaveFoodExercise}
              deleteSleep={sleepHelper.deleteSleep}
              deleteNap={sleepHelper.deleteNap}
              deleteDbWorkout={deleteDbWorkout}
              deleteDbMeal={deleteDbMeal}
              deleteWorkoutDraft={deleteWorkoutDraft}
              deleteMealDraft={deleteMealDraft}
              isPending={isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}
