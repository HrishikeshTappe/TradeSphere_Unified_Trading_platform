import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Trade from "./components/Trade";
import Aboutus from "./components/Aboutus";
import Portfolio from "./components/Portfolio";
import Watchlist from "./components/Watchlist";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Contact from "./components/Contact";
import ProtectedRoute from "./components/ProtectedRoute";

import "./index.css";
import AdminDashboard from "./components/AdminDashboard";
import ChatWidget from "./components/Chatbot/ChatWidget";

export default function App() {
  const [currency, setCurrency] = useState("USD");
  const [theme, setTheme] = useState("dark");
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    alert("Logged out successfully! 👋");
    window.location.href = "/"; // Redirect to home page
  };

  // Update authentication state when token changes
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    // Check on mount
    checkAuth();

    // Listen for storage changes (for logout from other tabs)
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className={`app ${theme}`}>
        <Navbar
          currency={currency}
          setCurrency={setCurrency}
          theme={theme}
          setTheme={setTheme}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <div className="app-content">
          <Routes>
            {/* 🌐 Public Routes - Accessible without login */}
            <Route path="/" element={<Home />} />
            <Route path="/aboutus" element={<Aboutus />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<Register />} />

            {/* 🔒 Protected Routes - User & Admin */}
            <Route
              path="/trade"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Trade currency={currency} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/portfolio"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Portfolio currency={currency} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/watchlist"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Watchlist />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* 🛡️ Admin Only Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>

        </div>

        <Footer />
        {/* Chat Widget (Global) */}
        {isAuthenticated && <ChatWidget />}
      </div>
    </BrowserRouter>
  );
}
