import { useMemo, useState } from "react";
import DayLogCard from "./DayLogCard";

const FILTERS = [
  { key: "all",       label: "All" },
  { key: "slept",     label: "Slept" },
  { key: "trained",   label: "Worked Out" },
  { key: "meals",     label: "Meals" },
  { key: "complete",  label: "Complete" },
  { key: "missed",    label: "Missed" },
];

const DATE_RANGES = [
  { key: 7,  label: "7 days" },
  { key: 30, label: "30 days" },
  { key: 90, label: "90 days" },
];

/**
 * Builds a full list of dates (YYYY-MM-DD) from today going back `days`.
 */
function buildDateRange(days) {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates; // most-recent first
}

/**
 * Applies the active filter to a { date, log } entry.
 */
function passesFilter(entry, filter) {
  const { log } = entry;
  switch (filter) {
    case "all":      return true;
    case "slept":    return !!log?.sleep?.bedTime;
    case "trained":  return (log?.workouts?.length ?? 0) > 0;
    case "meals":    return (log?.meals?.length ?? 0) > 0;
    case "complete": {
      if (!log) return false;
      const hasSleep   = !!log.sleep?.bedTime;
      const hasWorkout = (log.workouts?.length ?? 0) > 0;
      const hasMeals   = (log.meals?.length ?? 0) > 0;
      return hasSleep && hasWorkout && hasMeals;
    }
    case "missed":   return !log;
    default:         return true;
  }
}

export default function DayLogList({ logs }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [rangeDays, setRangeDays] = useState(30);

  // Build a map of date → log for O(1) lookup
  const logMap = useMemo(() => {
    const map = {};
    (logs || []).forEach((log) => { map[log.date] = log; });
    return map;
  }, [logs]);

  // Build full date list and attach logs
  const entries = useMemo(() => {
    return buildDateRange(rangeDays).map((date) => ({
      date,
      log: logMap[date] || null,
    }));
  }, [rangeDays, logMap]);

  // Apply filter
  const visible = useMemo(
    () => entries.filter((e) => passesFilter(e, activeFilter)),
    [entries, activeFilter]
  );

  return (
    <div className="day-log-list-wrap">
      {/* Date range tabs */}
      <div className="date-range-tabs">
        {DATE_RANGES.map((r) => (
          <button
            key={r.key}
            className={`date-range-tab ${rangeDays === r.key ? "active" : ""}`}
            onClick={() => setRangeDays(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Filter pills */}
      <div className="filter-pills">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-pill ${activeFilter === f.key ? "active" : ""}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className="history-result-count">
        {visible.length} {visible.length === 1 ? "day" : "days"} shown
      </p>

      {/* Day cards */}
      {visible.length === 0 ? (
        <div className="history-empty">
          <p>No days match this filter in the selected range.</p>
        </div>
      ) : (
        <div className="day-log-list">
          {visible.map(({ date, log }) => (
            <DayLogCard key={date} date={date} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}
