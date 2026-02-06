import { useEffect, useState } from "react";
import axios from "axios";
import BuyModal from "./BuyModal";
import SellModal from "./SellModal";
import "./Trade.css";

const API = "https://localhost:7283";
const USD_TO_INR = 83;

const ASSETS = [
  "BTC","ETH","SOL","BNB","XRP","DOGE","LTC","TRX","AVAX","LINK"
];

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

export default function Trade({ currency }) {
  const [symbol, setSymbol] = useState("BTC");
  const [amount, setAmount] = useState(1000);
  const [walletAmount, setWalletAmount] = useState(1000);

  const [portfolio, setPortfolio] = useState([]);
  const [balance, setBalance] = useState(0);
  const [prices, setPrices] = useState({});

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);

  const formatPrice = (value) => {
    if (!value) return currency === "USD" ? "$0" : "₹0";
    return currency === "USD"
      ? `$${value.toLocaleString()}`
      : `₹${(value * USD_TO_INR).toLocaleString()}`;
  };

  const formatQty = (sym, qty) => {
    if (["DOGE","XRP"].includes(sym)) return Math.floor(qty).toLocaleString();
    if (["BTC","ETH","SOL"].includes(sym)) return qty.toFixed(6);
    return qty.toFixed(4);
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const portfolioRes = await axios.get(`${API}/api/trade/portfolio`);

        // 🔥 SINGLE PRICE CALL
        const priceRes = await axios.get(`${API}/api/price/all`);
        const p = priceRes.data;

        if (mounted) {
          setPortfolio(portfolioRes.data.holdings);
          setBalance(portfolioRes.data.balance);
          setPrices(p);
        }
      } catch (e) {
        console.error("Load error:", e);
      }
    };

    load();
    const interval = setInterval(load, 10000); // every 10s

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  async function addMoney() {
    if (walletAmount <= 0) return;
    const res = await axios.post(`${API}/api/wallet/add`, {
      amount: walletAmount, currency
    });
    setBalance(res.data.balance);
  }

  async function handleBuyConfirm(quantity) {
    try {
      const amountToBuy = quantity * (prices[symbol] || 0);
      const res = await axios.post(`${API}/api/trade/buy`, {
        symbol,
        amount: amountToBuy,
        currency
      });
      setPortfolio(res.data.holdings);
      setBalance(res.data.balance);
      setShowBuyModal(false);
    } catch (error) {
      console.error("Buy error:", error);
      alert("Failed to complete buy order. Please try again.");
    }
  }

  async function handleSellConfirm(quantity) {
    try {
      const res = await axios.post(`${API}/api/trade/sell`, {
        symbol,
        qty: quantity,
        currency
      });
      setPortfolio(res.data.holdings);
      setBalance(res.data.balance);
      setShowSellModal(false);
    } catch (error) {
      console.error("Sell error:", error);
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
    <div className="trade-container">
      <h2 className="title">Trade Dashboard</h2>

      <div className="wallet-bar">
        <span className="wallet-label">Add Funds</span>
        <input
          type="text"
          inputMode="numeric"
          className="wallet-input"
          value={walletAmount}
          onChange={(e) =>
            setWalletAmount(Number(e.target.value.replace(/\D/g, "")))
          }
        />
        <button className="wallet-btn" onClick={addMoney}>
          Add Money
        </button>
      </div>

      <div className="summary-card">
        <p><strong>Balance:</strong> {formatPrice(balance)}</p>
        <p><strong>Invested:</strong> {formatPrice(invested)}</p>
        <p><strong>Portfolio Value:</strong> {formatPrice(currentValue)}</p>
        <p className={totalPnL >= 0 ? "profit" : "loss"}>
          <strong>P/L:</strong> {formatPrice(totalPnL)} ({pnlPercent.toFixed(2)}%)
        </p>
      </div>

      <div className="trade-panel">
        <p className="price-text">
          <img src={COIN_LOGOS[symbol]} alt={symbol} className="coin-logo" />
          <strong>{symbol} Price:</strong>{" "}
          {prices[symbol] ? formatPrice(prices[symbol]) : "Loading..."}
        </p>

        <div className="trade-controls">
          <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
            {ASSETS.map((a) => <option key={a}>{a}</option>)}
          </select>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />

          <button onClick={() => setShowBuyModal(true)}>BUY</button>
          <button
            className="sell-btn"
            disabled={availableQty === 0}
            onClick={() => setShowSellModal(true)}
          >
            SELL
          </button>
        </div>

        <div className="qty-preview">
          Available Qty:{" "}
          <strong>
            {formatQty(symbol, availableQty)} {symbol}
          </strong>
        </div>
      </div>

      <h3 className="section-title">Portfolio</h3>

      {portfolio.map((p) => {
        const price = prices[p.symbol] || 0;
        const pnl = (price - p.avgBuy) * p.quantity;
        const pnlPct =
          p.avgBuy > 0 ? (pnl / (p.avgBuy * p.quantity)) * 100 : 0;

        return (
          <div className="holding-card" key={p.symbol}>
            <div className="holding-top">
              <div className="coin-info">
                <img src={COIN_LOGOS[p.symbol]} alt={p.symbol} className="coin-logo" />
                <strong>{p.symbol}</strong>
              </div>
              <span className={pnl >= 0 ? "profit" : "loss"}>
                {formatPrice(pnl)} ({pnlPct.toFixed(2)}%)
              </span>
            </div>

            <div className="holding-mid">
              Qty: {formatQty(p.symbol, p.quantity)} • Avg:{" "}
              {formatPrice(p.avgBuy)}
            </div>

            <div className="holding-bottom">
              LTP: {formatPrice(price)}
            </div>
          </div>
        );
      })}

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
    </div>
  );
}
