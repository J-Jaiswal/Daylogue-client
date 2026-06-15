import { useState } from "react";
import { useTodayLog, useUpsertLog } from "../hooks/useTodayLog";
import SleepForm from "../components/log/SleepForm";
import WorkoutForm from "../components/log/WorkoutForm";
import MealForm from "../components/log/MealForm";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { logApi } from "../api/logApi";

// Utility to calculate target log date based on sleep reset time
const getTargetDate = (fellAsleepDateStr, fellAsleepTimeStr, resetTimeStr) => {
  const [fellH, fellM] = fellAsleepTimeStr.split(":").map(Number);
  const [resetH, resetM] = resetTimeStr.split(":").map(Number);
  const fellMinutes = fellH * 60 + fellM;
  const resetMinutes = resetH * 60 + resetM;
  
  if (fellMinutes > resetMinutes) {
    return fellAsleepDateStr;
  } else {
    // Subtract 1 day safely in local time
    const [y, m, d] = fellAsleepDateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() - 1);
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
};

export default function LogPage() {
  const { data: todayLog, isLoading } = useTodayLog();
  const { mutate: upsertLog, isPending } = useUpsertLog();
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("sleep");
  const [workoutDraft, setWorkoutDraft] = useState(null);
  const [mealDraft, setMealDraft] = useState(null);
  const [isSleepSaving, setIsSleepSaving] = useState(false);

  const sleep = todayLog?.sleep ?? null;
  const workouts = workoutDraft ?? todayLog?.workouts ?? [];
  const meals = mealDraft ?? todayLog?.meals ?? [];

  // Individual sleep entry save handler
  const handleSaveSleepEntry = async (entry, resetTime) => {
    setIsSleepSaving(true);
    try {
      const targetDate = getTargetDate(entry.fellAsleepDate, entry.fellAsleepTime, resetTime);
      
      let targetLog = null;
      try {
        const res = await logApi.getLogByDate(token, targetDate);
        targetLog = res.log;
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error(err);
        }
      }

      const existingSleep = targetLog?.sleep || { durationMinutes: 0, entries: [] };
      const newEntries = [...(existingSleep.entries || [])];
      
      newEntries.push({
        _id: `temp-${Date.now()}-${Math.random()}`,
        ...entry
      });

      await logApi.upsertLog(token, {
        date: targetDate,
        sleep: {
          ...existingSleep,
          entries: newEntries
        }
      });

      toast.success(`Sleep entry saved to ${targetDate} ✓`);
      queryClient.invalidateQueries({ queryKey: ["log"] });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save sleep entry");
    } finally {
      setIsSleepSaving(false);
    }
  };

  // Individual sleep entry delete handler
  const handleDeleteSleepEntry = async (entry, resetTime) => {
    setIsSleepSaving(true);
    try {
      const targetDate = getTargetDate(entry.fellAsleepDate, entry.fellAsleepTime, resetTime);
      
      let targetLog = null;
      try {
        const res = await logApi.getLogByDate(token, targetDate);
        targetLog = res.log;
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error(err);
        }
      }

      const existingSleep = targetLog?.sleep || { durationMinutes: 0, entries: [] };
      const newEntries = (existingSleep.entries || []).filter(
        (e) => e._id !== entry._id && e.id !== entry._id && e._id !== entry.id && e.id !== entry.id
      );

      await logApi.upsertLog(token, {
        date: targetDate,
        sleep: {
          ...existingSleep,
          entries: newEntries
        }
      });

      toast.success("Sleep entry deleted ✓");
      queryClient.invalidateQueries({ queryKey: ["log"] });
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete sleep entry");
    } finally {
      setIsSleepSaving(false);
    }
  };

  const handleWorkoutsChange = (updatedSessions) => setWorkoutDraft(updatedSessions);
  const handleMealsChange = (updatedMeals) => setMealDraft(updatedMeals);

  // Central "Save to DB" from snapshot panel
  const handleSaveAll = () => {
    upsertLog(
      { sleep, workouts, meals },
      {
        onSuccess: () => {
          toast.success("Today's log saved ✓");
          setWorkoutDraft(null);
          setMealDraft(null);
        },
        onError: () => toast.error("Failed to save log"),
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

  const sleepDone = !!sleep?.bedTime;
  const workoutDone = workouts.length > 0;
  const mealsDone = meals.length > 0;

  const getSleepDurationHours = () => {
    if (!sleep?.bedTime || !sleep?.wakeTime) return "—";
    const [bH, bM] = sleep.bedTime.split(":").map(Number);
    const [wH, wM] = sleep.wakeTime.split(":").map(Number);
    let diffMins = (wH * 60 + wM) - (bH * 60 + bM);
    if (diffMins < 0) diffMins += 24 * 60;
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  const tabs = [
    { key: "sleep",   icon: "🌙", label: "Sleep",    done: sleepDone },
    { key: "workout", icon: "💪", label: "Exercise",  done: workoutDone },
    { key: "meals",   icon: "🥗", label: "Food",      done: mealsDone },
  ];

  const completedCount = [sleepDone, workoutDone, mealsDone].filter(Boolean).length;

  return (
    <div className="log-page-container">

      {/* ── Page Header ─────────────────────────────── */}
      <div className="log-inner">
        <div className="log-page-header">
          <div className="log-page-header-left">
            <h1 className="log-page-title">Today's Log</h1>
            <p className="log-page-subtitle">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="log-header-progress">
            <span className="log-progress-label">{completedCount}/3 logged</span>
            <div className="log-progress-bar-track">
              <div
                className="log-progress-bar-fill"
                style={{ width: `${(completedCount / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Switcher ─────────────────────────────── */}
      <div className="log-inner">
        <div className="log-tab-switcher">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`log-tab-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="tab-icon-wrap">{tab.icon}</span>
              <span className="tab-label-text">{tab.label}</span>
              {tab.done && <span className="tab-done-dot" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content Grid ────────────────────────── */}
      <div className="log-inner">
        <div className="log-content-grid">

          {/* Form Card */}
          <div className="log-form-panel">
            <div className="log-form-card">
              {activeTab === "sleep" && (
                <SleepForm
                  key={sleep?.entries ? JSON.stringify(sleep.entries) : "empty"}
                  sleep={sleep}
                  onSaveSleepEntry={handleSaveSleepEntry}
                  onDeleteSleepEntry={handleDeleteSleepEntry}
                  isPending={isSleepSaving || isPending}
                />
              )}
              {activeTab === "workout" && (
                <WorkoutForm sessions={workouts} onSave={handleWorkoutsChange} isPending={isPending} />
              )}
              {activeTab === "meals" && (
                <MealForm meals={meals} onSave={handleMealsChange} isPending={isPending} />
              )}
            </div>
          </div>

          {/* Snapshot Panel */}
          <aside className="log-snapshot-panel">
            <div className="snapshot-panel-header">
              <span className="snapshot-panel-icon">📊</span>
              <h3 className="snapshot-panel-title">Today's Snapshot</h3>
            </div>

            <div className="snapshot-stats-grid">
              {/* Sleep stat */}
              <div className={`snapshot-stat-card ${sleepDone ? "done" : ""}`}>
                <div className="stat-card-icon">🌙</div>
                <div className="stat-card-body">
                  <span className="stat-card-label">SLEEP</span>
                  <strong className="stat-card-value">{getSleepDurationHours()}</strong>
                </div>
                {sleepDone && <span className="stat-check">✓</span>}
              </div>

              {/* Workout stat */}
              <div className={`snapshot-stat-card ${workoutDone ? "done" : ""}`}>
                <div className="stat-card-icon">💪</div>
                <div className="stat-card-body">
                  <span className="stat-card-label">WORKOUTS</span>
                  <strong className="stat-card-value">
                    {workouts.length > 0 ? `${workouts.length} session${workouts.length > 1 ? "s" : ""}` : "—"}
                  </strong>
                </div>
                {workoutDone && <span className="stat-check">✓</span>}
              </div>

              {/* Meals stat */}
              <div className={`snapshot-stat-card ${mealsDone ? "done" : ""}`}>
                <div className="stat-card-icon">🥗</div>
                <div className="stat-card-body">
                  <span className="stat-card-label">MEALS & DRINKS</span>
                  <strong className="stat-card-value">
                    {meals.length > 0 ? `${meals.length} entr${meals.length > 1 ? "ies" : "y"}` : "—"}
                  </strong>
                </div>
                {mealsDone && <span className="stat-check">✓</span>}
              </div>
            </div>

            {/* Divider */}
            <div className="snapshot-divider" />

            {/* Save to DB */}
            <button
              className="snapshot-save-btn"
              onClick={handleSaveAll}
              disabled={isPending || (!sleepDone && !workoutDone && !mealsDone)}
            >
              {isPending ? (
                <>
                  <span className="btn-spinner" />
                  Saving…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Save to Database
                </>
              )}
            </button>

            <p className="snapshot-hint">
              Fill in any section above, then save all at once.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
