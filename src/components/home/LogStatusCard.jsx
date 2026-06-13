export default function LogStatusCard({ log }) {
  const hasSleep = !!log?.sleep?.bedTime;
  const hasWorkout = log?.workouts?.length > 0;
  const hasMeals = log?.meals?.length > 0;

  const items = [
    { label: "Sleep", done: hasSleep },
    { label: "Workout", done: hasWorkout },
    { label: "Meals", done: hasMeals },
  ];

  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="log-status-card">
      <div className="log-status-header">
        <h3>Today's Log</h3>
        <span className="log-status-count">
          {doneCount} / {items.length}
        </span>
      </div>

      <div className="log-status-items">
        {items.map((item) => (
          <div
            key={item.label}
            className={`log-status-item ${item.done ? "done" : "pending"}`}
          >
            <span className="log-status-icon">{item.done ? "✓" : "○"}</span>
            <span className="log-status-label">{item.label}</span>
          </div>
        ))}
      </div>

      {doneCount === 0 && (
        <p className="log-status-hint">
          Nothing logged yet today. Start with sleep or a meal.
        </p>
      )}

      {doneCount === items.length && (
        <p className="log-status-hint complete">
          All logged for today. Great job.
        </p>
      )}
    </div>
  );
}
