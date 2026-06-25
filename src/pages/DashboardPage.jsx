import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { logApi } from "../api/logApi";
import { isDummyToken } from "../utils/authBypass";
import AISuggestionCards from "../components/home/AISuggestionCards";
import PerformanceScore from "../components/home/PerformanceScore";

const phaseLabels = {
  building: "Building Muscle & Strength",
  maintaining: "Maintaining Health",
  fat_loss: "Fat Loss / Recomp",
  competition_prep: "Competition Prep",
};

const contextLabels = {
  job_seeker: "Job Seeker",
  working_professional: "Working Professional",
  student: "Student",
  off_season: "Off Season",
  new_parent: "New Parent",
  traveling: "Traveling",
};

export default function DashboardPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const phase = user?.currentPhase;

  // Calculate yesterday's date string
  const yesterdayStr = (() => {
    if (token && isDummyToken(token)) {
      return "2026-06-13";
    }
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  })();

  // Fetch yesterday's log
  const { data: yesterdayLog, isLoading: isLoadingYesterday } = useQuery({
    queryKey: ["log", yesterdayStr],
    queryFn: () => logApi.getLogByDate(token, yesterdayStr),
    select: (data) => data?.log,
    enabled: !!token,
  });

  // Live ticking date-time generator
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer); // Clean up setInterval on unmount to avoid memory leaks
  }, []);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const dayName = days[now.getDay()];
  const dateNum = now.getDate();
  const monthName = months[now.getMonth()];
  const yearNum = now.getFullYear();
  const rawHours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const displayHour = rawHours % 12 || 12;
  const ampm = rawHours >= 12 ? "PM" : "AM";

  const formattedDateTime = `${dayName}, ${dateNum} ${monthName} ${yearNum} · ${displayHour}:${minutes} ${ampm}`;

  return (
    <div className="page dashboard-page-flat">
      <header className="dashboard-header-flat">
        <div className="header-flat-left">
          <span className="profile-micro-label">{formattedDateTime}</span>
          <h1>Welcome back, {user?.name || "there"}</h1>
          <p className="header-flat-subtitle">
            Your daily workspace for sleep, training, meals, and AI coaching.
          </p>
        </div>
        {phase && (
          <div className="header-flat-right">
            <span className="profile-micro-label">Current phase</span>
            <strong className="header-phase-name">{phaseLabels[phase.primaryGoal] || phase.primaryGoal}</strong>
            <span className="header-phase-context">{contextLabels[phase.lifeContext] || phase.lifeContext}</span>
          </div>
        )}
      </header>

      <div className="dashboard-divider" />

      <section className="dashboard-suggestions-section-flat">
        <AISuggestionCards />
      </section>

      <div className="dashboard-divider" />

      <section className="dashboard-score-section-flat">
        {!isLoadingYesterday && <PerformanceScore log={yesterdayLog} />}
      </section>
    </div>
  );
}
