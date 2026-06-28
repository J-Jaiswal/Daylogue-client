import { useWeeklyReview } from "../hooks/useWeeklyReview";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { aiApi } from "../api/aiApi";
import WeeklyReviewCard from "../components/weekly/WeeklyReviewCard";
import toast from "react-hot-toast";

export default function WeeklyReviewPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: review,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useWeeklyReview();

  const handleRegenerate = async () => {
    try {
      await aiApi.deleteWeeklyCache(token);
      await queryClient.invalidateQueries({ queryKey: ["weekly-review"] });
      refetch();
      toast.success("Regenerating weekly review...");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to regenerate review");
    }
  };

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
            onClick={handleRegenerate}
            disabled={isFetching}
          >
            ↻ Regenerate Review
          </button>
        </>
      )}
    </div>
  );
}
