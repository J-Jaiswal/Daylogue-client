import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { aiApi } from "../../api/aiApi";

const categoryBarColors = {
  sleep: "#7F77DD",
  workout: "#EF9F27",
  diet: "#1D9E75",
};

const categoryLabelColors = {
  sleep: "#534AB7",
  workout: "#854F0B",
  diet: "#0F6E56",
};

const categoryOrder = {
  sleep: 0,
  workout: 1,
  diet: 2,
};

export default function AISuggestionCards() {
  const { token } = useAuth();

  const {
    data: suggestions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["ai-daily"],
    queryFn: () => aiApi.getDailySuggestions(token),
    select: (data) => data.suggestions,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const getSortedSuggestions = (list) => {
    if (!list) return [];
    return [...list].sort((a, b) => {
      const orderA = categoryOrder[a.category] ?? 99;
      const orderB = categoryOrder[b.category] ?? 99;
      return orderA - orderB;
    });
  };

  const showSkeleton = isLoading || isError || !suggestions?.length;

  if (showSkeleton) {
    return (
      <div className="ai-suggestions-flat">
        <span className="profile-micro-label">Today's suggestions</span>
        <div className="suggestions-list-flat">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="suggestion-skeleton-row" />
          ))}
        </div>
      </div>
    );
  }

  const sortedSuggestions = getSortedSuggestions(suggestions);

  return (
    <div className="ai-suggestions-flat">
      <span className="profile-micro-label">Today's suggestions</span>
      <div className="suggestions-list-flat">
        {sortedSuggestions.map((s, i) => {
          const barColor = categoryBarColors[s.category] || "#888";
          const labelColor = categoryLabelColors[s.category] || "#888";
          const isLast = i === sortedSuggestions.length - 1;

          return (
            <div
              key={i}
              className={`suggestion-flat-row ${isLast ? "last-row" : ""}`}
            >
              <div
                className="suggestion-accent-bar"
                style={{ backgroundColor: barColor }}
              />
              <div className="suggestion-content-flat">
                <span
                  className="suggestion-cat-label"
                  style={{ color: labelColor }}
                >
                  {s.category}
                </span>
                <p className="suggestion-text-flat">{s.suggestion}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
