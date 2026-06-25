import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { profileApi } from "../api/profileApi";
import { formatDisplayDate } from "../utils/dateUtils";

const PencilIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: "6px", display: "inline-block", verticalAlign: "middle" }}
  >
    <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const Chip = ({ label, active, onClick, onRemove, isCustom }) => {
  return (
    <div
      className={`profile-chip ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span className="chip-label">{label}</span>
      {isCustom && (
        <button
          type="button"
          className="chip-remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          &times;
        </button>
      )}
    </div>
  );
};

const defaultGoals = [
  { value: "building", label: "Building Muscle & Strength" },
  { value: "maintaining", label: "Maintaining Health" },
  { value: "fat_loss", label: "Fat Loss / Recomp" },
  { value: "competition_prep", label: "Competition Prep" },
];

const defaultContexts = [
  { value: "job_seeker", label: "Job Seeker" },
  { value: "working_professional", label: "Working Professional" },
  { value: "student", label: "Student" },
  { value: "off_season", label: "Off Season" },
  { value: "new_parent", label: "New Parent" },
  { value: "traveling", label: "Traveling" },
];

export default function ProfilePage() {
  const { user, token, setUser } = useAuth();
  const queryClient = useQueryClient();

  const activeGoal = defaultGoals.find(
    (goal) => goal.value === user?.currentPhase?.primaryGoal
  );
  const activeContext = defaultContexts.find(
    (context) => context.value === user?.currentPhase?.lifeContext
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
  const [isEditingProfile, setIsEditingProfile] = useState(!user?.name);
  const [isEditingPhase, setIsEditingPhase] = useState(!user?.currentPhase?.primaryGoal);

  // Chip state management
  const [customGoals, setCustomGoals] = useState([]);
  const [customContexts, setCustomContexts] = useState([]);
  const [newGoalInput, setNewGoalInput] = useState("");
  const [newContextInput, setNewContextInput] = useState("");
  const [goalHint, setGoalHint] = useState("");
  const [contextHint, setContextHint] = useState("");

  const allGoals = [...defaultGoals, ...customGoals];
  const allContexts = [...defaultContexts, ...customContexts];

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        age: user.age || "",
        weight: user.weight || "",
        height: user.height || "",
        goals: user.goals || "",
      });
      setPhaseForm((prev) => ({
        ...prev,
        primaryGoal: user.currentPhase?.primaryGoal || "maintaining",
        lifeContext: user.currentPhase?.lifeContext || "working_professional",
        notes: user.currentPhase?.notes || "",
      }));

      // Sync custom goals list
      if (user.currentPhase?.primaryGoal) {
        const isDefault = defaultGoals.some((g) => g.value === user.currentPhase.primaryGoal);
        if (!isDefault) {
          setCustomGoals([{ value: user.currentPhase.primaryGoal, label: user.currentPhase.primaryGoal, isCustom: true }]);
          setGoalHint("You defined your own phase — that takes self-awareness. Your coach will use this to tailor your guidance.");
        } else {
          setCustomGoals([]);
          setGoalHint("");
        }
      } else {
        setCustomGoals([]);
        setGoalHint("");
      }

      // Sync custom contexts list
      if (user.currentPhase?.lifeContext) {
        const isDefault = defaultContexts.some((c) => c.value === user.currentPhase.lifeContext);
        if (!isDefault) {
          setCustomContexts([{ value: user.currentPhase.lifeContext, label: user.currentPhase.lifeContext, isCustom: true }]);
          setContextHint("Naming your situation honestly is the first step to working with it, not against it.");
        } else {
          setCustomContexts([]);
          setContextHint("");
        }
      } else {
        setCustomContexts([]);
        setContextHint("");
      }

      if (user.name) setIsEditingProfile(false);
      if (user.currentPhase?.primaryGoal) setIsEditingPhase(false);
    }
  }, [user]);

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
      setIsEditingProfile(false);
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
      setIsEditingPhase(false);
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

  const handlePhaseCancel = () => {
    setPhaseForm({
      primaryGoal: user?.currentPhase?.primaryGoal || "maintaining",
      lifeContext: user?.currentPhase?.lifeContext || "working_professional",
      notes: "",
    });
    setNewGoalInput("");
    setNewContextInput("");

    if (user?.currentPhase?.primaryGoal) {
      const isDefault = defaultGoals.some((g) => g.value === user.currentPhase.primaryGoal);
      if (!isDefault) {
        setCustomGoals([{ value: user.currentPhase.primaryGoal, label: user.currentPhase.primaryGoal, isCustom: true }]);
        setGoalHint("You defined your own phase — that takes self-awareness. Your coach will use this to tailor your guidance.");
      } else {
        setCustomGoals([]);
        setGoalHint("");
      }
    } else {
      setCustomGoals([]);
      setGoalHint("");
    }

    if (user?.currentPhase?.lifeContext) {
      const isDefault = defaultContexts.some((c) => c.value === user.currentPhase.lifeContext);
      if (!isDefault) {
        setCustomContexts([{ value: user.currentPhase.lifeContext, label: user.currentPhase.lifeContext, isCustom: true }]);
        setContextHint("Naming your situation honestly is the first step to working with it, not against it.");
      } else {
        setCustomContexts([]);
        setContextHint("");
      }
    } else {
      setCustomContexts([]);
      setContextHint("");
    }

    setIsEditingPhase(false);
  };

  const handleAddCustomGoal = () => {
    const trimmed = newGoalInput.trim();
    if (!trimmed) return;
    const exists = allGoals.some((g) => g.label.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      const match = allGoals.find((g) => g.label.toLowerCase() === trimmed.toLowerCase());
      setPhaseForm((prev) => ({ ...prev, primaryGoal: match.value }));
      setGoalHint(match.isCustom ? "You defined your own phase — that takes self-awareness. Your coach will use this to tailor your guidance." : "");
      setNewGoalInput("");
      return;
    }
    const newGoalObj = { value: trimmed, label: trimmed, isCustom: true };
    setCustomGoals((prev) => [...prev, newGoalObj]);
    setPhaseForm((prev) => ({ ...prev, primaryGoal: trimmed }));
    setGoalHint("You defined your own phase — that takes self-awareness. Your coach will use this to tailor your guidance.");
    setNewGoalInput("");
  };

  const handleAddCustomContext = () => {
    const trimmed = newContextInput.trim();
    if (!trimmed) return;
    const exists = allContexts.some((c) => c.label.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      const match = allContexts.find((c) => c.label.toLowerCase() === trimmed.toLowerCase());
      setPhaseForm((prev) => ({ ...prev, lifeContext: match.value }));
      setContextHint(match.isCustom ? "Naming your situation honestly is the first step to working with it, not against it." : "");
      setNewContextInput("");
      return;
    }
    const newContextObj = { value: trimmed, label: trimmed, isCustom: true };
    setCustomContexts((prev) => [...prev, newContextObj]);
    setPhaseForm((prev) => ({ ...prev, lifeContext: trimmed }));
    setContextHint("Naming your situation honestly is the first step to working with it, not against it.");
    setNewContextInput("");
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
            {user?.email && <p className="profile-email-text">{user.email}</p>}
          </div>
        </div>

        <div className="profile-floating-phase-card">
          <span className="phase-card-label">CURRENT PHASE</span>
          <strong className="phase-card-title">
            {activeGoal?.label || user?.currentPhase?.primaryGoal || "Not set"}
          </strong>
          <span className="phase-card-context">
            {activeContext?.label || user?.currentPhase?.lifeContext || "No context"}
          </span>
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
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="profile-tabs-divider" />

      <div className="profile-content-scroll-area">
        {activeTab === "profile" && (
          <section className="profile-cinematic-section fade-in">
            {!isEditingProfile ? (
              <div className="profile-details-view">
                <div className="profile-stats-row">
                  <div className="profile-stat-item">
                    <span className="profile-stat-value">{user?.age || "—"}</span>
                    <span className="profile-stat-unit"> years</span>
                  </div>
                  <div className="profile-stat-item">
                    <span className="profile-stat-value">{user?.weight || "—"}</span>
                    <span className="profile-stat-unit"> kg</span>
                  </div>
                  <div className="profile-stat-item">
                    <span className="profile-stat-value">{user?.height || "—"}</span>
                    <span className="profile-stat-unit"> cm</span>
                  </div>
                </div>

                <div className="profile-divider" />

                <div className="profile-section-group">
                  <span className="profile-micro-label">NORTH STAR GOAL</span>
                  <p className="profile-goal-italic">
                    {user?.goals || "No North Star goal defined yet. Edit profile to set one."}
                  </p>
                </div>

                <button
                  className="pill-button primary-pill mt-24"
                  onClick={() => setIsEditingProfile(true)}
                >
                  <PencilIcon /> Edit profile
                </button>
              </div>
            ) : (
              <div className="profile-form-view">
                <div className="profile-form-grid">
                  <label className="cinematic-input-wrapper">
                    <span className="profile-micro-label">NAME</span>
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
                    <span className="profile-micro-label">AGE</span>
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
                </div>

                <div className="profile-form-grid mt-16">
                  <label className="cinematic-input-wrapper">
                    <span className="profile-micro-label">WEIGHT (KG)</span>
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
                    <span className="profile-micro-label">HEIGHT (CM)</span>
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
                  <span className="profile-micro-label">NORTH STAR GOAL</span>
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

                <div className="profile-action-row mt-24">
                  <button
                    className="pill-button primary-pill"
                    onClick={handleProfileSave}
                    disabled={updatingProfile}
                  >
                    {updatingProfile ? "Saving..." : "Save profile"}
                  </button>
                  {user?.name && (
                    <button
                      type="button"
                      className="pill-button ghost-pill"
                      onClick={() => {
                        setProfileForm({
                          name: user.name || "",
                          age: user.age || "",
                          weight: user.weight || "",
                          height: user.height || "",
                          goals: user.goals || "",
                        });
                        setIsEditingProfile(false);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "phase" && (
          <section className="profile-cinematic-section fade-in">
            {!isEditingPhase ? (
              <div className="phase-details-view">
                <div className="phase-details-block">
                  <span className="profile-micro-label">CURRENT PHASE</span>
                  <h3 className="phase-details-title">
                    {activeGoal?.label || user?.currentPhase?.primaryGoal || "Not set"}
                  </h3>
                  <p className="phase-details-context">
                    {activeContext?.label || user?.currentPhase?.lifeContext || "No context"}
                  </p>
                </div>

                {user?.currentPhase?.notes && (
                  <div className="phase-details-notes-section mt-24">
                    <span className="profile-micro-label">PHASE NOTES</span>
                    <p className="phase-details-notes-text">
                      {user.currentPhase.notes}
                    </p>
                  </div>
                )}

                <button
                  className="pill-button primary-pill mt-24"
                  onClick={() => setIsEditingPhase(true)}
                >
                  <PencilIcon /> Edit phase
                </button>
              </div>
            ) : (
              <div className="phase-form-view">
                <div className="chip-section-group">
                  <span className="profile-micro-label">PRIMARY PHASE</span>
                  <div className="chips-grid-wrap mt-8">
                    {allGoals.map((goal) => (
                      <Chip
                        key={goal.value}
                        label={goal.label}
                        active={phaseForm.primaryGoal === goal.value}
                        isCustom={goal.isCustom}
                        onClick={() => {
                          if (phaseForm.primaryGoal !== goal.value) {
                            setPhaseForm((prev) => ({ ...prev, primaryGoal: goal.value }));
                            if (goal.isCustom) {
                              setGoalHint("You defined your own phase — that takes self-awareness. Your coach will use this to tailor your guidance.");
                            } else {
                              setGoalHint("");
                            }
                          }
                        }}
                        onRemove={() => {
                          setCustomGoals(customGoals.filter((g) => g.value !== goal.value));
                          if (phaseForm.primaryGoal === goal.value) {
                            setPhaseForm((prev) => ({ ...prev, primaryGoal: defaultGoals[0].value }));
                            setGoalHint("");
                          }
                        }}
                      />
                    ))}
                  </div>
                  <div className="add-custom-chip-row mt-12">
                    <input
                      type="text"
                      placeholder="Or define your own phase..."
                      value={newGoalInput}
                      className="cinematic-text-input add-chip-input"
                      onChange={(e) => setNewGoalInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomGoal();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="pill-button primary-pill"
                      onClick={handleAddCustomGoal}
                    >
                      Add
                    </button>
                  </div>
                  {goalHint && (
                    <p className="reflection-hint mt-8">{goalHint}</p>
                  )}
                </div>

                <div className="chip-section-group mt-24">
                  <span className="profile-micro-label">LIFE CONTEXT</span>
                  <p className="chips-explanatory-line mt-4">
                    This tells your coach what your days actually look like — stress, time, energy.
                  </p>
                  <div className="chips-grid-wrap mt-8">
                    {allContexts.map((context) => (
                      <Chip
                        key={context.value}
                        label={context.label}
                        active={phaseForm.lifeContext === context.value}
                        isCustom={context.isCustom}
                        onClick={() => {
                          if (phaseForm.lifeContext !== context.value) {
                            setPhaseForm((prev) => ({ ...prev, lifeContext: context.value }));
                            if (context.isCustom) {
                              setContextHint("Naming your situation honestly is the first step to working with it, not against it.");
                            } else {
                              setContextHint("");
                            }
                          }
                        }}
                        onRemove={() => {
                          setCustomContexts(customContexts.filter((c) => c.value !== context.value));
                          if (phaseForm.lifeContext === context.value) {
                            setPhaseForm((prev) => ({ ...prev, lifeContext: defaultContexts[0].value }));
                            setContextHint("");
                          }
                        }}
                      />
                    ))}
                  </div>
                  <div className="add-custom-chip-row mt-12">
                    <input
                      type="text"
                      placeholder="Or define your own context..."
                      value={newContextInput}
                      className="cinematic-text-input add-chip-input"
                      onChange={(e) => setNewContextInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomContext();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="pill-button primary-pill"
                      onClick={handleAddCustomContext}
                    >
                      Add
                    </button>
                  </div>
                  {contextHint && (
                    <p className="reflection-hint mt-8">{contextHint}</p>
                  )}
                </div>

                <label className="cinematic-input-wrapper full-width-field mt-24">
                  <span className="profile-micro-label">NOTES</span>
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

                <div className="profile-action-row mt-24">
                  <button
                    className="pill-button primary-pill"
                    onClick={handlePhaseSave}
                    disabled={updatingPhase}
                  >
                    {updatingPhase ? "Updating..." : "Update phase"}
                  </button>
                  {user?.currentPhase?.primaryGoal && (
                    <button
                      type="button"
                      className="pill-button ghost-pill"
                      onClick={handlePhaseCancel}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "history" && (
          <section className="profile-cinematic-section fade-in">
            <span className="profile-micro-label">PHASE HISTORY</span>
            {!phases?.length ? (
              <p className="cinematic-empty-state">No phase history recorded yet.</p>
            ) : (
              <div className="phase-history-flat-list mt-8">
                {phases.map((phase) => {
                  const goalName = defaultGoals.find((g) => g.value === phase.primaryGoal)?.label || phase.primaryGoal;
                  const contextName = defaultContexts.find((c) => c.value === phase.lifeContext)?.label || phase.lifeContext;
                  const isActive = !phase.endDate;

                  return (
                    <div key={phase._id} className="history-flat-item">
                      <div className="history-flat-left">
                        <span className="history-flat-title">{goalName}</span>
                        <span className="history-flat-context">{contextName}</span>
                        <span className="history-flat-date">
                          {formatDisplayDate(phase.startDate)}
                          {phase.endDate
                            ? ` to ${formatDisplayDate(phase.endDate)}`
                            : " to Present"}
                        </span>
                        {phase.notes && (
                          <p className="history-flat-notes">{phase.notes}</p>
                        )}
                      </div>
                      <div className="history-flat-right">
                        {isActive && (
                          <span className="history-active-badge">Current</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="history-evolved-note mt-24">
              Your phase history builds a picture of how your life and goals have evolved over time.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
