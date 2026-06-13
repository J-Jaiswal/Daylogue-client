import axios from "axios";
import { DUMMY_USER, dummySummary, isDummyToken, todayIsoDate } from "../utils/authBypass";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

export const aiApi = {
  getDailySuggestions: async (token) => {
    if (isDummyToken(token)) {
      return {
        suggestions: [
          {
            category: "sleep",
            suggestion: "Keep the 7.5 hour sleep window steady for the next few nights.",
          },
          {
            category: "workout",
            suggestion: "Add one light strength session today to keep weekly momentum.",
          },
          {
            category: "diet",
            suggestion: "Anchor your next meal around protein and a colorful vegetable.",
          },
        ],
      };
    }

    const res = await axios.get(`${BASE}/ai/daily`, {
      headers: authHeader(token),
    });
    return res.data;
  },

  getWeeklyReview: async (token) => {
    if (isDummyToken(token)) {
      return {
        review: {
          weekStartDate: todayIsoDate(),
          phaseSnapshot: DUMMY_USER.currentPhase,
          narrative:
            "This is a dummy weekly review for exploring Daylogue. Your sample week shows steady sleep, a workable workout rhythm, and enough data to preview the coaching flow.",
          stats: dummySummary,
        },
      };
    }

    const res = await axios.get(`${BASE}/ai/weekly`, {
      headers: authHeader(token),
    });
    return res.data;
  },

  chat: async (token, message, conversationHistory) => {
    if (isDummyToken(token)) {
      return {
        reply: `Dummy coach here. I heard: "${message}". In a real account, I would use your recent logs and ${conversationHistory.length} chat messages as context.`,
      };
    }

    const res = await axios.post(
      `${BASE}/ai/chat`,
      { message, conversationHistory },
      { headers: authHeader(token) },
    );
    return res.data;
  },
};
