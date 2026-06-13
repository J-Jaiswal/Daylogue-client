import { useState } from "react";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// returns how complete a log is as a level 0-3
const getLogLevel = (log) => {
  if (!log) return 0;
  let score = 0;
  if (log.sleep?.bedTime) score++;
  if (log.workouts?.length > 0) score++;
  if (log.meals?.length > 0) score++;
  if (score === 0) return 0;
  if (score <= 1) return 1;
  if (score === 2) return 2;
  return 3;
};

export default function CalendarView({ logs, onSelectDate }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // build a map of date string -> log for quick lookup
  const logMap = {};
  logs?.forEach((log) => {
    logMap[log.date] = log;
  });

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else setViewMonth(viewMonth - 1);
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else setViewMonth(viewMonth + 1);
  };

  // get first day of month and total days
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();

  // adjust so week starts on Monday (0=Mon ... 6=Sun)
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const todayStr = today.toISOString().split("T")[0];

  const cells = [];

  // empty cells before first day
  for (let i = 0; i < startOffset; i++) {
    cells.push(<div key={`empty-${i}`} className="calendar-cell empty" />);
  }

  // day cells
  for (let d = 1; d <= totalDays; d++) {
    const month = String(viewMonth + 1).padStart(2, "0");
    const day = String(d).padStart(2, "0");
    const dateStr = `${viewYear}-${month}-${day}`;
    const log = logMap[dateStr];
    const level = getLogLevel(log);
    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;

    cells.push(
      <div
        key={dateStr}
        className={[
          "calendar-cell",
          `level-${level}`,
          isToday ? "today" : "",
          isFuture ? "future" : "",
          log ? "has-log" : "",
        ].join(" ")}
        onClick={() => !isFuture && onSelectDate(dateStr, log)}
      >
        <span className="calendar-day-number">{d}</span>
        {isToday && <span className="today-dot" />}
      </div>,
    );
  }

  return (
    <div className="calendar">
      {/* header */}
      <div className="calendar-header">
        <button className="cal-nav-btn" onClick={goToPrevMonth}>
          ‹
        </button>
        <h3>
          {MONTHS[viewMonth]} {viewYear}
        </h3>
        <button className="cal-nav-btn" onClick={goToNextMonth}>
          ›
        </button>
      </div>

      {/* day labels */}
      <div className="calendar-grid">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="calendar-day-label">
            {d}
          </div>
        ))}
        {cells}
      </div>

      {/* legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot level-0" />
          No log
        </div>
        <div className="legend-item">
          <span className="legend-dot level-1" />
          Partial
        </div>
        <div className="legend-item">
          <span className="legend-dot level-2" />
          Good
        </div>
        <div className="legend-item">
          <span className="legend-dot level-3" />
          Complete
        </div>
      </div>
    </div>
  );
}
