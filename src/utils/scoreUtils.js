/**
 * Daily Performance Score
 * Pure function — no API call, works instantly from log data.
 *
 * Scoring breakdown (max 100):
 *   Sleep       0–35 pts
 *   Workout     0–30 pts
 *   Nutrition   0–25 pts
 *   Completeness 0–10 pts
 */

export const calculateDailyScore = (log) => {
  if (!log) return 0;

  let score = 0;

  // ── Sleep (0–35) ──────────────────────────────────
  if (log.sleep?.fellAsleepTime) {
    const mins = log.sleep.duration || 0;
    if (mins >= 420 && mins <= 540) score += 35; // 7–9 h ideal
    else if (mins >= 360)            score += 22; // 6–7 h decent
    else if (mins > 0)               score += 10; // <6 h or >9 h
    else                             score += 5;  // logged but no duration
  }

  // ── Workout (0–30) ────────────────────────────────
  const sessionCount = log.workouts?.length ?? 0;
  if (sessionCount >= 2)      score += 30;
  else if (sessionCount === 1) score += 20;
  // rest day = 0 (no penalty, weekly view handles streaks)

  // ── Nutrition (0–25) ──────────────────────────────
  if (log.meals?.length) {
    const mealCount = log.meals.length;
    if (mealCount >= 3)      score += 20;
    else if (mealCount >= 2) score += 12;
    else                     score += 6;

    // junk food deduction
    const hasJunk = log.meals.some(
      (m) => m.category === "junk_food" || m.category === "cheat_meal"
    );
    if (hasJunk) score -= 5;
  }

  // ── Completeness bonus (0–10) ─────────────────────
  const hasSleep   = !!log.sleep?.fellAsleepTime;
  const hasWorkout = (log.workouts?.length ?? 0) > 0;
  const hasMeals   = (log.meals?.length ?? 0) > 0;
  const logged     = [hasSleep, hasWorkout, hasMeals].filter(Boolean).length;

  if (logged === 3)      score += 10;
  else if (logged === 2) score += 5;
  else if (logged === 1) score += 2;

  return Math.max(0, Math.min(100, score));
};

/**
 * Returns a display label and CSS colour token for a given score.
 */
export const getScoreLabel = (score) => {
  if (score === null || score === undefined) {
    return { label: "Not scored", color: "var(--text-3)" };
  }
  if (score >= 90) return { label: "Great day", color: "#0F6E56" };
  if (score >= 75) return { label: "On track", color: "#0F6E56" };
  if (score >= 50) return { label: "Getting there", color: "#BA7517" };
  return { label: "Not Okay", color: "#BA7517" };
};
