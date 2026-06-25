import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { sleepApi } from "../api/sleepApi";
import { useTodayLog } from "./useTodayLog";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useSleep = () => {
  const { token, user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const { data: todayLog, isLoading: isLogLoading } = useTodayLog();

  const [sleepState, setSleepState] = useState("IDLE");
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sleepEntry = todayLog?.sleep ?? null;
  const naps = todayLog?.naps ?? [];

  const refreshActiveSession = useCallback(async () => {
    if (!token) return;
    try {
      const res = await sleepApi.getActiveSleep(token);
      if (res.active) {
        setActiveSession({
          fellAsleepDate: res.fellAsleepDate,
          fellAsleepTime: res.fellAsleepTime,
          elapsedMinutes: res.elapsedMinutes,
          isStale: !!res.isStale,
        });
        if (res.isStale) {
          setSleepState("STALE");
        } else {
          setSleepState("SLEEPING");
        }
      } else {
        setActiveSession(null);
        if (todayLog?.sleep && todayLog.sleep.fellAsleepTime && todayLog.sleep.wokeUpTime) {
          setSleepState("COMPLETED");
        } else {
          setSleepState("IDLE");
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch sleep session");
    } finally {
      setLoading(false);
    }
  }, [token, todayLog]);

  useEffect(() => {
    if (token) {
      refreshActiveSession();
    } else {
      setLoading(false);
    }
  }, [token, todayLog, refreshActiveSession]);

  const startSleep = async () => {
    try {
      setLoading(true);
      const session = await sleepApi.startSleep(token);
      setActiveSession({
        fellAsleepDate: session.fellAsleepDate,
        fellAsleepTime: session.fellAsleepTime,
        elapsedMinutes: 0,
        isStale: false,
      });
      setSleepState("SLEEPING");
      if (user) {
        setUser({
          ...user,
          activeSleepSession: session,
        });
      }
      toast.success("Sleep session started 🔴 REC");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to start sleep session");
    } finally {
      setLoading(false);
    }
  };

  const confirmWakeUp = async (wokeUpTime) => {
    try {
      setLoading(true);
      const completedSleep = await sleepApi.completeSleep(token, wokeUpTime);
      setActiveSession(null);
      setSleepState("COMPLETED");
      if (user) {
        setUser({
          ...user,
          activeSleepSession: null,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["log"] });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to complete sleep session");
    } finally {
      setLoading(false);
    }
  };

  const cancelSleep = async () => {
    try {
      setLoading(true);
      await sleepApi.cancelSleep(token);
      setActiveSession(null);
      setSleepState("IDLE");
      if (user) {
        setUser({
          ...user,
          activeSleepSession: null,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["log"] });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to cancel sleep session");
    } finally {
      setLoading(false);
    }
  };

  const addNap = async ({ startTime, endTime }) => {
    try {
      setLoading(true);
      const todayDate = todayLog?.date || new Date().toISOString().split("T")[0];
      await sleepApi.addNap(token, {
        date: todayDate,
        startTime,
        endTime,
      });
      queryClient.invalidateQueries({ queryKey: ["log"] });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save nap");
    } finally {
      setLoading(false);
    }
  };

  const deleteNap = async (napId) => {
    try {
      setLoading(true);
      await sleepApi.deleteNap(token, napId);
      queryClient.invalidateQueries({ queryKey: ["log"] });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete nap");
    } finally {
      setLoading(false);
    }
  };

  return {
    sleepState,
    setSleepState,
    activeSession,
    sleepEntry,
    startSleep,
    confirmWakeUp,
    cancelSleep,
    naps,
    addNap,
    deleteNap,
    loading: loading || isLogLoading,
    error,
  };
};
export default useSleep;
