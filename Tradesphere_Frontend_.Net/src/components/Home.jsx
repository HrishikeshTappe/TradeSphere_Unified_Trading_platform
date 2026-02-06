import { useEffect, useState } from "react";
import "./Home.css";

const slides = [
  {
    title: "Trade With TradeSphere  🚀",
    desc: "One powerful platform for smart trading simulation",
    image:
      "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=2400&q=80",
    btn: "Start Trading",
  },
];

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

const COIN_LOGOS = {
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  BNB: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  XRP: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  DOGE: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  LTC: "https://assets.coingecko.com/coins/images/2/small/litecoin.png",
  TRX: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png",
  AVAX: "https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png",
  LINK: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
};

export default function Home() {
  const [index, setIndex] = useState(0);
  const [market, setMarket] = useState([]);

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

  useEffect(() => {
    fetchMarket();
    const interval = setInterval(fetchMarket, 30000);
    return () => clearInterval(interval);
  }, []);

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
          <span onClick={() => moveSlide(-1)}></span>
          <span onClick={() => moveSlide(1)}></span>
        </div>
      </div>

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
            <h3>📊 Visual Analytics</h3>
            <p>Professional market visualizations.</p>
          </div>
          <div className="feature-card">
            <h3>🛡️ Risk-Free Simulator</h3>
            <p>Trade safely with virtual funds.</p>
          </div>
        </div>
      </section>

      <section className="info-section">
        <h2>Stock & Crypto Trading Made Simple</h2>

        <div className="info-row">
          <img
            src="https://www.istockphoto.com/photo/abstract-stock-market-ticker-with-prices-percentage-changes-gm2163573192-583913372?utm_source=unsplash&utm_medium=affiliate&utm_campaign=srp_photos_bottom&utm_content=https%3A%2F%2Funsplash.com%2Fs%2Fphotos%2Fstock-market&utm_term=stock+market%3A%3Areset-search-state%3Acontrol%3Aadf69c32-f22e-4bfe-b727-c227fec27275"
            alt="Stock Market"
          />
          <div>
            <h3>Stock Market Trading</h3>
            <p>
              Trade shares of real companies like Apple, Tesla and Google.
              Analyze charts, follow company fundamentals, and grow wealth.
            </p>
          </div>
        </div>

        <div className="info-row reverse">
          <img
            src="https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80"
            alt="Crypto Market"
          />
          <div>
            <h3>Cryptocurrency Trading</h3>
            <p>
              Buy and sell digital assets like Bitcoin and Ethereum.
              Crypto markets operate 24/7 worldwide.
            </p>
          </div>
        </div>
      </section>

      <section className="compare-section">
        <h2>Stocks vs Crypto</h2>
        <div className="compare-grid">
          <div className="compare-card">
            <h3>📈 Stocks</h3>
            <p>Company ownership</p>
            <p>Market hours</p>
            <p>Lower volatility</p>
          </div>
          <div className="compare-card">
            <h3>🚀 Crypto</h3>
            <p>Digital assets</p>
            <p>24/7 market</p>
            <p>High volatility</p>
          </div>
        </div>
      </section>

      <section className="market-section">
        <h2>Live Market</h2>
        <div className="mini-chart-grid">
          {market.map((coin) => (
            <MiniChart
              key={coin.symbol}
              {...coin}
              logo={COIN_LOGOS[coin.symbol]}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function MiniChart({ symbol, price, change, type, logo }) {
  const points =
    type === "up"
      ? "0,30 10,28 20,26 30,24 40,22 50,20 60,18 70,16 80,14 90,12 100,10"
      : "0,10 10,12 20,14 30,16 40,18 50,20 60,22 70,24 80,26 90,28 100,30";

  return (
    <div className="mini-chart-card">
      <div className="mc-header">
        <div className="coin-info">
          <img src={logo} alt={symbol} className="coin-logo" />
          <span>{symbol}</span>
        </div>
        <strong>{price}</strong>
      </div>

      <svg viewBox="0 0 100 40" className={`spark ${type}`}>
        <polyline points={points} />
      </svg>

      <p className={type}>{change}</p>
    </div>
  );
}
