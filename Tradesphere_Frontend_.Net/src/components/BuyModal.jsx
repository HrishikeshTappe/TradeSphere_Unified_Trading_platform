import { useState, useEffect } from "react";
import "./BuyModal.css";

const USD_TO_INR = 83;

export default function BuyModal({
  isOpen,
  symbol,
  currentPrice,
  currency,
  onConfirm,
  onCancel
}) {
  const [quantity, setQuantity] = useState(10);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter" && quantity > 0) onConfirm(quantity);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [quantity, onCancel, onConfirm]);

  if (!isOpen) return null;

  const totalCost = quantity * currentPrice;
  const displayPrice =
    currency === "USD" ? currentPrice : currentPrice * USD_TO_INR;
  const displayTotal =
    currency === "USD" ? totalCost : totalCost * USD_TO_INR;

  const formatPrice = (value) =>
    currency === "USD"
      ? `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
      : `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const warning = displayTotal > 100000;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header buy-header">
          Buy {symbol}
          <span className="currency-badge">{currency}</span>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              value={quantity}
              min="0"
              step="0.01"
              onChange={(e) =>
                setQuantity(e.target.value === "" ? 0 : Math.max(0, e.target.value))
              }
              className="quantity-input"
            />

            <div className="quick-btns">
              {[10, 50, 100].map((q) => (
                <button key={q} onClick={() => setQuantity(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="summary-row">
            <span>Rate</span>
            <span>{formatPrice(displayPrice)}</span>
          </div>

          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(displayTotal)}</span>
          </div>

          {warning && (
            <p className="warning-text">
              ⚠ Large transaction. Please confirm carefully.
            </p>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-confirm buy-confirm"
            disabled={quantity <= 0}
            onClick={() => onConfirm(quantity)}
          >
            Confirm Buy
          </button>
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
