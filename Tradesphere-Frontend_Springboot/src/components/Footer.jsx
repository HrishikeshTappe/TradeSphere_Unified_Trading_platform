import { NavLink } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        {/* Left */}
        <div className="footer-left">
          <h3>TradeSphere</h3>
          <p>Your smart trading companion</p>
        </div>

        {/* Center Links (same as Navbar) */}
        <div className="footer-center">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/trade">Trade</NavLink>
          <NavLink to="/portfolio">Portfolio</NavLink>
          <NavLink to="/watchlist">Watchlist</NavLink>
        </div>

        {/* Right */}
        <div className="footer-right">
          <span>© {new Date().getFullYear()} TradeSphere</span>
          <span>All Rights Reserved</span>
        </div>
      </div>
    </footer>
  );
}
