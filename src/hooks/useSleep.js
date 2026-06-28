import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { sleepApi } from "../api/sleepApi";
import { logApi } from "../api/logApi";
import { useTodayLog } from "./useTodayLog";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const useSleep = () => {
  const { token, user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const { data: todayLog, isLoading: isLogLoading } = useTodayLog();

  const [sleepState, setSleepState] = useState("IDLE");
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentDate = todayLog?.date || getLocalDateString();
  const sleepKey = `daylogue_sleep_draft_${currentDate}`;
  const napsKey = `daylogue_naps_draft_${currentDate}`;

  const [sleepDraft, setSleepDraft] = useState(() => {
    const key = `daylogue_sleep_draft_${getLocalDateString()}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  });

  const [napDrafts, setNapDrafts] = useState(() => {
    const key = `daylogue_naps_draft_${getLocalDateString()}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  });

  // Synchronize state when currentDate changes or todayLog finishes loading
  useEffect(() => {
    if (!token) return;

    if (todayLog?.sleep && todayLog.sleep.fellAsleepTime && todayLog.sleep.wokeUpTime) {
      localStorage.removeItem(sleepKey);
      setSleepDraft(null);
    } else {
      const stored = localStorage.getItem(sleepKey);
      setSleepDraft(stored ? JSON.parse(stored) : null);
    }

    const storedNaps = localStorage.getItem(napsKey);
    setNapDrafts(storedNaps ? JSON.parse(storedNaps) : []);
  }, [todayLog, currentDate, sleepKey, napsKey, token]);

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
        if (sleepDraft) {
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
  }, [token, todayLog, sleepDraft]);

  useEffect(() => {
    if (token) {
      refreshActiveSession();
    } else {
      setLoading(false);
    }
  }, [token, todayLog, refreshActiveSession]);

  const startSleep = async () => {
    // Start session only if there is no sleep and nap data present in drafts
    if (sleepDraft || (napDrafts && napDrafts.length > 0)) {
      toast.error("Please upload your previous sleep and nap data before starting a new session!");
      return;
    }

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

  const confirmWakeUp = async (wokeUpTime, wokeUpDate) => {
    try {
      setLoading(true);
      const completedSleep = await sleepApi.completeSleep(token, wokeUpTime, wokeUpDate);
      
      // Save draft completed sleep data locally
      localStorage.setItem(sleepKey, JSON.stringify(completedSleep));
      setSleepDraft(completedSleep);

      setActiveSession(null);
      setSleepState("COMPLETED");
      if (user) {
        setUser({
          ...user,
          activeSleepSession: null,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["log"] });
      toast.success("Wake up recorded! Review & upload sleep from the final section.");
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
      toast.success("Sleep session cancelled");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to cancel sleep session");
    } finally {
      setLoading(false);
    }
  };

  const addNap = useCallback(({ startTime, endTime }) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.round((end - start) / 60000);
    const hour = start.getHours();
    let timeOfDay = "evening";
    if (hour < 12) timeOfDay = "morning";
    else if (hour <= 17) timeOfDay = "afternoon";

    const newNap = {
      _id: `draft-nap-${Date.now()}-${Math.random()}`,
      startTime,
      endTime,
      duration,
      timeOfDay,
      isDraft: true,
    };

    const updatedNaps = [...napDrafts, newNap];
    setNapDrafts(updatedNaps);
    localStorage.setItem(napsKey, JSON.stringify(updatedNaps));
    toast.success("Nap drafted");
  }, [napDrafts, napsKey]);

  const deleteNap = useCallback(async (napId) => {
    if (String(napId).startsWith("draft-nap-")) {
      const updatedNaps = napDrafts.filter((n) => n._id !== napId);
      setNapDrafts(updatedNaps);
      localStorage.setItem(napsKey, JSON.stringify(updatedNaps));
      toast.success("Draft nap removed");
    } else {
      try {
        setLoading(true);
        await sleepApi.deleteNap(token, napId);
        queryClient.invalidateQueries({ queryKey: ["log"] });
        toast.success("Nap deleted from database");
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to delete nap");
      } finally {
        setLoading(false);
      }
    }
  }, [token, napDrafts, napsKey, queryClient]);

  const deleteSleep = useCallback(async () => {
    localStorage.removeItem(sleepKey);
    setSleepDraft(null);

    // If the sleep session is already in the database, delete it there too
    if (todayLog?.sleep) {
      try {
        setLoading(true);
        await logApi.upsertLog(token, { sleep: null });
        queryClient.invalidateQueries({ queryKey: ["log"] });
        toast.success("Sleep log deleted from database");
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Failed to delete sleep from database");
      } finally {
        setLoading(false);
      }
    } else {
      setSleepState("IDLE");
      toast.success("Sleep draft deleted");
    }
  }, [sleepKey, todayLog, token, queryClient]);

  const clearDrafts = useCallback(() => {
    localStorage.removeItem(sleepKey);
    localStorage.removeItem(napsKey);
    setSleepDraft(null);
    setNapDrafts([]);
  }, [sleepKey, napsKey]);

  const sleepEntry = todayLog?.sleep ?? null;

  return {
    sleepState,
    setSleepState,
    activeSession,
    sleepEntry: sleepDraft,
    sleepDraft,
    naps: napDrafts,
    napDrafts,
    startSleep,
    confirmWakeUp,
    cancelSleep,
    addNap,
    deleteNap,
    deleteSleep,
    clearDrafts,
    loading: loading || isLogLoading,
    error,
  };
};
export default useSleep;
