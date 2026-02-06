import { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import "./Portfolio.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const API = "https://localhost:7283";

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
  const [portfolio, setPortfolio] = useState([]);
  const [balance, setBalance] = useState(0);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadPortfolio = async () => {
      try {
        const portfolioRes = await axios.get(
          `${API}/api/trade/portfolio`
        );

        const holdings = portfolioRes.data.holdings || [];

        const priceRequests = holdings.map((h) =>
          axios
            .get(`${API}/api/price?symbol=${h.symbol}`)
            .then((res) => ({
              symbol: h.symbol,
              price: Number(res.data) || 0,
            }))
        );

        const results = await Promise.all(priceRequests);
        const priceMap = {};
        results.forEach((p) => (priceMap[p.symbol] = p.price));

        if (active) {
          setPortfolio(holdings);
          setBalance(portfolioRes.data.balance || 0);
          setPrices(priceMap);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadPortfolio();
    return () => (active = false);
  }, []);

  const invested = portfolio.reduce(
    (s, p) => s + p.quantity * p.avgBuy,
    0
  );

  const currentValue = portfolio.reduce(
    (s, p) => s + p.quantity * (prices[p.symbol] || 0),
    0
  );

  const pnl = currentValue - invested;
  const pnlPct = invested ? (pnl / invested) * 100 : 0;

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
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#cfd6e4", font: { size: 11 } },
      },
    },
  };

  if (loading) return <div className="loading">Loading portfolio...</div>;

  return (
    <div className="portfolio-page">
      <h1>Portfolio</h1>

      {/* SUMMARY */}
      <div className="summary-grid">
        <div className="summary-card">
          <p>Balance</p>
          <h3>${balance.toLocaleString()}</h3>
        </div>

        <div className="summary-card">
          <p>Invested</p>
          <h3>${invested.toLocaleString()}</h3>
        </div>

        <div className="summary-card">
          <p>Value</p>
          <h3>${currentValue.toLocaleString()}</h3>
        </div>

        <div className={`summary-card ${pnl >= 0 ? "profit" : "loss"}`}>
          <p>P / L</p>
          <h3>
            ${pnl.toLocaleString()} ({pnlPct.toFixed(2)}%)
          </h3>
        </div>
      </div>

      {/* CHARTS */}
      <div className="charts-grid">
        <div className="chart-card">
          <h4>Asset Allocation</h4>
          <div className="chart-wrapper">
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h4>Diversification</h4>
          <div className="chart-wrapper">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* HOLDINGS (MAP) */}
      <h2 className="section-title">Holdings</h2>

      <div className="holdings">
        {portfolio.map((p) => {
          const price = prices[p.symbol] || 0;
          const value = p.quantity * price;
          const assetPnl = (price - p.avgBuy) * p.quantity;

          return (
            <div className="holding-row" key={p.symbol}>
              <div className="coin">
                <img src={COIN_LOGOS[p.symbol]} alt={p.symbol} />
                <strong>{p.symbol}</strong>
              </div>

              <div>Qty: {p.quantity.toFixed(4)}</div>
              <div>Avg: ${p.avgBuy.toLocaleString()}</div>
              <div>LTP: ${price.toLocaleString()}</div>
              <div>Value: ${value.toLocaleString()}</div>

              <div className={assetPnl >= 0 ? "profit" : "loss"}>
                ${assetPnl.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
