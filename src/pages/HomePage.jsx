import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ThreeBackground from "../components/home/ThreeBackground";

const getSecondSpaceIndex = (str) => {
  let spaceCount = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === " ") {
      spaceCount++;
      if (spaceCount === 2) {
        return i;
      }
    }
  }
  return -1;
};

const pillars = [
  {
    color: "#7F77DD",
    colorDim: "rgba(127,119,221,0.12)",
    colorBorder: "rgba(127,119,221,0.25)",
    emoji: "🌙",
    name: "Sleep",
    hook: "Runs your brain & immune system",
    stat: "40%",
    statLabel: "memory drops after one bad night",
    risks: ["Depression", "Weight gain", "Poor focus"],
  },
  {
    color: "#1D9E75",
    colorDim: "rgba(29,158,117,0.12)",
    colorBorder: "rgba(29,158,117,0.25)",
    emoji: "🥗",
    name: "Nutrition",
    hook: "Fuels every cell you have",
    stat: "80%",
    statLabel: "of chronic disease is diet-related",
    risks: ["Inflammation", "Low energy", "Hormonal issues"],
  },
  {
    color: "#EF9F27",
    colorDim: "rgba(239,159,39,0.12)",
    colorBorder: "rgba(239,159,39,0.25)",
    emoji: "💪",
    name: "Exercise",
    hook: "Keeps you sharp, strong & resilient",
    stat: "30%",
    statLabel: "lower mortality with 150 min/week",
    risks: ["Muscle loss", "Low mood", "Metabolic slowdown"],
  },
];

const steps = [
  { 
    num: "01", 
    title: "Define your active phase", 
    text: "Set your focus (e.g., fat loss, career stress) and life context to establish the baseline for your coaching." 
  },
  { 
    num: "02", 
    title: "Log the vital three", 
    text: "Log your sleep sessions, workouts, and nutrition in under 60 seconds. Quick, low-friction tracking." 
  },
  { 
    num: "03", 
    title: "AI unlocks your potential", 
    text: "AI evaluates your daily habits through the lens of your active goals, giving you the suggestions needed to optimize performance." 
  },
];

