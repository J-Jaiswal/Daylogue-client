import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSleep } from "../../hooks/useSleep";
import BottomNav from "./BottomNav";

const navItems = [
  { path: "/", label: "Home", end: true },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/log", label: "Log" },
  { path: "/history", label: "History" },
//  { path: "/weekly", label: "Weekly" },
  { path: "/chat", label: "Coach" },
  { path: "/profile", label: "Profile" },
];

export default function Navbar() {
  const { logout, user } = useAuth();
  const { sleepState } = useSleep();
  const navigate = useNavigate();

  const [isLight, setIsLight] = useState(() => {
    return localStorage.getItem("daylogue-theme") === "light";
  });

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isLight) {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("daylogue-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("daylogue-theme", "dark");
    }
  }, [isLight]);

  // Close menu on route change
  const handleNavClick = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          {/* Logomark: two arcs forming a D loop — sleep/wake cycle metaphor */}
          <svg className="navbar-logo-mark" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {/* Outer arc — wakefulness */}
            <path d="M12 2 A10 10 0 0 1 22 12" stroke="url(#logo-grad-1)" strokeWidth="2.5" strokeLinecap="round"/>
            {/* Inner arc — sleep */}
            <path d="M12 22 A10 10 0 0 1 2 12" stroke="url(#logo-grad-2)" strokeWidth="2.5" strokeLinecap="round"/>
            {/* Centre dot — today */}
            <circle cx="12" cy="12" r="2.5" fill="url(#logo-grad-1)"/>
            <defs>
              <linearGradient id="logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7F77DD"/>
                <stop offset="100%" stopColor="#9F99F0"/>
              </linearGradient>
              <linearGradient id="logo-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1D9E75"/>
                <stop offset="100%" stopColor="#7F77DD"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="navbar-wordmark">Daylogue</span>
        </div>


        {/* Desktop nav links */}
        <div className="navbar-links desktop-only">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {item.label}
              {item.path === "/log" && sleepState === "SLEEPING" && (
                <span className="log-pulse-dot" />
              )}
            </NavLink>
          ))}
        </div>

        {/* Right controls */}
        <div className="navbar-controls">
          <button
            className="theme-toggle-btn"
            onClick={() => setIsLight((v) => !v)}
            title={isLight ? "Switch to dark mode" : "Switch to light mode"}
            aria-label="Toggle theme"
          >
            {isLight ? "☽" : "☀"}
          </button>
          <button className="logout-btn desktop-only" onClick={handleLogout}>
            Logout
          </button>

          {/* Mobile hamburger */}
          <button
            className="hamburger-btn mobile-only"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={`ham-line ${menuOpen ? "open" : ""}`}></span>
            <span className={`ham-line ${menuOpen ? "open" : ""}`}></span>
            <span className={`ham-line ${menuOpen ? "open" : ""}`}></span>
          </button>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="mobile-menu" onClick={handleNavClick}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "mobile-nav-link active" : "mobile-nav-link"
              }
            >
              {item.label}
              {item.path === "/log" && sleepState === "SLEEPING" && (
                <span className="log-pulse-dot" />
              )}
            </NavLink>
          ))}
          <button className="mobile-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}

      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </>
  );
}
