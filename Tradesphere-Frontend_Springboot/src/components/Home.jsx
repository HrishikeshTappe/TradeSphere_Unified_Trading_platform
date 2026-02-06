import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [market, setMarket] = useState([]);
  const isAuthenticated = !!localStorage.getItem("token");

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
            <Container className="h-100 position-relative">
              <div className="home-content">
                <h1 className="display-3 fw-bold">{slide.title}</h1>
                <p className="lead">{slide.desc}</p>
                <Button 
                  variant="primary" 
                  className="hero-btn"
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate("/trade");
                    } else {
                      navigate("/login");
                    }
                  }}
                >
                  {isAuthenticated ? "Go to Trading" : "Get Started"}
                </Button>
              </div>
            </Container>
          </div>
        ))}

        <div className="home-nav">
          <span onClick={() => moveSlide(-1)}></span>
          <span onClick={() => moveSlide(1)}></span>
        </div>
      </div>

      <section className="market-section">
        <Container>
          <h2 className="text-center mb-5">Live Market</h2>
          <Row className="g-3">
            {market.map((coin) => (
              <Col xs={12} sm={6} md={4} lg={3} key={coin.symbol}>
                <MiniChart
                  {...coin}
                  logo={COIN_LOGOS[coin.symbol]}
                />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="home-section">
        <Container>
          <h2 className="text-center mb-5">Everything you need to trade smarter</h2>
          <Row className="g-4">
            {[
              { title: "📈 Real-Time Prices", desc: "Live crypto prices from global markets." },
              { title: "💼 Portfolio Insights", desc: "Track P&L and allocation in real time." },
              { title: "📊 Visual Analytics", desc: "Professional market visualizations." },
              { title: "🛡️ Risk-Free Simulator", desc: "Trade safely with virtual funds." }
            ].map((feature, idx) => (
              <Col md={6} lg={3} key={idx}>
                <div className="feature-card h-100">
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className="info-section">
        <Container>
          <h2 className="text-center mb-5">Stock & Crypto Trading Made Simple</h2>

          <Row className="align-items-center mb-5">
            <Col md={6}>
              <img
                src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80"
                alt="Stock Market"
                className="img-fluid rounded shadow"
              />
            </Col>
            <Col md={6} className="mt-4 mt-md-0">
              <h3>Stock Market Trading</h3>
              <p>
                Trade shares of real companies like Apple, Tesla and Google.
                Analyze charts, follow company fundamentals, and grow wealth.
              </p>
            </Col>
          </Row>

          <Row className="align-items-center flex-row-reverse">
            <Col md={6}>
              <img
                src="https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80"
                alt="Crypto Market"
                className="img-fluid rounded shadow"
              />
            </Col>
            <Col md={6} className="mt-4 mt-md-0">
              <h3>Cryptocurrency Trading</h3>
              <p>
                Buy and sell digital assets like Bitcoin and Ethereum.
                Crypto markets operate 24/7 worldwide.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="compare-section">
        <Container>
          <h2 className="text-center mb-5">Stocks vs Crypto</h2>
          <Row className="justify-content-center g-4">
            <Col md={5} lg={4}>
              <div className="compare-card text-center">
                <h3>📈 Stocks</h3>
                <p>Company ownership</p>
                <p>Market hours</p>
                <p>Lower volatility</p>
              </div>
            </Col>
            <Col md={5} lg={4}>
              <div className="compare-card text-center">
                <h3>🚀 Crypto</h3>
                <p>Digital assets</p>
                <p>24/7 market</p>
                <p>High volatility</p>
              </div>
            </Col>
          </Row>
        </Container>
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
    <div className="mini-chart-card h-100">
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

      <p className={`mb-0 ${type}`}>{change}</p>
    </div>
  );
}
