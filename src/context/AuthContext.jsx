import { useEffect, useState } from "react";
import { authApi } from "../api/authApi";
import { AuthContext } from "./auth-context";
import { DUMMY_TOKEN, DUMMY_USER } from "../utils/authBypass";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("token", userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  const loginAsDummy = () => {
    login(DUMMY_USER, DUMMY_TOKEN);
  };

  // on mount, fetch current user if token exists
  useEffect(() => {
    const bootstrap = async () => {
      if (token) {
        if (token === DUMMY_TOKEN) {
          setUser(DUMMY_USER);
          setLoading(false);
          return;
        }

        try {
          const data = await authApi.getMe(token);
          setUser(data.user);
        } catch {
          // token invalid or expired
          logout();
        }
      }
      setLoading(false);
    };
    bootstrap();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, loginAsDummy, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
