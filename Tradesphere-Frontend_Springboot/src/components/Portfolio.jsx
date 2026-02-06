import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import "./Portfolio.css";

ChartJS.register(ArcElement, Tooltip, Legend);

// ✅ SPRING BOOT BASE URL (HTTP ONLY)
const API = "http://localhost:8080";

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

export default function Portfolio() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState([]);
  const [balance, setBalance] = useState(0);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);

  // ================= LOAD PORTFOLIO + PRICES =================
  useEffect(() => {
    let active = true;

    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const authConfig = { headers: { Authorization: `Bearer ${token}` } };

      try {
        // 1️⃣ PORTFOLIO
        const portfolioRes = await axios.get(
          `${API}/api/trade/portfolio`,
          authConfig
        );

        // 2️⃣ ALL PRICES (CoinGecko via Spring Boot)
        const pricesRes = await axios.get(
          `${API}/api/price/all`
        );

        if (active) {
          setPortfolio(portfolioRes.data.holdings || []);
          setBalance(portfolioRes.data.balance || 0);
          setPrices(pricesRes.data || {});
        }
      } catch (err) {
        console.error("Portfolio load error:", err);
        if (err.response && (err.response.status === 403 || err.response.status === 401)) {
          navigate("/login");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => (active = false);
  }, [navigate]);

  // ================= CALCULATIONS =================
  const invested = portfolio.reduce(
    (sum, p) => sum + p.quantity * p.avgBuy,
    0
  );

  const currentValue = portfolio.reduce(
    (sum, p) => sum + p.quantity * (prices[p.symbol] || 0),
    0
  );

  const pnl = currentValue - invested;
  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;

  // ================= CHART DATA =================
  const chartData = {
    labels: portfolio.map((p) => p.symbol),
    datasets: [
      {
        data: portfolio.map(
          (p) => p.quantity * (prices[p.symbol] || 0)
        ),
        backgroundColor: [
          "#f7931a",
          "#627eea",
          "#e63424",
          "#f3ba2f",
          "#23292f",
          "#c2a633",
          "#b8b8b8",
          "#eb0029",
          "#e84142",
          "#2adac8",
        ],
        borderWidth: 0
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#cfd6e4", font: { size: 11 } },
        position: 'bottom'
      },
    },
  };

  if (loading) {
    return <div className="text-center mt-5 text-white">Loading portfolio...</div>;
  }

  // ================= UI =================
  return (
    <Container className="portfolio-page">
      <h1 className="text-center mb-4">Portfolio</h1>

      {/* SUMMARY */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3 mb-md-0">
          <Card className="portfolio-card h-100 text-white">
            <Card.Body>
              <small className="text-muted d-block mb-1">Balance</small>
              <h3 className="mb-0">${balance.toLocaleString()}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3 mb-md-0">
          <Card className="portfolio-card h-100 text-white">
            <Card.Body>
              <small className="text-muted d-block mb-1">Invested</small>
              <h3 className="mb-0">${invested.toLocaleString()}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3 mb-md-0">
          <Card className="portfolio-card h-100 text-white">
            <Card.Body>
              <small className="text-muted d-block mb-1">Current Value</small>
              <h3 className="mb-0">${currentValue.toLocaleString()}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3 mb-md-0">
          <Card className={`portfolio-card h-100 text-white ${pnl >= 0 ? "border-success" : "border-danger"}`}>
            <Card.Body>
              <small className="text-muted d-block mb-1">P / L</small>
              <h3 className={`mb-0 ${pnl >= 0 ? "text-success" : "text-danger"}`}>
                ${pnl.toLocaleString()} <span className="fs-6">({pnlPct.toFixed(2)}%)</span>
              </h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CHARTS */}
      <Row className="mb-4">
        <Col md={6} className="mb-4 mb-md-0">
          <Card className="portfolio-card h-100">
            <Card.Header className="bg-transparent border-secondary text-white">Asset Allocation</Card.Header>
            <Card.Body>
              <div className="chart-wrapper">
                <Pie data={chartData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="portfolio-card h-100">
            <Card.Header className="bg-transparent border-secondary text-white">Diversification</Card.Header>
            <Card.Body>
              <div className="chart-wrapper">
                <Doughnut data={chartData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* HOLDINGS */}
      <h2 className="section-title">Holdings</h2>

      <Row>
        {portfolio.map((p) => {
          const price = prices[p.symbol] || 0;
          const value = p.quantity * price;
          const assetPnl = (price - p.avgBuy) * p.quantity;

          return (
            <Col xl={3} lg={4} md={6} sm={12} key={p.symbol} className="mb-3">
              <Card className="portfolio-card h-100 text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="coin">
                      <img src={COIN_LOGOS[p.symbol]} alt={p.symbol} />
                      <strong className="fs-5">{p.symbol}</strong>
                    </div>
                    <div className={assetPnl >= 0 ? "text-success fw-bold" : "text-danger fw-bold"}>
                      {assetPnl >= 0 ? "+" : ""}${assetPnl.toLocaleString()}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Quantity:</span>
                    <span>{p.quantity.toFixed(6)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Avg Buy:</span>
                    <span>${p.avgBuy.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">LTP:</span>
                    <span>${price.toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between border-top border-secondary pt-2 mt-2">
                    <span className="text-muted">Value:</span>
                    <span className="fw-bold">${value.toLocaleString()}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
        {portfolio.length === 0 && (
          <Col>
            <div className="text-center text-muted p-5 bg-dark rounded border border-secondary">
              No assets in portfolio
            </div>
          </Col>
        )}
      </Row>
    </Container>
  );
}
