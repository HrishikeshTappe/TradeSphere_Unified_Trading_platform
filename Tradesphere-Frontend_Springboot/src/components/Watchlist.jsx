import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Card, Table, Form, Button, Modal, InputGroup, Badge } from "react-bootstrap";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import TradingViewWidget from "./TradingViewWidget";
import "./Watchlist.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const API = "http://localhost:8080";

const ASSETS = [
  "BTC", "ETH", "SOL", "BNB", "XRP",
  "DOGE", "LTC", "TRX", "AVAX", "LINK",
  "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX"
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
  // Stocks
  AAPL: "https://upload.wikimedia.org/wikipedia/commons/8/84/Apple_Computer_Logo_rainbow.svg",
  MSFT: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
  GOOGL: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  AMZN: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  TSLA: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png",
  NVDA: "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg",
  META: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
  NFLX: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
};

// Helper to map assets to TradingView symbols
const getTVSymbol = (symbol) => {
  const STOCKS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX"];
  if (STOCKS.includes(symbol)) {
    return `NASDAQ:${symbol}`;
  }
  return `BINANCE:${symbol}USDT`;
};

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [prices, setPrices] = useState({});
  const [symbol, setSymbol] = useState("BTC");
  const [search, setSearch] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState(null);

  // Alert Modal State
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertData, setAlertData] = useState({ symbol: '', currentPrice: '' });
  const [alertPrice, setAlertPrice] = useState('');

  const navigate = useNavigate(); // Hook for redirection

  function openAlertModal(symbol, currentPriceRaw) {
    // Strip non-numeric for the default value inside input
    const cleanPrice = currentPriceRaw ? currentPriceRaw.toString().replace(/[^0-9.]/g, '') : '';
    setAlertData({ symbol, currentPrice: cleanPrice });
    setAlertPrice(cleanPrice);
    setIsAlertModalOpen(true);
  }

  // Helper to get auth header or redirect
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  async function handleSetAlert() {
    if (!alertPrice) return;

    const config = getAuthHeader();
    if (!config) return;

    try {
      const res = await axios.post(`${API}/api/alerts/set`,
        { symbol: alertData.symbol, price: alertPrice },
        config
      );
      console.log(res.data);
      alert("Alert set successfully!");
      setIsAlertModalOpen(false);
    } catch (e) {
      console.error(e);
      if (e.response && (e.response.status === 401 || e.response.status === 403)) {
        navigate("/login");
      } else {
        alert("Failed to set alert");
      }
    }
  }

  async function loadWatchlist() {
    try {
      const config = getAuthHeader();
      if (!config) return;
      const res = await axios.get(`${API}/api/watchlist`, config);
      setWatchlist([...new Set(res.data.map(w => w.symbol))]);
    } catch (e) {
      console.error(e);
      if (e.response && (e.response.status === 401 || e.response.status === 403)) {
        navigate("/login");
      }
    }
  }

  async function loadPrices() {
    const p = {};
    for (let a of watchlist) {
      try {
        const r = await axios.get(`${API}/api/price?symbol=${a}`);
        p[a] = r.data;
      } catch (e) {
        // console.error(`Error fetching ${a}:`, e);
      }
    }
    setPrices(p);
  }

  useEffect(() => {
    loadWatchlist();
  }, []);

  useEffect(() => {
    if (!watchlist.length) return;
    loadPrices();
    const i = setInterval(loadPrices, 10000); // Reduced frequency
    return () => clearInterval(i);
  }, [watchlist]);

  async function addToWatchlist() {
    if (watchlist.includes(symbol)) return;
    const config = getAuthHeader();
    if (!config) return;

    try {
      await axios.post(`${API}/api/watchlist/add?symbol=${symbol}`, {}, config);
      loadWatchlist();
    } catch (e) {
      console.error("Add error:", e);
      if (e.response && (e.response.status === 403)) {
        alert("Session expired. Please login again.");
        navigate("/login");
      }
    }
  }

  async function removeFromWatchlist(sym) {
    const config = getAuthHeader();
    if (!config) return;

    try {
      await axios.delete(`${API}/api/watchlist/remove?symbol=${sym}`, config);
      if (sym === selectedSymbol) setSelectedSymbol(null);
      loadWatchlist();
    } catch (e) {
      console.error("Remove error:", e);
    }
  }

  const filtered = watchlist.filter(a =>
    a.toLowerCase().includes(search.toLowerCase())
  );

  /* ===== DONUT CHART (Overview) ===== */
  const donutData = useMemo(() => ({
    labels: filtered,
    datasets: [
      {
        data: filtered.map(a => prices[a] || 0),
        backgroundColor: [
          "#f7931a", "#627eea", "#f3ba2f", "#23292f",
          "#c2a633", "#eb0029", "#2adac8", "#e84142", "#8b5cf6"
        ],
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  }), [filtered, prices]);

  return (
    <Container className="watchlist-page">
      <Row className="mb-4 align-items-center">
        <Col md={6}>
          <h2 className="mb-3 mb-md-0">⭐ Watchlist</h2>
        </Col>
        <Col md={6}>
          <div className="d-flex gap-2 justify-content-md-end flex-wrap">
            <Form.Control
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: '150px' }}
              className="bg-dark text-white border-secondary"
            />
            <Form.Select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              style={{ maxWidth: '120px' }}
              className="bg-dark text-white border-secondary"
            >
              {ASSETS.map(a => <option key={a}>{a}</option>)}
            </Form.Select>
            <Button variant="primary" onClick={addToWatchlist}>Add</Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={7} className="mb-4">
          <Card className="watchlist-table-card border-secondary text-white">
            <Card.Body className="p-0">
              <Table hover variant="dark" responsive className="mb-0 text-nowrap">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-muted">
                        Watchlist is empty
                      </td>
                    </tr>
                  )}
                  {filtered.map(a => {
                    const price = prices[a];
                    return (
                      <tr key={a} onClick={() => setSelectedSymbol(a)} className="cursor-pointer">
                        <td className="align-middle">
                          <img src={LOGOS[a] || "https://placehold.co/24"} alt={a} className="coin-logo" />
                          <span className="fw-bold">{a}</span>
                        </td>
                        <td className="align-middle">
                          ${price?.toLocaleString() || "--"}
                        </td>
                        <td className="align-middle">
                          <Button variant="outline-info" size="sm" className="me-2 mb-1" onClick={(e) => { e.stopPropagation(); setSelectedSymbol(a); }}>
                            📈
                          </Button>
                          <Button variant="outline-warning" size="sm" className="me-2 mb-1" onClick={(e) => {
                            e.stopPropagation();
                            openAlertModal(a, prices[a]);
                          }}>
                            🔔
                          </Button>
                          <Button variant="outline-danger" size="sm" className="mb-1" onClick={(e) => { e.stopPropagation(); removeFromWatchlist(a); }}>
                            ✕
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <div className="chart-box">
            {selectedSymbol ? (
              <TradingViewWidget symbol={getTVSymbol(selectedSymbol)} />
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-4">
                <h4 className="mb-4">Portfolio Allocation</h4>
                <div style={{ width: '250px', height: '250px' }}>
                  <Doughnut data={donutData} options={{ plugins: { legend: { display: false } } }} />
                </div>
                <p className="text-muted mt-3 small">
                  Select an asset to view professional chart
                </p>
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* CUSTOM ALERT MODAL */}
      <Modal show={isAlertModalOpen} onHide={() => setIsAlertModalOpen(false)} centered contentClassName="bg-dark text-white border-secondary">
        <Modal.Header closeButton closeVariant="white" className="border-secondary">
          <Modal.Title>🔔 Set Alert for {alertData.symbol}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Target Price ($)</Form.Label>
            <Form.Control
              type="number"
              value={alertPrice}
              onChange={e => setAlertPrice(e.target.value)}
              autoFocus
              className="bg-secondary text-white border-secondary"
            />
            <Form.Text className="text-muted">
              Current Price: ${alertData.currentPrice}
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-secondary">
          <Button variant="secondary" onClick={() => setIsAlertModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSetAlert}>Set Alert</Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
}
