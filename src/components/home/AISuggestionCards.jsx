import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth";
import { aiApi } from "../../api/aiApi";

const categoryColors = {
  sleep: "#6c63ff",
  workout: "#f59e0b",
  diet: "#10b981",
  lifestyle: "#3b82f6",
};

const categoryIcons = {
  sleep: "🌙",
  workout: "💪",
  diet: "🥗",
  lifestyle: "⚡",
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

  if (isLoading) {
    return (
      <div className="ai-cards-section">
        <h3>Today's Suggestions</h3>
        <div className="ai-cards-loading">Asking your AI coach...</div>
      </div>
    );
  }

  if (isError || !suggestions?.length) {
    return (
      <div className="ai-cards-section">
        <h3>Today's Suggestions</h3>
        <p className="ai-cards-empty">
          Log yesterday's data to get suggestions.
        </p>
      </div>
    );
  }

  return (
    <div className="ai-cards-section">
      <h3>Today's Suggestions</h3>
      <div className="ai-cards">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="ai-card"
            style={{
              borderLeft: `4px solid ${categoryColors[s.category] || "#888"}`,
            }}
          >
            <div className="ai-card-header">
              <span className="ai-card-icon">
                {categoryIcons[s.category] || "💡"}
              </span>
              <span className="ai-card-category">{s.category}</span>
            </div>
            <p className="ai-card-suggestion">{s.suggestion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
