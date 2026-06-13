import { NavLink } from "react-router-dom";

const navItems = [
  { path: "/", label: "Home", icon: "⌂", end: true },
  { path: "/log", label: "Log", icon: "✏", end: false },
  { path: "/history", label: "History", icon: "📋", end: false },
  { path: "/chat", label: "Coach", icon: "✦", end: false },
  { path: "/profile", label: "Profile", icon: "◎", end: false },
];

export default function BottomNav() {
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
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
