import React, { useState } from "react";
import confetti from "canvas-confetti";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import {
  ShieldCheck,
  CreditCard,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const OrderCheckoutPage = ({
  setActiveTab,
  selectedQuotation,
  setActiveOrderId,
}) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const toast = useToast();

  const [deliveryAddress, setDeliveryAddress] = useState(
    user?.farmer_profile?.delivery_address ||
      "Plot 14, Mariamman Koil Street, Natrampalli Pudur, Natrampalli - 635852"
  );
  const [contactMobile, setContactMobile] = useState(user?.mobile || "9876543210");
  const [deliveryNotes, setDeliveryNotes] = useState("Please call before reaching farm gate");
  const [paymentMethod, setPaymentMethod] = useState("UPI / GPay / PhonePe (Sandbox)");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  if (!selectedQuotation) {
    return (
      <div className="container animate-fade-in" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h3 style={{ fontSize: "1.4rem", color: "#14532d", marginBottom: "0.5rem" }}>
          No Quotation Selected For Checkout
        </h3>
        <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
          Please choose a dealer quotation from the comparison page first.
        </p>
        <button className="btn btn-primary" onClick={() => setActiveTab("compare_quotes")}>
          Go to Quotations
        </button>
      </div>
    );
  }

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    if (!deliveryAddress || !contactMobile) {
      toast.error("Delivery address and contact mobile are required");
      return;
    }
    setIsProcessing(true);

    try {
      // 1. Create order with payment_pending status
      const orderPayload = {
        quotation_id: selectedQuotation.id,
        delivery_address: deliveryAddress.trim(),
        contact_mobile: contactMobile.trim(),
        delivery_notes: deliveryNotes.trim(),
      };

      const orderRes = await api.createOrder(orderPayload);
      setCreatedOrder(orderRes);
      setShowSandboxModal(true);
    } catch (err) {
      toast.error(err.message || "Failed to create order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifySandboxPayment = async () => {
    if (!createdOrder) return;
    setIsProcessing(true);

    try {
      // 2. Secure server-side payment verification
      const verifyRes = await api.verifyPayment({
        order_id: createdOrder.id,
        payment_method: paymentMethod,
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // silent
      }

      toast.success(
        `Payment of ₹${createdOrder.total_amount} Verified! Ref: ${verifyRes.transaction_ref}`
      );

      setShowSandboxModal(false);
      if (setActiveOrderId) setActiveOrderId(createdOrder.id);
      setActiveTab("my_orders");
    } catch (err) {
      toast.error(err.message || "Payment verification failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: "800px", paddingBottom: "4rem" }}>
      {/* Title */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h2 style={{ fontSize: "1.8rem", color: "#14532d", fontWeight: 800 }}>
          {language === "ta" ? "ஆர்டர் உறுதி மற்றும் கட்டணம்" : "Order Confirmation & Secure Checkout"}
        </h2>
        <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
          Verify your doorstep delivery address and complete payment via test sandbox.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem" }}>
        {/* Left Column: Order Summary & Selected Dealer */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <div>
              <span className="badge badge-success" style={{ marginBottom: "0.3rem" }}>
                <ShieldCheck size={12} /> Verified Seller
              </span>
              <h3 style={{ fontSize: "1.25rem", color: "#0f291e", fontWeight: 700 }}>
                {selectedQuotation.shop_name}
              </h3>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                📍 {selectedQuotation.service_area || "Natrampalli Block"}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.85rem", color: "#64748b" }}>Estimated Delivery:</div>
              <div style={{ fontWeight: 700, color: "#15803d", fontSize: "0.95rem" }}>
                Within {selectedQuotation.estimated_delivery_hours} hours
              </div>
            </div>
          </div>

          {/* Items List */}
          <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "1rem", marginBottom: "1.25rem" }}>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#475569", marginBottom: "0.6rem" }}>
              Order Items ({selectedQuotation.items?.length || 1}):
            </div>

            {selectedQuotation.items?.map((it, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                  paddingBottom: "0.5rem",
                  marginBottom: "0.5rem",
                  borderBottom: idx < selectedQuotation.items.length - 1 ? "1px solid #e2e8f0" : "none",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>{it.product_name}</div>
                  <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                    Brand: {it.brand} • Qty: {it.quantity}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: "#0f172a" }}>
                  ₹{it.total_price || it.unit_price}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", borderTop: "1px solid #e2e8f0", paddingTop: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#475569" }}>
              <span>Products Subtotal:</span>
              <span style={{ fontWeight: 600 }}>₹{selectedQuotation.total_product_cost}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#475569" }}>
              <span>Doorstep Delivery Charge:</span>
              <span style={{ fontWeight: 600 }}>₹{selectedQuotation.delivery_fee}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#475569" }}>
              <span>Applicable Taxes (GST):</span>
              <span style={{ fontWeight: 600 }}>₹0.00 (Exempt)</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "#15803d",
                marginTop: "0.5rem",
                paddingTop: "0.5rem",
                borderTop: "2px solid #bbf7d0",
              }}
            >
              <span>Total Payable Amount:</span>
              <span>₹{selectedQuotation.total_amount}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Delivery Address & Payment Trigger */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.15rem", color: "#14532d", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Truck size={18} /> Confirm Doorstep Delivery Details
          </h3>

          <form onSubmit={handleInitiatePayment}>
            <div className="form-group">
              <label className="form-label">Delivery Address (டெலிவரி முகவரி) *</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                required
              />
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                You can edit this address prior to payment confirmation.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Mobile Number *</label>
              <input
                type="tel"
                className="form-input"
                value={contactMobile}
                onChange={(e) => setContactMobile(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Notes / Landmarks</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Near Panchayat water tank / Farm shed"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
              />
            </div>

            {/* Payment Method Selector */}
            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label className="form-label">Payment Mode (Test Gateway Sandbox)</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="UPI / GPay / PhonePe (Sandbox)">UPI (GPay / PhonePe / Paytm) - Sandbox</option>
                <option value="NetBanking (Sandbox)">NetBanking (SBI, Indian Bank, Canara) - Sandbox</option>
                <option value="Kisan Credit Card / Debit (Sandbox)">Kisan Credit Card (KCC) / Debit - Sandbox</option>
              </select>
            </div>

            <div
              style={{
                background: "#f0fdf4",
                border: "1px dashed #86efac",
                borderRadius: "10px",
                padding: "0.75rem",
                fontSize: "0.78rem",
                color: "#166534",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Lock size={15} color="#15803d" />
              <span>
                Simulated Sandbox Gateway. Card numbers, PINs, or CVVs are never requested or stored.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", gap: "0.5rem" }}
              disabled={isProcessing}
            >
              <CreditCard size={18} />
              {isProcessing ? "Initiating Order..." : `Proceed to Pay ₹${selectedQuotation.total_amount}`}
            </button>
          </form>
        </div>
      </div>

      {/* Razorpay Test Mode Payment Gateway Simulator Modal */}
      {showSandboxModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "460px",
              width: "100%",
              padding: "2rem",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ background: "#dbeafe", padding: "0.4rem", borderRadius: "8px" }}>
                  <CreditCard size={20} color="#0284c7" />
                </div>
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                    Razorpay Sandbox Simulator
                  </h4>
                  <span className="badge badge-warning" style={{ fontSize: "0.68rem" }}>
                    Test Mode • No Real Money
                  </span>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#64748b" }}>
                <span>Order Number:</span>
                <span style={{ fontWeight: 600, color: "#1e293b" }}>{createdOrder?.order_number}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#64748b", marginTop: "0.3rem" }}>
                <span>Merchant / Dealer:</span>
                <span style={{ fontWeight: 600, color: "#1e293b" }}>{selectedQuotation.shop_name}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 800, color: "#15803d", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px dashed #cbd5e1" }}>
                <span>Amount:</span>
                <span>₹{createdOrder?.total_amount}</span>
              </div>
            </div>

            <div style={{ fontSize: "0.82rem", color: "#475569", marginBottom: "1.25rem", lineHeight: 1.4 }}>
              Click <strong>Simulate Payment Success</strong> to perform server-side payment verification, record transaction reference, and advance the order into the dealer delivery queue.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleVerifySandboxPayment}
                disabled={isProcessing}
                style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)" }}
              >
                {isProcessing ? "Verifying with Server..." : `Simulate Payment Success (₹${createdOrder?.total_amount})`}
              </button>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowSandboxModal(false)}
                disabled={isProcessing}
              >
                Cancel Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
