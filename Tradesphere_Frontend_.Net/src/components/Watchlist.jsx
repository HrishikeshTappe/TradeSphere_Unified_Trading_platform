/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from "chart.js";
import "./Watchlist.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
);

const API = "https://localhost:7283";

const ASSETS = [
  "BTC","ETH","SOL","BNB","XRP",
  "DOGE","LTC","TRX","AVAX","LINK",
];

const LOGOS = {
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

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [prices, setPrices] = useState({});
  const [prevPrices, setPrevPrices] = useState({});
  const [symbol, setSymbol] = useState("BTC");
  const [search, setSearch] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState(null);

  async function loadWatchlist() {
    const res = await axios.get(`${API}/api/watchlist`);
    setWatchlist([...new Set(res.data.map(w => w.symbol))]);
  }

  async function loadPrices() {
    const p = {};
    for (let a of watchlist) {
      const r = await axios.get(`${API}/api/price?symbol=${a}`);
      p[a] = r.data;
    }
    setPrevPrices(prices);
    setPrices(p);
  }

  useEffect(() => {
    loadWatchlist();
  }, []);

  useEffect(() => {
    if (!watchlist.length) return;
    loadPrices();
    const i = setInterval(loadPrices, 5000);
    return () => clearInterval(i);
  }, [watchlist]);

  async function addToWatchlist() {
    if (watchlist.includes(symbol)) return;
    await axios.post(`${API}/api/watchlist/add?symbol=${symbol}`);
    loadWatchlist();
  }

  async function removeFromWatchlist(sym) {
    await axios.delete(`${API}/api/watchlist/remove?symbol=${sym}`);
    if (sym === selectedSymbol) setSelectedSymbol(null);
    loadWatchlist();
  }

  async function setAlert(asset) {
    let price = prompt(`Target price for ${asset}?`);
    if (!price) return;

    price = price.replace(/[$,]/g, "");
    if (isNaN(price)) return alert("Enter valid number");

    const email = prompt("Enter email for alert:");
    if (!email) return;

    await axios.post(
      `${API}/api/alert?symbol=${asset}&target=${price}&email=${email}`
    );

    alert("🔔 Alert created!");
  }

  const filtered = watchlist.filter(a =>
    a.toLowerCase().includes(search.toLowerCase())
  );

  /* ===== DONUT CHART ===== */
  const donutData = useMemo(() => ({
    labels: filtered,
    datasets: [
      {
        data: filtered.map(a => prices[a] || 0),
        backgroundColor: [
          "#f7931a","#627eea","#f3ba2f","#23292f",
          "#c2a633","#eb0029","#2adac8","#e84142","#8b5cf6"
        ],
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  }), [filtered, prices]);

  /* ===== LINE CHART ===== */
  const lineData = useMemo(() => {
    if (!selectedSymbol || !prices[selectedSymbol]) return null;
    const base = prices[selectedSymbol];

    return {
      labels: Array.from({ length: 40 }, (_, i) => i),
      datasets: [
        {
          label: `${selectedSymbol} Price`,
          data: Array.from({ length: 40 }, (_, i) =>
            base * (0.98 + Math.sin(i / 6) * 0.02 + Math.random() * 0.01)
          ),
          borderColor: "#f59e0b",
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 240);
            g.addColorStop(0, "rgba(245,158,11,0.45)");
            g.addColorStop(1, "rgba(245,158,11,0)");
            return g;
          },
          fill: true,
          tension: 0.45,
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    };
  }, [selectedSymbol, prices]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false } },
  };

  return (
    <div className="watchlist-page">
      <div className="watchlist-header">
        <h2>⭐ Watchlist</h2>
        <div className="controls">
          <input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />
          <select value={symbol} onChange={e => setSymbol(e.target.value)}>
            {ASSETS.map(a => <option key={a}>{a}</option>)}
          </select>
          <button onClick={addToWatchlist}>Add</button>
        </div>
      </div>

      <div className="watchlist-layout">
        <div className="watchlist-table">
          <div className="table-head">
            <span></span><span>Asset</span><span>Price</span><span>Change</span>
            <span>📈 Chart</span><span>🔔 Alert</span><span>✕ Remove</span>
          </div>

          {filtered.map(a => {
            const price = prices[a];
            const prev = prevPrices[a];
            const diff = prev ? price - prev : 0;
            const percent = prev ? ((diff / prev) * 100).toFixed(2) : "0.00";

            return (
              <div className="table-row" key={a}>
                <img src={LOGOS[a]} alt={a} className="logo" />
                <span className="symbol">{a}</span>
                <span className="price">${price?.toLocaleString()}</span>
                <span className={`change ${diff > 0 ? "up" : diff < 0 ? "down" : ""}`}>
                  {diff > 0 && "+"}{percent}%
                </span>
                <button className="icon-btn" onClick={() => setSelectedSymbol(a)}>📈</button>
                <button className="icon-btn" onClick={() => setAlert(a)}>🔔</button>
                <button className="icon-btn remove" onClick={() => removeFromWatchlist(a)}>✕</button>
              </div>
            );
          })}
        </div>

        <div className="watchlist-chart">
          {selectedSymbol && lineData ? (
            <>
              <h4>{selectedSymbol} Price Chart</h4>
              <div className="chart-box">
                <Line data={lineData} options={chartOptions} />
              </div>
            </>
          ) : (
            <>
              <h4>Watchlist Distribution</h4>
              <div className="chart-box">
                <Doughnut data={donutData} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
