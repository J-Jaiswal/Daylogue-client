import { Link } from "react-router-dom";

const pillars = [
  {
    icon: "🔍",
    title: "Daily Awareness",
    text: "Capture sleep, training, and nutrition without friction. Three signals. One minute. Every day — the data that actually moves the needle.",
  },
  {
    icon: "🤖",
    title: "AI That Knows You",
    text: "Your coach reads your last 14 days, your current life phase, and your north-star goal before it says anything. No generic advice.",
  },
  {
    icon: "📈",
    title: "Patterns That Matter",
    text: "See 90 days of history in a single scroll. Filter by what you actually want to find — days you trained, days you slept well, days you slipped.",
  },
];

const signals = [
  {
    icon: "🌙",
    label: "Sleep",
    metric: "7h 45m",
    tag: "On target",
    color: "var(--accent)",
  },
  {
    icon: "💪",
    label: "Training",
    metric: "3 sessions",
    tag: "This week",
    color: "var(--amber)",
  },
  {
    icon: "🥗",
    label: "Nutrition",
    metric: "3 meals",
    tag: "Logged today",
    color: "var(--green)",
  },
];

export default function HomePage() {
  return (
    <div className="home-info-page">
      <section className="home-info-hero">
        {/* ── Copy ── */}
        <div className="home-info-copy">
          <span className="home-info-kicker">Daylogue</span>
          <h1>Understand the life you are building.</h1>
          <p>
            Not a tracker. A mirror. Daylogue connects your daily sleep,
            training, and nutrition to your long-term goals — then lets your AI
            coach tell you exactly what to do next.
          </p>
          <p className="home-info-sub">
            Three inputs a day. One performance score. A coach that actually
            knows your week.
          </p>
          <div className="home-info-actions">
            <Link className="btn-primary home-info-action" to="/dashboard">
              Go to Dashboard
            </Link>
            <Link className="btn-secondary home-info-action" to="/log">
              Log Today
            </Link>
          </div>
        </div>

        {/* ── Hero panel ── */}
        <div className="home-info-panel" aria-label="App preview">
          {/* Score preview */}
          <div className="hero-score-preview">
            <div className="hero-score-ring">
              <svg viewBox="0 0 100 100" className="hero-score-svg">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-strong)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="263.9"
                  strokeDashoffset="68"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="hero-score-center">
                <span className="hero-score-num">74</span>
                <span className="hero-score-sub">/ 100</span>
              </div>
            </div>
            <div className="hero-score-info">
              <span className="hero-score-label">Strong</span>
              <span className="hero-score-desc">Today's performance score</span>
            </div>
          </div>

          {/* Signal cards */}
          <div className="hero-signal-cards">
            {signals.map((s) => (
              <div className="hero-signal-card" key={s.label} style={{ "--signal-color": s.color }}>
                <span className="hero-signal-icon">{s.icon}</span>
                <div className="hero-signal-body">
                  <span className="hero-signal-label">{s.label}</span>
                  <span className="hero-signal-metric">{s.metric}</span>
                  <span className="hero-signal-tag">{s.tag}</span>
                </div>
              </div>
            ))}
          </div>

          {/* AI coach note */}
          <div className="hero-coach-note">
            <span className="hero-coach-icon">🤖</span>
            <p>
              Sleep is solid. Add one more strength session this week to hit your
              building phase target.
            </p>
          </div>
        </div>
      </section>

      {/* ── Pillars ── */}
      <section className="home-info-strip">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="home-info-pillar">
            <span className="pillar-icon">{pillar.icon}</span>
            <h2>{pillar.title}</h2>
            <p>{pillar.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
