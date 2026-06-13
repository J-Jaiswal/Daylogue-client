import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { profileApi } from "../api/profileApi";
import { formatDisplayDate } from "../utils/dateUtils";

const PRIMARY_GOALS = [
  { value: "building", label: "Building Muscle & Strength", tag: "STRENGTH" },
  { value: "maintaining", label: "Maintaining Health", tag: "BALANCE" },
  { value: "fat_loss", label: "Fat Loss / Recomposition", tag: "RECOMP" },
  { value: "competition_prep", label: "Competition / Tournament Prep", tag: "PEAK" },
];

const LIFE_CONTEXTS = [
  { value: "job_seeker", label: "Job Seeker" },
  { value: "working_professional", label: "Working Professional" },
  { value: "student", label: "Student" },
  { value: "off_season", label: "Off Season" },
];

export default function ProfilePage() {
  const { user, token, setUser } = useAuth();
  const queryClient = useQueryClient();
  const activeGoal = PRIMARY_GOALS.find(
    (goal) => goal.value === user?.currentPhase?.primaryGoal,
  );
  const activeContext = LIFE_CONTEXTS.find(
    (context) => context.value === user?.currentPhase?.lifeContext,
  );

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    age: user?.age || "",
    weight: user?.weight || "",
    height: user?.height || "",
    goals: user?.goals || "",
  });

  const [phaseForm, setPhaseForm] = useState({
    primaryGoal: user?.currentPhase?.primaryGoal || "maintaining",
    lifeContext: user?.currentPhase?.lifeContext || "working_professional",
    notes: "",
  });

  const [activeTab, setActiveTab] = useState("profile");

  const { data: phases } = useQuery({
    queryKey: ["phase-history"],
    queryFn: () => profileApi.getPhaseHistory(token),
    select: (data) => data.phases,
  });

  const { mutate: updateProfile, isPending: updatingProfile } = useMutation({
    mutationFn: (data) => profileApi.updateProfile(token, data),
    onSuccess: (data) => {
      setUser(data.user);
      toast.success("Profile updated");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Update failed"),
  });

  const { mutate: updatePhase, isPending: updatingPhase } = useMutation({
    mutationFn: (data) => profileApi.updatePhase(token, data),
    onSuccess: (data) => {
      setUser((prev) => ({ ...prev, currentPhase: data.currentPhase }));
      queryClient.invalidateQueries({ queryKey: ["phase-history"] });
      toast.success("Phase updated");
      setPhaseForm((f) => ({ ...f, notes: "" }));
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Phase update failed"),
  });

  const handleProfileSave = () => {
    updateProfile({
      ...profileForm,
      age: profileForm.age ? Number(profileForm.age) : undefined,
      weight: profileForm.weight ? Number(profileForm.weight) : undefined,
      height: profileForm.height ? Number(profileForm.height) : undefined,
    });
  };

  const handlePhaseSave = () => {
    updatePhase(phaseForm);
  };

  return (
    <div className="page profile-page-container">
      {/* Profile Header */}
      <header className="profile-cinematic-header">
        <div className="profile-header-meta">
          <div className="profile-avatar-gradient">
            {(user?.name || "D").slice(0, 1)}
          </div>
          <div className="profile-meta-text">
            <h2>{user?.name || "Your account"}</h2>
            <p className="profile-bio-text">{user?.goals || "Set a goal to shape your coaching context."}</p>
          </div>
        </div>

        <div className="profile-floating-phase-card">
          <span className="phase-card-label">CURRENT PHASE</span>
          <strong className="phase-card-title">{activeGoal?.label || "Not set"}</strong>
          <span className="phase-card-context">{activeContext?.label || "No context"}</span>
        </div>
      </header>

      {/* Floating Sticky Segmented Control */}
      <div className="profile-nav-sticky-wrap">
        <div className="profile-nav-segmented">
          {["profile", "phase", "history"].map((tab) => (
            <button
              key={tab}
              className={`profile-nav-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="profile-content-scroll-area">
        {activeTab === "profile" && (
          <section className="profile-cinematic-section fade-in">
            <div className="profile-input-grid">
              <label className="cinematic-input-wrapper">
                <span className="input-label-tag">NAME</span>
                <input
                  type="text"
                  value={profileForm.name}
                  className="cinematic-text-input"
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                />
              </label>
              <label className="cinematic-input-wrapper">
                <span className="input-label-tag">AGE</span>
                <input
                  type="number"
                  value={profileForm.age}
                  placeholder="25"
                  className="cinematic-text-input"
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, age: e.target.value })
                  }
                />
              </label>
              <label className="cinematic-input-wrapper">
                <span className="input-label-tag">WEIGHT (KG)</span>
                <input
                  type="number"
                  value={profileForm.weight}
                  placeholder="70"
                  className="cinematic-text-input"
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, weight: e.target.value })
                  }
                />
              </label>
              <label className="cinematic-input-wrapper">
                <span className="input-label-tag">HEIGHT (CM)</span>
                <input
                  type="number"
                  value={profileForm.height}
                  placeholder="175"
                  className="cinematic-text-input"
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, height: e.target.value })
                  }
                />
              </label>
            </div>

            <label className="cinematic-input-wrapper full-width-field mt-16">
              <span className="input-label-tag">NORTH STAR GOAL</span>
              <textarea
                rows={4}
                value={profileForm.goals}
                className="cinematic-textarea-input"
                onChange={(e) =>
                  setProfileForm({ ...profileForm, goals: e.target.value })
                }
                placeholder="Example: Gain muscle while keeping sleep consistent."
              />
            </label>

            <button
              className="cinematic-btn-primary full-width-cta mt-24"
              onClick={handleProfileSave}
              disabled={updatingProfile}
            >
              {updatingProfile ? "SAVING..." : "SAVE PROFILE"}
            </button>
          </section>
        )}

        {activeTab === "phase" && (
          <section className="profile-cinematic-section fade-in">
            <p className="cinematic-section-desc">
              Your phase changes how the coach interprets your logs. Choose the
              goal and life context that best describe this season.
            </p>

            <span className="input-label-tag">SELECT PRIMARY PHASE</span>
            <div className="phase-asymmetric-grid">
              {PRIMARY_GOALS.map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  className={`phase-cinematic-card ${
                    phaseForm.primaryGoal === goal.value ? "active" : ""
                  }`}
                  onClick={() =>
                    setPhaseForm({ ...phaseForm, primaryGoal: goal.value })
                  }
                >
                  <span className="phase-card-badge">{goal.tag}</span>
                  <span className="phase-card-name">{goal.label}</span>
                </button>
              ))}
            </div>

            <div className="context-selector-wrap mt-24">
              <span className="input-label-tag">LIFE CONTEXT</span>
              <div className="context-chip-row-scroll">
                {LIFE_CONTEXTS.map((context) => (
                  <button
                    key={context.value}
                    type="button"
                    className={`context-cinematic-chip ${
                      phaseForm.lifeContext === context.value ? "active" : ""
                    }`}
                    onClick={() =>
                      setPhaseForm({ ...phaseForm, lifeContext: context.value })
                    }
                  >
                    {context.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="cinematic-input-wrapper full-width-field mt-24">
              <span className="input-label-tag">NOTES</span>
              <textarea
                rows={3}
                value={phaseForm.notes}
                className="cinematic-textarea-input"
                onChange={(e) =>
                  setPhaseForm({ ...phaseForm, notes: e.target.value })
                }
                placeholder="Anything your future self should remember?"
              />
            </label>

            <button
              className="cinematic-btn-primary full-width-cta btn-height-50 mt-24"
              onClick={handlePhaseSave}
              disabled={updatingPhase}
            >
              {updatingPhase ? "UPDATING..." : "UPDATE PHASE"}
            </button>
          </section>
        )}

        {activeTab === "history" && (
          <section className="profile-cinematic-section fade-in">
            <span className="input-label-tag">PHASE HISTORY</span>
            {!phases?.length ? (
              <p className="cinematic-empty-state">No phase history recorded yet.</p>
            ) : (
              <div className="phase-cinematic-history-list">
                {phases.map((phase) => (
                  <div key={phase._id} className="history-cinematic-item">
                    <div className="history-item-header">
                      <span className="history-item-title">
                        {
                          PRIMARY_GOALS.find((g) => g.value === phase.primaryGoal)
                            ?.label
                        }
                      </span>
                      <span
                        className={`history-item-status-pill ${
                          !phase.endDate ? "active" : ""
                        }`}
                      >
                        {!phase.endDate ? "CURRENT" : "PAST"}
                      </span>
                    </div>
                    <div className="history-item-context">
                      {
                        LIFE_CONTEXTS.find((c) => c.value === phase.lifeContext)
                          ?.label
                      }
                    </div>
                    <div className="history-item-date">
                      {formatDisplayDate(phase.startDate)}
                      {phase.endDate
                        ? ` to ${formatDisplayDate(phase.endDate)}`
                        : " to Present"}
                    </div>
                    {phase.notes && (
                      <p className="history-item-notes">{phase.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
