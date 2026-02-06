import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Form, Nav, InputGroup, Alert } from "react-bootstrap";
import BuyModal from "./BuyModal";
import SellModal from "./SellModal";
import "./Trade.css";

const API = "http://localhost:8080";
const USD_TO_INR = 83;

// Separated Asset Lists
const CRYPTO = [
  "BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "LTC", "TRX", "AVAX", "LINK"
];

const STOCKS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX"
];

const COIN_LOGOS = {
  // Crypto
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

export default function Trade({ currency }) {
  const navigate = useNavigate(); // Initialize hook
  const [marketType, setMarketType] = useState("CRYPTO"); // CRYPTO or STOCK
  const [symbol, setSymbol] = useState("BTC");

  const [walletAmount, setWalletAmount] = useState(1000);

  const [portfolio, setPortfolio] = useState([]);
  const [balance, setBalance] = useState(0);
  const [prices, setPrices] = useState({});

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);

  // Switch default symbol when market type changes
  // REMOVED useEffect for setSymbol(marketType) to prevent re-renders/errors
  // useEffect(() => {
  //   setSymbol(marketType === "CRYPTO" ? "BTC" : "AAPL");
  // }, [marketType]);

  const handleMarketChange = (type) => {
    setMarketType(type);
    setSymbol(type === "CRYPTO" ? "BTC" : "AAPL");
  };

  const activeAssets = marketType === "CRYPTO" ? CRYPTO : STOCKS;

  const formatPrice = (value) => {
    if (!value) return currency === "USD" ? "$0" : "₹0";
    return currency === "USD"
      ? `$${value.toLocaleString()}`
      : `₹${(value * USD_TO_INR).toLocaleString()}`;
  };

  const formatQty = (sym, qty) => {
    if (["DOGE", "XRP"].includes(sym)) return Math.floor(qty).toLocaleString();
    if (["BTC", "ETH", "SOL"].includes(sym)) return qty.toFixed(6);
    return qty.toFixed(4);
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const token = localStorage.getItem("token"); // Retrieve token

      // Note: We disabled redirect, so we just proceed.

      const authHeader = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      // 1. Fetch Portfolio & Balance (CRITICAL: Must load even if prices fail)
      if (token) {
        try {
          const portfolioRes = await axios.get(`${API}/api/trade/portfolio`, authHeader);
          if (mounted) {
            setPortfolio(portfolioRes.data.holdings);
            setBalance(portfolioRes.data.balance);
          }
        } catch (e) {
          console.error("Portfolio load error:", e);
        }
      }

      // 2. Fetch Prices (Public Endpoint - No Auth Header Needed)
      try {
        const cryptoRes = await axios.get(`${API}/api/price/all`);
        const stockRes = await axios.get(`${API}/api/price/stocks`);
        const allPrices = { ...cryptoRes.data, ...stockRes.data };

        if (mounted) {
          setPrices(allPrices);
        }
      } catch (e) {
        console.error("Price load error:", e);
      }
    };

    load();
    const interval = setInterval(load, 10000); // every 10s

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [navigate]);

  async function addMoneyWithRazorpay() {
    // 1. Validate amount
    if (walletAmount <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Please refresh the page.");
      return;
    }

    try {
      // 2. Get Razorpay key (no auth needed)
      const keyResponse = await axios.get(`${API}/api/razor/get-key`);
      const razorpayKey = keyResponse.data.key;

      // 3. Create order (with auth token)
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to add money");
        navigate("/login");
        return;
      }

      const orderResponse = await axios.post(
        `${API}/api/razor/create-order?amount=${walletAmount}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (orderResponse.data.error) {
        alert(orderResponse.data.error);
        return;
      }

      const orderData = orderResponse.data;

      // 4. Initialize Razorpay with options
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: "TradeSphere",
        description: `Add ${walletAmount} to wallet`,
        handler: async function (response) {
          try {
            // Critical: Re-read JWT token from localStorage (token might expire)
            const currentToken = localStorage.getItem("token");
            if (!currentToken) {
              alert("Session expired. Please login again.");
              navigate("/login");
              return;
            }

            // Call verify-and-add endpoint
            const verifyResponse = await axios.post(
              `${API}/api/razor/verify-and-add`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: walletAmount
              },
              { headers: { Authorization: `Bearer ${currentToken}` } }
            );

            if (verifyResponse.data.error) {
              alert("Payment verification failed: " + verifyResponse.data.error);
              return;
            }

            // Refresh user balance/portfolio after successful payment
            if (verifyResponse.data.balance !== undefined) {
              setBalance(verifyResponse.data.balance);
            }

            // Reload portfolio to get updated balance
            const portfolioRes = await axios.get(
              `${API}/api/trade/portfolio`,
              { headers: { Authorization: `Bearer ${currentToken}` } }
            );
            if (portfolioRes.data) {
              setPortfolio(portfolioRes.data.holdings || []);
              setBalance(portfolioRes.data.balance || 0);
            }

            alert("Payment successful! Funds added to your wallet.");
          } catch (error) {
            console.error("Payment verification error:", error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
              alert("Session expired. Please login again.");
              localStorage.removeItem("token");
              navigate("/login");
            } else {
              alert("Payment verification failed: " + (error.response?.data?.error || error.message));
            }
          }
        },
        modal: {
          ondismiss: function () {
            console.log("Payment cancelled by user");
          }
        },
        prefill: {
          // Optional: You can prefill user details if available
        },
        theme: {
          color: "#007bff" // Bootstrap primary color
        }
      };

      // 5. Add payment failure handler
      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        alert("Payment failed: " + (response.error?.description || "Unknown error"));
        console.error("Payment failed:", response);
      });

      // 6. Open Razorpay checkout
      razorpay.open();
    } catch (error) {
      console.error("Razorpay initialization error:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert("Failed to initialize payment: " + (error.response?.data?.error || error.message));
      }
    }
  }

  async function handleBuyConfirm(quantity) {
    try {
      const token = localStorage.getItem("token");
      // Removed token check
      const amountToBuy = quantity * (prices[symbol] || 0);
      const res = await axios.post(`${API}/api/trade/buy`, {
        symbol,
        amount: amountToBuy,
        currency
      }, { headers: { Authorization: `Bearer ${token}` } }); // Add header
      setPortfolio(res.data.holdings);
      setBalance(res.data.balance);
      setShowBuyModal(false);
    } catch (error) {
      console.error("Buy error:", error);
      if (error.response && (error.response.status === 403 || error.response.status === 401)) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      alert("Failed to complete buy order. Please try again.");
    }
  }

  async function handleSellConfirm(quantity) {
    try {
      const token = localStorage.getItem("token");
      // Removed token check
      const res = await axios.post(`${API}/api/trade/sell`, {
        symbol,
        qty: quantity,
        currency
      }, { headers: { Authorization: `Bearer ${token}` } }); // Add header
      setPortfolio(res.data.holdings);
      setBalance(res.data.balance);
      setShowSellModal(false);
    } catch (error) {
      console.error("Sell error:", error);
      if (error.response && (error.response.status === 403 || error.response.status === 401)) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      alert("Failed to complete sell order. Please try again.");
    }
  }

  const invested = portfolio.reduce(
    (sum, p) => sum + p.quantity * p.avgBuy, 0
  );

  const currentValue = portfolio.reduce(
    (sum, p) => sum + p.quantity * (prices[p.symbol] || 0), 0
  );

  const totalPnL = currentValue - invested;
  const pnlPercent = invested > 0 ? (totalPnL / invested) * 100 : 0;

  const selectedHolding = portfolio.find((p) => p.symbol === symbol);
  const availableQty = selectedHolding ? selectedHolding.quantity : 0;

  return (
    <Container className="trade-container">
      <h2 className="title">Trade Dashboard</h2>

      <Row className="mb-4 justify-content-end">
        <Col xs={12} md={6} lg={4}>
          <InputGroup>
            <InputGroup.Text className="bg-dark text-white border-secondary">Add Funds</InputGroup.Text>
            <Form.Control
              type="text"
              inputMode="numeric"
              className="bg-dark text-white border-secondary"
              value={walletAmount}
              onChange={(e) =>
                setWalletAmount(Number(e.target.value.replace(/\D/g, "")))
              }
            />
            <Button variant="primary" onClick={addMoneyWithRazorpay}>
              Add Money
            </Button>
          </InputGroup>
        </Col>
      </Row>

      {/* SUMMARY CARD */}
      <Card className="glass-card text-black mb-4">
        <Card.Body>
          <Row className="text-center">
            <Col xs={6} md={3} className="mb-3 mb-md-0">
              <small className="d-block text-muted">Balance</small>
              <h5 className="mb-0">{formatPrice(balance)}</h5>
            </Col>
            <Col xs={6} md={3} className="mb-3 mb-md-0">
              <small className="d-block text-muted">Invested</small>
              <h5 className="mb-0">{formatPrice(invested)}</h5>
            </Col>
            <Col xs={6} md={3}>
              <small className="d-block text-muted">Current Value</small>
              <h5 className="mb-0">{formatPrice(currentValue)}</h5>
            </Col>
            <Col xs={6} md={3}>
              <small className="d-block text-muted">P/L</small>
              <h5 className={`mb-0 ${totalPnL >= 0 ? "profit" : "loss"}`}>
                {formatPrice(totalPnL)} <small>({pnlPercent.toFixed(2)}%)</small>
              </h5>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Nav variant="pills" className="custom-tabs mb-4 justify-content-center" activeKey={marketType}>
        <Nav.Item>
          <Nav.Link eventKey="CRYPTO" onClick={() => handleMarketChange("CRYPTO")}>Crypto 💎</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="STOCK" onClick={() => handleMarketChange("STOCK")}>Stocks 📈</Nav.Link>
        </Nav.Item>
      </Nav>

      <Card className="glass-card text-black mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col xs={12} md={6} className="mb-3 mb-md-0">
              <div className="price-text">
                <img src={COIN_LOGOS[symbol]} alt={symbol} className="coin-logo" />
                <span className="fw-bold">{symbol} Price:</span>{" "}
                <span>{prices[symbol] ? formatPrice(prices[symbol]) : "Loading..."}</span>
              </div>
            </Col>

            <Col xs={12} md={6}>
              <Form className="d-flex gap-2 flex-wrap justify-content-md-end">
                <Form.Select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="form-select-custom"
                  style={{ width: 'auto' }}
                >
                  {activeAssets.map((a) => <option key={a}>{a}</option>)}
                </Form.Select>

                <Button variant="success" onClick={() => setShowBuyModal(true)}>BUY</Button>
                <Button
                  variant="danger"
                  disabled={availableQty === 0}
                  onClick={() => setShowSellModal(true)}
                >
                  SELL
                </Button>
              </Form>
              <div className="qty-preview text-md-end">
                Available: <strong>{formatQty(symbol, availableQty)} {symbol}</strong>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <h3 className="section-title">Portfolio</h3>

      <Row>
        {portfolio.map((p) => {
          const price = prices[p.symbol] || 0;
          const pnl = (price - p.avgBuy) * p.quantity;
          const pnlPct =
            p.avgBuy > 0 ? (pnl / (p.avgBuy * p.quantity)) * 100 : 0;

          return (
            <Col xs={12} sm={6} md={4} lg={3} key={p.symbol}>
              <div className="holding-card">
                <div className="holding-top">
                  <div className="coin-info">
                    <img src={COIN_LOGOS[p.symbol] || "https://placehold.co/24"} alt={p.symbol} className="coin-logo" />
                    <strong>{p.symbol}</strong>
                  </div>
                  <span className={pnl >= 0 ? "profit" : "loss"}>
                    {pnlPct.toFixed(2)}%
                  </span>
                </div>

                <div className="holding-mid">
                  <div>Qty: {formatQty(p.symbol, p.quantity)}</div>
                  <div>Avg: {formatPrice(p.avgBuy)}</div>
                </div>

                <div className="holding-bottom">
                  <div>LTP: {formatPrice(price)}</div>
                  <div className={pnl >= 0 ? "profit" : "loss"}>
                    P/L: {formatPrice(pnl)}
                  </div>
                </div>
              </div>
            </Col>
          );
        })}
        {portfolio.length === 0 && (
          <Col>
            <Alert variant="info" className="text-center bg-dark text-white border-secondary">
              No assets in portfolio. Start trading!
            </Alert>
          </Col>
        )}
      </Row>

      <BuyModal
        isOpen={showBuyModal}
        symbol={symbol}
        currentPrice={prices[symbol] || 0}
        currency={currency}
        onConfirm={handleBuyConfirm}
        onCancel={() => setShowBuyModal(false)}
      />

      <SellModal
        isOpen={showSellModal}
        symbol={symbol}
        currentPrice={prices[symbol] || 0}
        avgBuyPrice={selectedHolding ? selectedHolding.avgBuy : 0}
        maxQuantity={availableQty}
        currency={currency}
        onConfirm={handleSellConfirm}
        onCancel={() => setShowSellModal(false)}
      />
    </Container>
  );
}
