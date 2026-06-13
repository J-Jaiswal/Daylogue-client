import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { aiApi } from "../api/aiApi";
import WeeklyReviewCard from "../components/weekly/WeeklyReviewCard";

export default function WeeklyReviewPage() {
  const { token } = useAuth();

  const {
    data: review,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["weekly-review"],
    queryFn: () => aiApi.getWeeklyReview(token),
    select: (data) => data.review,
    staleTime: 1000 * 60 * 60,
  });

  return (
    <div className="page weekly-page">
      <h2 className="page-title">Weekly Review</h2>

      {isLoading || isFetching ? (
        <div className="weekly-loading">
          <div className="weekly-loading-icon">📖</div>
          <p>Your AI coach is writing your weekly review...</p>
        </div>
      ) : isError ? (
        <div className="weekly-error">
          <p>Could not load your weekly review.</p>
          <button className="btn-secondary" onClick={() => refetch()}>
            Try Again
          </button>
        </div>
      ) : !review ? (
        <div className="weekly-empty">
          <p>
            No review available yet. Log a few days this week and come back.
          </p>
        </div>
      ) : (
        <>
          <WeeklyReviewCard review={review} />
          <button
            className="btn-secondary weekly-regenerate-btn"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            ↻ Regenerate Review
          </button>
        </>
      )}
    </div>
  );
}
