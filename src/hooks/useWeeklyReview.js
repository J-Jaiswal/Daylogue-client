import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { aiApi } from "../api/aiApi";

export const useWeeklyReview = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["weekly-review"],
    queryFn: () => aiApi.getWeeklyReview(token),
    select: (data) => data.review,
    staleTime: 1000 * 60 * 60, // 1 hour — review doesn't change often
  });
};
