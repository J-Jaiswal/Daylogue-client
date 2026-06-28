import axios from "axios";
import { DUMMY_USER, isDummyToken } from "../utils/authBypass";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const authApi = {
  register: async (data) => {
    const res = await axios.post(`${BASE}/auth/register`, data);
    return res.data;
  },

  login: async (data) => {
    const res = await axios.post(`${BASE}/auth/login`, data);
    return res.data;
  },

  getMe: async (token, signal) => {
    if (isDummyToken(token)) {
      return { user: DUMMY_USER };
    }

    const res = await axios.get(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    });
    return res.data;
  },
};
