import axios from "axios";
import { DUMMY_USER, DUMMY_LOGS, isDummyToken } from "../utils/authBypass";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

export const sleepApi = {
  startSleep: async (token) => {
    if (isDummyToken(token)) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const fellAsleepDate = `${year}-${month}-${day}`;
      const activeSleepSession = {
        fellAsleepDate,
        fellAsleepTime: now.toISOString(),
      };
      DUMMY_USER.activeSleepSession = activeSleepSession;
      return activeSleepSession;
    }

    const res = await axios.post(`${BASE}/sleep/start`, {}, {
      headers: authHeader(token),
    });
    return res.data;
  },

  completeSleep: async (token, wokeUpTime) => {
    if (isDummyToken(token)) {
      const active = DUMMY_USER.activeSleepSession;
      if (!active) throw new Error("No active sleep session");

      const fell = new Date(active.fellAsleepTime);
      const woke = new Date(wokeUpTime);
      const duration = Math.round((woke - fell) / 60000);
      const wokeUpDate = wokeUpTime.split("T")[0];

      const sleepData = {
        fellAsleepDate: active.fellAsleepDate,
        fellAsleepTime: active.fellAsleepTime,
        wokeUpDate,
        wokeUpTime,
        duration,
        crossesMidnight: active.fellAsleepDate !== wokeUpDate,
      };

      let log = DUMMY_LOGS.find((l) => l.date === wokeUpDate);
      if (!log) {
        log = { date: wokeUpDate, workouts: [], meals: [], naps: [] };
        DUMMY_LOGS.push(log);
      }
      log.sleep = sleepData;

      DUMMY_USER.activeSleepSession = null;
      return sleepData;
    }

    const res = await axios.post(
      `${BASE}/sleep/complete`,
      { wokeUpTime },
      { headers: authHeader(token) }
    );
    return res.data;
  },

  cancelSleep: async (token) => {
    if (isDummyToken(token)) {
      DUMMY_USER.activeSleepSession = null;
      return { message: "Sleep session cancelled" };
    }

    const res = await axios.post(`${BASE}/sleep/cancel`, {}, {
      headers: authHeader(token),
    });
    return res.data;
  },

  getActiveSleep: async (token) => {
    if (isDummyToken(token)) {
      const active = DUMMY_USER.activeSleepSession;
      if (!active) return { active: false };

      const start = new Date(active.fellAsleepTime);
      const elapsedMinutes = Math.round((Date.now() - start.getTime()) / 60000);
      const result = {
        active: true,
        fellAsleepDate: active.fellAsleepDate,
        fellAsleepTime: active.fellAsleepTime,
        elapsedMinutes,
      };
      if (elapsedMinutes > 1080) {
        result.isStale = true;
      }
      return result;
    }

    const res = await axios.get(`${BASE}/sleep/active`, {
      headers: authHeader(token),
    });
    return res.data;
  },

  addNap: async (token, { date, startTime, endTime }) => {
    if (isDummyToken(token)) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const duration = Math.round((end - start) / 60000);
      const hour = start.getHours();
      let timeOfDay = "evening";
      if (hour < 12) timeOfDay = "morning";
      else if (hour <= 17) timeOfDay = "afternoon";

      const savedNap = {
        _id: `dummy-nap-${Date.now()}-${Math.random()}`,
        startTime,
        endTime,
        duration,
        timeOfDay,
      };

      let log = DUMMY_LOGS.find((l) => l.date === date);
      if (!log) {
        log = { date, workouts: [], meals: [], naps: [] };
        DUMMY_LOGS.push(log);
      }
      log.naps = log.naps || [];
      log.naps.push(savedNap);
      return savedNap;
    }

    const res = await axios.post(
      `${BASE}/sleep/nap`,
      { date, startTime, endTime },
      { headers: authHeader(token) }
    );
    return res.data;
  },

  deleteNap: async (token, napId) => {
    if (isDummyToken(token)) {
      for (const log of DUMMY_LOGS) {
        if (log.naps) {
          log.naps = log.naps.filter((n) => n._id !== napId);
        }
      }
      return { message: "Nap deleted" };
    }

    const res = await axios.delete(`${BASE}/sleep/nap/${napId}`, {
      headers: authHeader(token),
    });
    return res.data;
  },
};
