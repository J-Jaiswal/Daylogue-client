import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { logApi } from "../api/logApi";
import toast from "react-hot-toast";

export const useTodayLog = () => {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["log", "today"],
    queryFn: () => logApi.getTodayLog(token),
    select: (data) => data.log,
  });
};

export const useUpsertLog = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => logApi.upsertLog(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["log"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save log");
    },
  });
};