export default function HomePage() {
  const [typedText, setTypedText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(80);

  const phrases = [
    "Aligned With Your Phase",
    "Guided By Your Goals",
    "Tailored To Your Focus"
  ];

  useEffect(() => {
    let timer;
    const currentPhrase = phrases[phraseIdx];

    if (isDeleting) {
      timer = setTimeout(() => {
        setTypedText(currentPhrase.substring(0, typedText.length - 1));
        setTypingSpeed(45);
      }, typingSpeed);
    } else {
      timer = setTimeout(() => {
        setTypedText(currentPhrase.substring(0, typedText.length + 1));
        setTypingSpeed(90);
      }, typingSpeed);
    }

    if (!isDeleting && typedText === currentPhrase) {
      timer = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && typedText === "") {
      setIsDeleting(false);
      setPhraseIdx((prev) => (prev + 1) % phrases.length);
      setTypingSpeed(300);
    }

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, phraseIdx, typingSpeed]);

  const currentPhrase = phrases[phraseIdx];
  const secondSpaceIdx = getSecondSpaceIndex(currentPhrase);

  const renderSubheading = () => {
    if (secondSpaceIdx === -1) {
      return (
        <>
          <span>{typedText}</span>
          <span className="hp3-cursor" />
          <span style={{ opacity: 0, pointerEvents: 'none', userSelect: 'none' }}>
            {currentPhrase.substring(typedText.length)}
          </span>
        </>
      );
    }

    const part1Full = currentPhrase.substring(0, secondSpaceIdx);
    const part2Full = currentPhrase.substring(secondSpaceIdx);

    const part1Typed = typedText.substring(0, secondSpaceIdx);
    const part2Typed = typedText.substring(secondSpaceIdx);

    const isPart1Complete = typedText.length >= secondSpaceIdx;

    return (
      <>
        <span>
          <span>{part1Typed}</span>
          {!isPart1Complete && <span className="hp3-cursor" />}
          <span style={{ opacity: 0, pointerEvents: 'none', userSelect: 'none' }}>
            {part1Full.substring(part1Typed.length)}
          </span>
        </span>
        <br className="hp3-mobile-only-br" />
        <span>
          <span>{part2Typed}</span>
          {isPart1Complete && <span className="hp3-cursor" />}
          <span style={{ opacity: 0, pointerEvents: 'none', userSelect: 'none' }}>
            {part2Full.substring(part2Typed.length)}
          </span>
        </span>
      </>
    );
  };

  return (
    <>
      {/* ── 3D WebGL background — fixed, full viewport ── */}
      <ThreeBackground />

      <div className="hp3-root">

        {/* ══ HERO ═════════════════════════════════════════ */}
        <section className="hp3-hero">
          <div className="hp3-inner">

            <div className="hp3-eyebrow">
              <span className="hp3-eyebrow-ring" />
              <span>Your daily performance OS</span>
            </div>

            <h1 className="hp3-h1">
              Health Pillars<br />
              <span className="hp3-h1-gradient">
                {renderSubheading()}
              </span>
            </h1>

            <p className="hp3-lead">
              Sleep, exercise, and nutrition dictate your daily performance. Daylogue pairs these 
              essentials with your active life phase and goals, enabling AI to deliver context-driven 
              guidance that unlocks your potential.
            </p>

            <div className="hp3-hero-actions">
              <Link to="/dashboard" className="hp3-btn-primary">
                <span>Open Dashboard</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link to="/log" className="hp3-btn-ghost">Log today</Link>
            </div>

            {/* Three habit tags */}
            <div className="hp3-habit-tags">
              {pillars.map(p => (
                <div key={p.name} className="hp3-habit-tag" style={{ "--hc": p.color, "--hd": p.colorDim, "--hb": p.colorBorder }}>
                  <span className="hp3-tag-pip" />
                  <span className="hp3-tag-emoji">{p.emoji}</span>
                  {p.name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ DIVIDER ═══════════════════════════════════════ */}
        <div className="hp3-full-divider" />

        {/* ══ THREE PILLARS — flat rows ═════════════════════ */}
        <section className="hp3-pillars">
          <div className="hp3-inner">
            <p className="hp3-section-label">The three levers that control everything</p>

            <div className="hp3-pillar-rows">
              {pillars.map((p) => (
                <div
                  key={p.name}
                  className="hp3-pillar-row"
                  style={{ "--pc": p.color, "--pd": p.colorDim }}
                >
                  <div className="hp3-pr-left">
                    <span className="hp3-pr-emoji">{p.emoji}</span>
                    <div>
                      <span className="hp3-pr-name" style={{ color: p.color }}>{p.name}</span>
                      <p className="hp3-pr-hook">{p.hook}</p>
                    </div>
                  </div>

                  <div className="hp3-pr-stat">
                    <span className="hp3-pr-stat-num">{p.stat}</span>
                    <span className="hp3-pr-stat-label">{p.statLabel}</span>
                  </div>

                  <div className="hp3-pr-risks">
                    <span className="hp3-pr-risks-label">Neglect it →</span>
                    <div className="hp3-pr-tags">
                      {p.risks.map(r => (
                        <span key={r} className="hp3-pr-tag" style={{ "--pc": p.color }}>{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="hp3-full-divider" />

        {/* ══ HOW IT WORKS ══════════════════════════════════ */}
        <section className="hp3-how">
          <div className="hp3-inner">
            <p className="hp3-section-label">How it works</p>
            <div className="hp3-steps">
              {steps.map((s, i) => (
                <div key={s.num} className="hp3-step">
                  <div className="hp3-step-top">
                    <span className="hp3-step-num">{s.num}</span>
                  </div>
                  <h3 className="hp3-step-title">{s.title}</h3>
                  <p className="hp3-step-text">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="hp3-full-divider" />

        {/* ══ CTA ═══════════════════════════════════════════ */}
        <section className="hp3-cta">
          <div className="hp3-inner hp3-cta-inner">
            <p className="hp3-cta-label">Start today</p>
            <h2 className="hp3-cta-h2">It takes 60 seconds.</h2>
            <div className="hp3-cta-actions">
              <Link to="/log" className="hp3-btn-primary hp3-btn-large">
                <span>Log today's entries</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link to="/chat" className="hp3-btn-ghost">Ask your AI coach →</Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
