import axios from "axios";
import { DUMMY_USER, isDummyToken } from "../utils/authBypass";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

export const profileApi = {
  getProfile: async (token) => {
    if (isDummyToken(token)) {
      return { user: DUMMY_USER };
    }

    const res = await axios.get(`${BASE}/profile`, {
      headers: authHeader(token),
    });
    return res.data;
  },

  updateProfile: async (token, data) => {
    if (isDummyToken(token)) {
      return { user: { ...DUMMY_USER, ...data } };
    }

    const res = await axios.put(`${BASE}/profile/update`, data, {
      headers: authHeader(token),
    });
    return res.data;
  },

  updatePhase: async (token, data) => {
    if (isDummyToken(token)) {
      return {
        currentPhase: {
          ...data,
          startDate: new Date().toISOString(),
        },
      };
    }

    const res = await axios.put(`${BASE}/profile/phase`, data, {
      headers: authHeader(token),
    });
    return res.data;
  },

  getPhaseHistory: async (token) => {
    if (isDummyToken(token)) {
      return {
        phases: [
          {
            _id: "dummy-phase",
            ...DUMMY_USER.currentPhase,
            notes: "Demo phase for the dummy account.",
          },
        ],
      };
    }

    const res = await axios.get(`${BASE}/profile/phases`, {
      headers: authHeader(token),
    });
    return res.data;
  },
};
