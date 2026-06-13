import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { logApi } from "../api/logApi";
import DayLogList from "../components/history/DayLogList";

export default function HistoryPage() {
  const { token } = useAuth();

  // Fetch last 90 days — DayLogList handles display range internally
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const start = ninetyDaysAgo.toISOString().split("T")[0];
  const end   = new Date().toISOString().split("T")[0];

  const { data: logs, isLoading } = useQuery({
    queryKey: ["logs-range", start, end],
    queryFn: () => logApi.getLogsByRange(token, start, end),
    select: (data) => data.logs,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="page history-page">
      <h2 className="page-title">History</h2>

      {isLoading ? (
        <div className="history-loading">
          <p>Loading your history...</p>
        </div>
      ) : (
        <DayLogList logs={logs || []} />
      )}
    </div>
  );
}
