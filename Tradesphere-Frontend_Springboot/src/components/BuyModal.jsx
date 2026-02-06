import { useState, useEffect } from "react";
import { Modal, Button, Form, Badge, Row, Col } from "react-bootstrap";

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
    // Reset quantity when modal opens
    if (isOpen) setQuantity(10);
  }, [isOpen]);

  // Modal handles Escape automatically. Enter key can be handled by form submit.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (quantity > 0) onConfirm(quantity);
  };

  const totalCost = quantity * currentPrice;
  const displayPrice = currency === "USD" ? currentPrice : currentPrice * USD_TO_INR;
  const displayTotal = currency === "USD" ? totalCost : totalCost * USD_TO_INR;

  const formatPrice = (value) =>
    currency === "USD"
      ? `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
      : `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  const warning = displayTotal > 100000;

  return (
    <Modal show={isOpen} onHide={onCancel} centered contentClassName="bg-dark text-white border-secondary">
      <Modal.Header closeButton closeVariant="white" className="border-secondary">
        <Modal.Title className="text-success">
          Buy {symbol} <Badge bg="secondary" className="ms-2 fs-6">{currency}</Badge>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              value={quantity}
              min="0"
              step="0.01"
              onChange={(e) =>
                setQuantity(e.target.value === "" ? 0 : Math.max(0, e.target.value))
              }
              className="bg-secondary text-white border-secondary mb-2"
              autoFocus
            />
            <div className="d-flex gap-2">
              {[10, 50, 100].map((q) => (
                <Button
                  key={q}
                  variant="outline-light"
                  size="sm"
                  onClick={() => setQuantity(q)}
                  className="flex-grow-1"
                >
                  {q}
                </Button>
              ))}
            </div>
          </Form.Group>

          <div className="d-flex justify-content-between mb-2">
            <span>Rate</span>
            <span>{formatPrice(displayPrice)}</span>
          </div>

          <div className="d-flex justify-content-between fw-bold text-success fs-5">
            <span>Total</span>
            <span>{formatPrice(displayTotal)}</span>
          </div>

          {warning && (
            <div className="text-warning mt-2 small">
              ⚠ Large transaction. Please confirm carefully.
            </div>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-secondary">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="success"
          disabled={quantity <= 0}
          onClick={() => onConfirm(quantity)}
        >
          Confirm Buy
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
