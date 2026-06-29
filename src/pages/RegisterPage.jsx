import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authApi } from "../api/authApi";
import toast from "react-hot-toast";

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

const Chip = ({ label, active, onClick, onRemove, isCustom }) => {
  return (
    <button
      type="button"
      className={`profile-chip ${active ? "active" : ""}`}
      onClick={onClick}
      style={{ margin: "4px 2px" }}
    >
      <span className="chip-label">{label}</span>
      {isCustom && (
        <span
          className="chip-remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{ marginLeft: "4px" }}
        >
          &times;
        </span>
      )}
    </button>
  );
};

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    weight: "",
    height: "",
    gender: "prefer_not_to_say",
    primaryGoal: "maintaining",
    lifeContext: "working_professional",
    goals: "",
  });

  const [customGoals, setCustomGoals] = useState([]);
  const [customContexts, setCustomContexts] = useState([]);
  const [newGoalInput, setNewGoalInput] = useState("");
  const [newContextInput, setNewContextInput] = useState("");
  const [goalHint, setGoalHint] = useState("");
  const [contextHint, setContextHint] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!form.email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setStep(2);
  };

  const allGoals = [...defaultGoals, ...customGoals];
  const allContexts = [...defaultContexts, ...customContexts];

  const handleAddCustomGoal = () => {
    const trimmed = newGoalInput.trim();
    if (!trimmed) return;
    const exists = allGoals.some((g) => g.label.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      const match = allGoals.find((g) => g.label.toLowerCase() === trimmed.toLowerCase());
      setForm((prev) => ({ ...prev, primaryGoal: match.value }));
      setGoalHint(match.isCustom ? "You defined your own phase — that takes self-awareness. Your coach will use this to tailor your guidance." : "");
      setNewGoalInput("");
      return;
    }
    const newGoalObj = { value: trimmed, label: trimmed, isCustom: true };
    setCustomGoals((prev) => [...prev, newGoalObj]);
    setForm((prev) => ({ ...prev, primaryGoal: trimmed }));
    setGoalHint("You defined your own phase — that takes self-awareness. Your coach will use this to tailor your guidance.");
    setNewGoalInput("");
  };

  const handleAddCustomContext = () => {
    const trimmed = newContextInput.trim();
    if (!trimmed) return;
    const exists = allContexts.some((c) => c.label.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      const match = allContexts.find((c) => c.label.toLowerCase() === trimmed.toLowerCase());
      setForm((prev) => ({ ...prev, lifeContext: match.value }));
      setContextHint(match.isCustom ? "Naming your situation honestly is the first step to working with it, not against it." : "");
      setNewContextInput("");
      return;
    }
    const newContextObj = { value: trimmed, label: trimmed, isCustom: true };
    setCustomContexts((prev) => [...prev, newContextObj]);
    setForm((prev) => ({ ...prev, lifeContext: trimmed }));
    setContextHint("Naming your situation honestly is the first step to working with it, not against it.");
    setNewContextInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        age: form.age ? Number(form.age) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        height: form.height ? Number(form.height) : undefined,
        gender: form.gender,
        currentPhase: {
          primaryGoal: form.primaryGoal,
          lifeContext: form.lifeContext,
        },
        goals: form.goals || undefined,
      };
      const data = await authApi.register(payload);
      login(data.user, data.token);
      toast.success(`Welcome, ${data.user.name}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Daylogue</h1>
        <p className="auth-subtitle" style={{ marginBottom: "20px" }}>
          {step === 1 ? "Step 1 of 2: Profile Info" : "Step 2 of 2: Life Phase & Goals"}
        </p>

        {step === 1 ? (
          <form onSubmit={(e) => e.preventDefault()} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jayesh"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="25"
                min="10"
                max="100"
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                style={{ width: "100%" }}
              >
                <option value="prefer_not_to_say">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                placeholder="70"
              />
            </div>

            <div className="form-group">
              <label>Height (cm)</label>
              <input
                type="number"
                name="height"
                value={form.height}
                onChange={handleChange}
                placeholder="175"
              />
            </div>

            <button type="button" className="btn-primary mt-16" onClick={handleNext}>
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="chip-section-group" style={{ marginBottom: "20px" }}>
              <label className="profile-micro-label" style={{ fontWeight: 700, fontSize: "11px", color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase" }}>Primary Goal</label>
              <div className="chips-grid-wrap mt-8" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                {allGoals.map((goal) => (
                  <Chip
                    key={goal.value}
                    label={goal.label}
                    active={form.primaryGoal === goal.value}
                    isCustom={goal.isCustom}
                    onClick={() => {
                      if (form.primaryGoal !== goal.value) {
                        setForm((prev) => ({ ...prev, primaryGoal: goal.value }));
                        setGoalHint(goal.isCustom ? "You defined your own phase — that takes self-awareness. Your coach will use this to tailor your guidance." : "");
                      }
                    }}
                    onRemove={() => {
                      setCustomGoals(customGoals.filter((g) => g.value !== goal.value));
                      if (form.primaryGoal === goal.value) {
                        setForm((prev) => ({ ...prev, primaryGoal: defaultGoals[0].value }));
                        setGoalHint("");
                      }
                    }}
                  />
                ))}
              </div>
              <div className="add-custom-chip-row mt-12" style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "12px" }}>
                <input
                  type="text"
                  placeholder="Or define your own goal..."
                  value={newGoalInput}
                  className="cinematic-text-input add-chip-input"
                  onChange={(e) => setNewGoalInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomGoal();
                    }
                  }}
                  style={{ flex: 1, padding: "8px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text)", outline: "none" }}
                />
                <button
                  type="button"
                  className="pill-button primary-pill"
                  onClick={handleAddCustomGoal}
                  style={{
                    padding: "8px 16px",
                    background: "linear-gradient(135deg, var(--accent), #9b55ff)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "13px"
                  }}
                >
                  Add
                </button>
              </div>
              {goalHint && (
                <p className="reflection-hint mt-8" style={{ fontSize: "13px", fontStyle: "italic", color: "#7F77DD", marginTop: "8px" }}>{goalHint}</p>
              )}
            </div>

            <div className="chip-section-group" style={{ marginBottom: "20px" }}>
              <label className="profile-micro-label" style={{ fontWeight: 700, fontSize: "11px", color: "var(--text-3)", letterSpacing: "0.07em", textTransform: "uppercase" }}>Life Context</label>
              <p className="chips-explanatory-line mt-4" style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "4px" }}>
                This tells your coach what your days actually look like — stress, time, energy.
              </p>
              <div className="chips-grid-wrap mt-8" style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                {allContexts.map((context) => (
                  <Chip
                    key={context.value}
                    label={context.label}
                    active={form.lifeContext === context.value}
                    isCustom={context.isCustom}
                    onClick={() => {
                      if (form.lifeContext !== context.value) {
                        setForm((prev) => ({ ...prev, lifeContext: context.value }));
                        setContextHint(context.isCustom ? "Naming your situation honestly is the first step to working with it, not against it." : "");
                      }
                    }}
                    onRemove={() => {
                      setCustomContexts(customContexts.filter((c) => c.value !== context.value));
                      if (form.lifeContext === context.value) {
                        setForm((prev) => ({ ...prev, lifeContext: defaultContexts[0].value }));
                        setContextHint("");
                      }
                    }}
                  />
                ))}
              </div>
              <div className="add-custom-chip-row mt-12" style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "12px" }}>
                <input
                  type="text"
                  placeholder="Or describe your situation..."
                  value={newContextInput}
                  className="cinematic-text-input add-chip-input"
                  onChange={(e) => setNewContextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomContext();
                    }
                  }}
                  style={{ flex: 1, padding: "8px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text)", outline: "none" }}
                />
                <button
                  type="button"
                  className="pill-button primary-pill"
                  onClick={handleAddCustomContext}
                  style={{
                    padding: "8px 16px",
                    background: "linear-gradient(135deg, var(--accent), #9b55ff)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "13px"
                  }}
                >
                  Add
                </button>
              </div>
              {contextHint && (
                <p className="reflection-hint mt-8" style={{ fontSize: "13px", fontStyle: "italic", color: "#7F77DD", marginTop: "8px" }}>{contextHint}</p>
              )}
            </div>

            <div className="form-group">
              <label>Freeform Goals</label>
              <input
                type="text"
                name="goals"
                value={form.goals}
                onChange={handleChange}
                placeholder="e.g. gain 5kg by December"
              />
            </div>

            <div className="form-row auth-step2-actions">
              <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </div>
          </form>
        )}

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
