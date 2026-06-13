import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTodayLog } from "../hooks/useTodayLog";
import LiveDate from "../components/home/LiveDate";
import AISuggestionCards from "../components/home/AISuggestionCards";
import PerformanceScore from "../components/home/PerformanceScore";

const phaseLabels = {
  building: "Building Muscle",
  maintaining: "Maintaining Health",
  fat_loss: "Fat Loss",
  competition_prep: "Competition Prep",
};

const contextLabels = {
  job_seeker: "Job Seeker",
  working_professional: "Working Professional",
  student: "Student",
  off_season: "Off Season",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: todayLog, isLoading } = useTodayLog();
  const navigate = useNavigate();
  const phase = user?.currentPhase;

  return (
    <div className="page dashboard-page">
      <section className="dashboard-hero">
        <div>
          <LiveDate />
          <h1>Welcome back, {user?.name || "there"}</h1>
          <p>
            Your daily workspace for sleep, training, meals, and AI coaching.
          </p>
        </div>
        {phase && (
          <div className="phase-card">
            <span>Current phase</span>
            <strong>{phaseLabels[phase.primaryGoal]}</strong>
            <small>{contextLabels[phase.lifeContext]}</small>
          </div>
        )}
      </section>

      <section className="dashboard-single-col">
        <AISuggestionCards />
        {!isLoading && <PerformanceScore log={todayLog} />}
      </section>
    </div>
  );
}
