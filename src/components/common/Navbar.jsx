import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import BottomNav from "./BottomNav";

const navItems = [
  { path: "/", label: "Home", end: true },
  { path: "/dashboard", label: "Dashboard" },
  { path: "/log", label: "Log" },
  { path: "/history", label: "History" },
  { path: "/weekly", label: "Weekly" },
  { path: "/chat", label: "Coach" },
  { path: "/profile", label: "Profile" },
];

export default function Navbar() {
  const { logout } = useAuth();
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
        <div className="navbar-brand">Daylogue</div>

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
