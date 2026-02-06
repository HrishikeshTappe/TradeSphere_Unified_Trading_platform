import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Trade from "./components/Trade";
import Aboutus from "./components/Aboutus";   // ✅ only ONE
import Portfolio from "./components/Portfolio";
import Watchlist from "./components/Watchlist";
import Footer from "./components/Footer";

import "./index.css";

export default function App() {
  const [currency, setCurrency] = useState("USD");
  const [theme, setTheme] = useState("dark");

  return (
    <BrowserRouter>
      <div className={`app ${theme}`}>
        <Navbar
          currency={currency}
          setCurrency={setCurrency}
          theme={theme}
          setTheme={setTheme}
        />

        {/* Main Content */}
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trade" element={<Trade currency={currency} />} />
            <Route path="/aboutus" element={<Aboutus />} />   {/* ✅ fixed */}
            <Route path="/portfolio" element={<Portfolio currency={currency} />} />
            <Route path="/watchlist" element={<Watchlist />} />
          </Routes>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}
