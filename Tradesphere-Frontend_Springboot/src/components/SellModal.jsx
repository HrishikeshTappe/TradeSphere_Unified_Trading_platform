import { useState, useEffect } from "react";
import { Modal, Button, Form, Badge } from "react-bootstrap";

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
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    if (isOpen) setQuantity(Math.min(5, maxQuantity));
  }, [isOpen, maxQuantity]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (quantity > 0) onConfirm(quantity);
  };

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
    <Modal show={isOpen} onHide={onCancel} centered contentClassName="bg-dark text-white border-secondary">
      <Modal.Header closeButton closeVariant="white" className="border-secondary">
        <Modal.Title className="text-danger">
          Sell {symbol} <Badge bg="secondary" className="ms-2 fs-6">{currency}</Badge>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
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
              className="bg-secondary text-white border-secondary mb-1"
              autoFocus
            />
            <Form.Text className="text-muted">
              Available: {maxQuantity.toFixed(4)} {symbol}
            </Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-between mb-2">
            <span>Rate</span>
            <span>{formatPrice(displayPrice)}</span>
          </div>

          <div
            className="d-flex justify-content-between fw-bold fs-5"
            style={{ color: profitLoss >= 0 ? "#22c55e" : "#ef4444" }}
          >
            <span>{profitLoss >= 0 ? "Profit" : "Loss"}</span>
            <span>
              {profitLoss >= 0 ? "+" : ""}
              {formatPrice(profitLoss)}
            </span>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-secondary">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="danger"
          disabled={quantity <= 0}
          onClick={() => onConfirm(quantity)}
        >
          Confirm Sell
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
