import { useEffect, useState } from "react";
import "./Home.css";

/* ================= HERO SLIDES ================= */

const slides = [
  {
    title: "Trade Crypto & Stocks",
    desc: "One powerful platform for smart trading simulation",
    image:
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=2400&q=80",
    btn: "Start Trading",
  },
  {
    title: "Crypto Market Analytics",
    desc: "Live prices with real-time market data",
    image:
      "https://images.unsplash.com/photo-1640161704729-cbe966a08476?auto=format&fit=crop&w=2400&q=80",
    btn: "View Markets",
  },
  {
    title: "Smart Portfolio",
    desc: "Track profit, loss & asset allocation",
    image:
      "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?auto=format&fit=crop&w=1920&q=80",
    btn: "My Portfolio",
  },
  {
    title: "Risk-Free Simulator",
    desc: "Practice trading with virtual money",
    image:
      "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=1920&q=80",
    btn: "Explore",
  },
];

/* ================= COIN MAPPING ================= */

const COINS = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  DOGE: "dogecoin",
  LTC: "litecoin",
  TRX: "tron",
  AVAX: "avalanche-2",
  LINK: "chainlink",
};

export default function Home() {
  const [index, setIndex] = useState(0);
  const [market, setMarket] = useState([]);

  /* ================= FETCH LIVE MARKET ================= */

  const fetchMarket = async () => {
    try {
      const ids = Object.values(COINS).join(",");

      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );

      if (!res.ok) throw new Error("CoinGecko API error");

      const data = await res.json();

      const formatted = Object.keys(COINS).map((symbol) => {
        const id = COINS[symbol];
        const price = data[id]?.usd ?? 0;
        const change = data[id]?.usd_24h_change ?? 0;

        return {
          symbol,
          price: `$${price.toLocaleString(undefined, {
            maximumFractionDigits: 4,
          })}`,
          change: `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`,
          type: change >= 0 ? "up" : "down",
        };
      });

      setMarket(formatted);
    } catch (error) {
      console.error("Market fetch failed:", error);
    }
  };

  /* ================= AUTO FETCH ================= */

  useEffect(() => {
    fetchMarket(); // initial load
    const interval = setInterval(fetchMarket, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  /* ================= HERO SLIDER ================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const moveSlide = (step) => {
    setIndex((prev) => (prev + step + slides.length) % slides.length);
  };

  return (
    <>
      {/* ================= HERO ================= */}
      <div className="home-hero">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`home-slide ${i === index ? "active" : ""}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="overlay" />
            <div className="home-content">
              <h1>{slide.title}</h1>
              <p>{slide.desc}</p>
              <button>{slide.btn}</button>
            </div>
          </div>
        ))}

        <div className="home-nav">
          <span onClick={() => moveSlide(-1)}>❮</span>
          <span onClick={() => moveSlide(1)}>❯</span>
        </div>
      </div>

      {/* ================= FEATURES ================= */}
      <section className="home-section">
        <h2>Everything you need to trade smarter</h2>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>📈 Real-Time Prices</h3>
            <p>Live crypto prices from global markets.</p>
          </div>
          <div className="feature-card">
            <h3>💼 Portfolio Insights</h3>
            <p>Track P&L and allocation in real time.</p>
          </div>
          <div className="feature-card">
            <h3>📊 Advanced Charts</h3>
            <p>Professional market visualizations.</p>
          </div>
          <div className="feature-card">
            <h3>🛡️ Risk-Free Simulator</h3>
            <p>Trade safely with virtual funds.</p>
          </div>
        </div>
      </section>

      {/* ================= LIVE MARKET ================= */}
      <section className="market-section">
        <h2>Live Market</h2>

        <div className="mini-chart-grid">
          {market.map((coin) => (
            <MiniChart key={coin.symbol} {...coin} />
          ))}
        </div>
      </section>
    </>
  );
}

/* ================= MINI CHART ================= */

function MiniChart({ symbol, price, change, type }) {
  const points =
    type === "up"
      ? "0,30 10,28 20,26 30,24 40,22 50,20 60,18 70,16 80,14 90,12 100,10"
      : "0,10 10,12 20,14 30,16 40,18 50,20 60,22 70,24 80,26 90,28 100,30";

  return (
    <div className="mini-chart-card">
      <div className="mc-header">
        <span>{symbol}</span>
        <strong>{price}</strong>
      </div>

      <svg viewBox="0 0 100 40" className={`spark ${type}`}>
        <polyline points={points} />
      </svg>

      <p className={type}>{change}</p>
    </div>
  );
}
