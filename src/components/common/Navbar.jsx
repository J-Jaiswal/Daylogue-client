import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const navItems = [
  { path: "/", label: "Home" },
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

  useEffect(() => {
    if (isLight) {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("daylogue-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("daylogue-theme", "dark");
    }
  }, [isLight]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">Daylogue</div>
        <div className="navbar-links">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <button
          className="theme-toggle-btn"
          onClick={() => setIsLight((v) => !v)}
          title={isLight ? "Switch to dark mode" : "Switch to light mode"}
          aria-label="Toggle theme"
        >
          {isLight ? "☽" : "☀"}
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
}
