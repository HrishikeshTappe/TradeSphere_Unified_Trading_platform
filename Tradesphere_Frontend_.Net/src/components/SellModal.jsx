import { useState, useEffect } from "react";
import "./BuyModal.css";

const USD_TO_INR = 83;

export default function SellModal({
  isOpen,
  symbol,
  currentPrice,
  currency,
  avgBuyPrice,
  maxQuantity,
  onConfirm,
  onCancel,
}) {
  const [quantity, setQuantity] = useState(Math.min(5, maxQuantity));

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter" && quantity > 0) onConfirm(quantity);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [quantity, onCancel, onConfirm]);

  if (!isOpen) return null;

  const totalProceeds = quantity * currentPrice;
  const costBasis = quantity * avgBuyPrice;
  const profitLoss = totalProceeds - costBasis;

  const displayPrice =
    currency === "USD" ? currentPrice : currentPrice * USD_TO_INR;

  const formatPrice = (value) =>
    currency === "USD"
      ? `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
      : `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content glass"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="modal-header sell-header">
          Sell {symbol}
          <span className="currency-badge">{currency}</span>
        </div>

        {/* BODY */}
        <div className="modal-body">
          <div className="form-group">
            <label>Quantity</label>

            <input
              type="number"
              value={quantity === 0 ? "" : quantity}
              min="0"
              max={maxQuantity}
              step="0.01"
              onChange={(e) =>
                setQuantity(
                  e.target.value === ""
                    ? 0
                    : Math.min(
                        maxQuantity,
                        Math.max(0, Number(e.target.value))
                      )
                )
              }
              className="quantity-input"
              autoFocus
            />

            <small style={{ color: "#9ca3af" }}>
              Available: {maxQuantity.toFixed(4)} {symbol}
            </small>
          </div>

          <div className="summary-row">
            <span>Rate</span>
            <span>{formatPrice(displayPrice)}</span>
          </div>

          <div
            className="summary-row total"
            style={{
              color: profitLoss >= 0 ? "#22c55e" : "#ef4444",
            }}
          >
            <span>{profitLoss >= 0 ? "Profit" : "Loss"}</span>
            <span>
              {profitLoss >= 0 ? "+" : ""}
              {formatPrice(profitLoss)}
            </span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button
            className="btn-confirm sell-confirm"
            disabled={quantity <= 0}
            onClick={() => onConfirm(quantity)}
          >
            Confirm Sell
          </button>

          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
