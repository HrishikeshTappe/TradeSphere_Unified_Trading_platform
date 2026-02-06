import React from "react";
import logo from "../assets/logo.jpg";
import { NavLink, useNavigate } from "react-router-dom";
import { Navbar as BsNavbar, Nav, Container, NavDropdown } from "react-bootstrap";
import "./Navbar.css";

export default function Navbar({
  currency,
  setCurrency,
  theme,
  setTheme,
  isAuthenticated,
  onLogout
}) {
  const navigate = useNavigate();

  return (
    <BsNavbar expand="lg" className="custom-navbar" variant="dark">
      <Container fluid>
        {/* LOGO */}
        <BsNavbar.Brand as={NavLink} to="/" className="d-flex align-items-center gap-2">
          <img src={logo} alt="TradeSphere Logo" className="logo-icon" />
          <span className="brand-text">TradeSphere</span>
        </BsNavbar.Brand>

        <BsNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BsNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* Always visible - Public */}
            <Nav.Link as={NavLink} to="/">Home</Nav.Link>
            <Nav.Link as={NavLink} to="/aboutus">About Us</Nav.Link>
            <Nav.Link as={NavLink} to="/contact">Contact</Nav.Link>

            {/* Only visible when authenticated - User & Admin */}
            {isAuthenticated && (
              <>
                <Nav.Link as={NavLink} to="/trade">Trade</Nav.Link>
                <Nav.Link as={NavLink} to="/portfolio">Portfolio</Nav.Link>
                <Nav.Link as={NavLink} to="/watchlist">Watchlist</Nav.Link>
              </>
            )}

            {/* Only visible for Admin */}
            {isAuthenticated && localStorage.getItem("role") === "ADMIN" && (
              <Nav.Link as={NavLink} to="/admin/dashboard" className="text-warning">
                Admin Dashboard 🛡️
              </Nav.Link>
            )}
          </Nav>

          <Nav className="align-items-center gap-2">
            {!isAuthenticated ? (
              <>
                <Nav.Link as={NavLink} to="/login">Login</Nav.Link>
                <Nav.Link as={NavLink} to="/register">Register</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/profile">
                  👤 Profile
                </Nav.Link>

                <NavDropdown
                  title="⋮"
                  id="settings-dropdown"
                  align="end"
                  className="settings-dropdown-toggle"
                >
                  <NavDropdown.Item onClick={() => setCurrency(currency === "USD" ? "INR" : "USD")}>
                    🌍 Currency: <strong>{currency}</strong>
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={onLogout} className="text-danger">
                    🚪 Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}
