import axios from "axios";
import {
  DUMMY_LOGS,
  dummySummary,
  dummyTodayLog,
  isDummyToken,
} from "../utils/authBypass";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

export const logApi = {
  upsertLog: async (token, data) => {
    if (isDummyToken(token)) {
      return { log: { ...dummyTodayLog(), ...data } };
    }

    const res = await axios.post(`${BASE}/logs`, data, {
      headers: authHeader(token),
    });
    return res.data;
  },

  getTodayLog: async (token) => {
    if (isDummyToken(token)) {
      return { log: dummyTodayLog() };
    }

    const res = await axios.get(`${BASE}/logs/today`, {
      headers: authHeader(token),
    });
    return res.data;
  },

  getLogByDate: async (token, date) => {
    if (isDummyToken(token)) {
      return { log: DUMMY_LOGS.find((log) => log.date === date) || null };
    }

    const res = await axios.get(`${BASE}/logs/${date}`, {
      headers: authHeader(token),
    });
    return res.data;
  },

  getLogsByRange: async (token, start, end) => {
    if (isDummyToken(token)) {
      return {
        logs: DUMMY_LOGS.filter((log) => log.date >= start && log.date <= end),
      };
    }

    const res = await axios.get(`${BASE}/logs/range`, {
      headers: authHeader(token),
      params: { start, end },
    });
    return res.data;
  },

  getRecentSummary: async (token, days = 7) => {
    if (isDummyToken(token)) {
      return { summary: { ...dummySummary, days } };
    }

    const res = await axios.get(`${BASE}/logs/summary`, {
      headers: authHeader(token),
      params: { days },
    });
    return res.data;
  },

  deleteLog: async (token, date) => {
    if (isDummyToken(token)) {
      return { message: `Dummy log for ${date} cleared` };
    }

    const res = await axios.delete(`${BASE}/logs/${date}`, {
      headers: authHeader(token),
    });
    return res.data;
  },
};
