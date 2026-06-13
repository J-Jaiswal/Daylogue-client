import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { logApi } from "../../api/logApi";
import { formatSleepDuration } from "../../utils/dateUtils";

export default function MomentumIndicator() {
  const { token } = useAuth();

  const { data: summary, isLoading } = useQuery({
    queryKey: ["summary", 7],
    queryFn: () => logApi.getRecentSummary(token, 7),
    select: (data) => data.summary,
  });

  if (isLoading)
    return <div className="momentum-card loading">Loading momentum...</div>;
  if (!summary) return null;

  const stats = [
    {
      label: "Avg Sleep",
      value: summary.avgSleepMinutes
        ? formatSleepDuration(summary.avgSleepMinutes)
        : "N/A",
      good: summary.avgSleepMinutes >= 420, // 7 hours
    },
    {
      label: "Workouts",
      value: `${summary.totalWorkoutSessions} sessions`,
      good: summary.totalWorkoutSessions >= 3,
    },
    {
      label: "Junk Food",
      value: `${summary.junkFoodCount}x`,
      good: summary.junkFoodCount <= 2,
    },
    {
      label: "Logged Days",
      value: `${summary.loggedDays ?? 0} days`,
      good: (summary.loggedDays ?? 0) >= 5,
    },
  ];

  return (
    <div className="momentum-card">
      <h3>Last 7 Days</h3>
      <div className="momentum-grid">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`momentum-stat ${stat.good ? "good" : "needs-work"}`}
          >
            <div className="momentum-value">{stat.value}</div>
            <div className="momentum-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
