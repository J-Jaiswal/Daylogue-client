import { useMemo, useState } from "react";
import DayLogCard from "./DayLogCard";

const PAGE_SIZE = 10;

const FILTERS = [
  { key: "all",      label: "All" },
  { key: "slept",    label: "Slept" },
  { key: "trained",  label: "Worked Out" },
  { key: "meals",    label: "Meals" },
  { key: "drinks",   label: "Drinks" },
  { key: "complete", label: "Complete" },
  { key: "missed",   label: "Missed" },
];

const DATE_RANGES = [
  { key: 7,  label: "7 days" },
  { key: 30, label: "30 days" },
  { key: 90, label: "90 days" },
];

function buildDateRange(days) {
  const dates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

const DRINK_CATEGORIES = new Set([
  "water", "coffee", "tea", "juice", "protein_shake", "alcohol", "soda"
]);

function passesFilter(entry, filter) {
  const { log } = entry;
  switch (filter) {
    case "all":      return true;
    case "slept":    return !!log?.sleep?.bedTime;
    case "trained":  return (log?.workouts?.length ?? 0) > 0;
    case "meals":    return (log?.meals || []).some((m) => !DRINK_CATEGORIES.has(m.category));
    case "drinks":   return (log?.meals || []).some((m) => DRINK_CATEGORIES.has(m.category));
    case "complete": {
      if (!log) return false;
      return !!log.sleep?.bedTime &&
             (log.workouts?.length ?? 0) > 0 &&
             (log.meals || []).some((m) => !DRINK_CATEGORIES.has(m.category));
    }
    case "missed": return !log;
    default:       return true;
  }
}

export default function DayLogList({ logs }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [rangeDays, setRangeDays]       = useState(30);
  const [page, setPage]                 = useState(1);

  const logMap = useMemo(() => {
    const map = {};
    (logs || []).forEach((log) => { map[log.date] = log; });
    return map;
  }, [logs]);

  const entries = useMemo(
    () => buildDateRange(rangeDays).map((date) => ({ date, log: logMap[date] || null })),
    [rangeDays, logMap]
  );

  const visible = useMemo(
    () => entries.filter((e) => passesFilter(e, activeFilter)),
    [entries, activeFilter]
  );

  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageSlice  = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset to page 1 when filter/range changes
  const handleFilter = (key) => { setActiveFilter(key); setPage(1); };
  const handleRange  = (key) => { setRangeDays(key);   setPage(1); };

  return (
    <div className="day-log-list-wrap">

      {/* Date range tabs */}
      <div className="date-range-tabs">
        {DATE_RANGES.map((r) => (
          <button
            key={r.key}
            className={`date-range-tab ${rangeDays === r.key ? "active" : ""}`}
            onClick={() => handleRange(r.key)}
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
            onClick={() => handleFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Result count + page info */}
      <div className="history-meta-row">
        <p className="history-result-count">
          {visible.length} {visible.length === 1 ? "day" : "days"} found
        </p>
        {totalPages > 1 && (
          <p className="history-page-info">
            Page {safePage} of {totalPages}
          </p>
        )}
      </div>

      {/* Day cards */}
      {visible.length === 0 ? (
        <div className="history-empty">
          <p>No days match this filter in the selected range.</p>
        </div>
      ) : (
        <div className="day-log-list">
          {pageSlice.map(({ date, log }) => (
            <DayLogCard key={date} date={date} log={log} />
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="history-pagination">
          <button
            className="pagination-btn"
            disabled={safePage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Prev
          </button>

          <div className="pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`pagination-page-btn ${p === safePage ? "active" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            className="pagination-btn"
            disabled={safePage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
