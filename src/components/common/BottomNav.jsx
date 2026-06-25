import { NavLink } from "react-router-dom";
import { useSleep } from "../../hooks/useSleep";

const navItems = [
  { path: "/", label: "Home", icon: "⌂", end: true },
  { path: "/log", label: "Log", icon: "✏", end: false },
  { path: "/history", label: "History", icon: "📋", end: false },
  { path: "/chat", label: "Coach", icon: "✦", end: false },
  { path: "/profile", label: "Profile", icon: "◎", end: false },
];

export default function BottomNav() {
  const { sleepState } = useSleep();
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            isActive ? "bottom-nav-item active" : "bottom-nav-item"
          }
        >
          <span className="bottom-nav-icon" style={{ position: "relative" }}>
            {item.icon}
            {item.path === "/log" && sleepState === "SLEEPING" && (
              <span className="log-pulse-dot-bottom" />
            )}
          </span>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
