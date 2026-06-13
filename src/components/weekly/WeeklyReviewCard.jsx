import { formatDisplayDate, formatSleepDuration } from "../../utils/dateUtils";

const phaseLabels = {
  building: "Building Muscle",
  maintaining: "Maintaining Health",
  fat_loss: "Fat Loss",
  competition_prep: "Competition Prep",
};

const contextLabels = {
  job_seeker: "Job Seeker",
  working_professional: "Working Professional",
  student: "Student",
  off_season: "Off Season",
};

export default function WeeklyReviewCard({ review }) {
  if (!review) return null;

  const stats = review.stats || {};

  return (
    <div className="weekly-content">
      <div className="weekly-meta">
        <span className="weekly-range">
          Week of {formatDisplayDate(review.weekStartDate)}
        </span>
        {review.phaseSnapshot && (
          <span className="weekly-phase">
            {phaseLabels[review.phaseSnapshot.primaryGoal]} /{" "}
            {contextLabels[review.phaseSnapshot.lifeContext]}
          </span>
        )}
      </div>

      <div className="weekly-narrative">
        <div className="weekly-narrative-icon">AI</div>
        <div className="weekly-narrative-text">
          {review.narrative
            .split("\n")
            .map((para, i) => (para.trim() ? <p key={i}>{para}</p> : null))}
        </div>
      </div>

      <div className="weekly-stats">
        <h4>This Week At A Glance</h4>
        <div className="weekly-stats-grid">
          <div className="weekly-stat-card">
            <div className="weekly-stat-icon">SL</div>
            <div className="weekly-stat-value">
              {stats.avgSleepMinutes
                ? formatSleepDuration(stats.avgSleepMinutes)
                : "N/A"}
            </div>
            <div className="weekly-stat-label">Avg Sleep</div>
          </div>

          <div className="weekly-stat-card">
            <div className="weekly-stat-icon">D</div>
            <div className="weekly-stat-value">{stats.loggedDays ?? 0}</div>
            <div className="weekly-stat-label">Logged Days</div>
          </div>

          <div className="weekly-stat-card">
            <div className="weekly-stat-icon">WK</div>
            <div className="weekly-stat-value">
              {stats.totalWorkoutSessions ?? 0}
            </div>
            <div className="weekly-stat-label">Workouts</div>
          </div>

          <div className="weekly-stat-card">
            <div className="weekly-stat-icon">JF</div>
            <div className="weekly-stat-value">{stats.junkFoodCount ?? 0}</div>
            <div className="weekly-stat-label">Junk Food</div>
          </div>

          <div className="weekly-stat-card">
            <div className="weekly-stat-icon">CM</div>
            <div className="weekly-stat-value">{stats.cheatMealCount ?? 0}</div>
            <div className="weekly-stat-label">Cheat Meals</div>
          </div>
        </div>
      </div>
    </div>
  );
}
