import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({
  currency,
  setCurrency,
  theme,
  setTheme
}) {
  return (
    <nav className="navbar">
      <div className="logo">🐂 TradeSphere</div>

      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/trade">Trade</NavLink>
        <NavLink to="/aboutus">About-us</NavLink>
        <NavLink to="/portfolio">Portfolio</NavLink>

        {/* ✅ WATCHLIST & ALERTS */}
        <NavLink to="/watchlist">Watchlist</NavLink>
      </div>

      <div className="nav-actions">
        {/* 🌍 Currency */}
        <button
          className="icon-btn"
          onClick={() =>
            setCurrency(currency === "USD" ? "INR" : "USD")
          }
        >
          🌍 {currency}
        </button>

        {/* 🌙 / ☀️ Theme */}
        <button
          className="icon-btn"
          onClick={() =>
            setTheme(theme === "dark" ? "light" : "dark")
          }
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}
