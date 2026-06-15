import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Navbar from "./components/common/Navbar";

import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import LogPage from "./pages/LogPage";
import HistoryPage from "./pages/HistoryPage";
// import WeeklyReviewPage from "./pages/WeeklyReviewPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Routes>
          {/* public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Navbar />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/log" element={<LogPage />} />
              <Route path="/history" element={<HistoryPage />} />
              {/* <Route path="/weekly" element={<WeeklyReviewPage />} /> */}
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
