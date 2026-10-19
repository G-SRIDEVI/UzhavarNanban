import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { StatusStepper } from "../../components/StatusStepper";
import {
  Truck,
  Phone,
  CheckCircle2,
  Package,
  Clock,
  MapPin,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export const OrdersTrackingPage = ({ activeOrderId }) => {
  const { language, t } = useLanguage();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await api.getMyOrders();
      setOrders(data);
      if (data.length > 0) {
        if (activeOrderId) {
          const match = data.find((o) => o.id === activeOrderId);
          setSelectedOrder(match || data[0]);
        } else {
          setSelectedOrder(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeOrderId]);

  const handleConfirmDelivery = async (orderId) => {
    setConfirming(true);
    try {
      const res = await api.confirmDelivery(orderId);
      toast.success("Doorstep delivery confirmed! Thank you for using UzhavarNanban.");
      await fetchOrders();
    } catch (err) {
      toast.error(err.message || "Failed to confirm delivery");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>
        Loading your delivery tracking status...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
        <h3 style={{ fontSize: "1.4rem", color: "#14532d", marginBottom: "0.5rem" }}>
          No Active Fertilizer Orders
        </h3>
        <p style={{ color: "#64748b" }}>
          You have not placed any orders yet. Compare dealer quotes to order pesticides & fertilizers with doorstep delivery.
        </p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: "4rem" }}>
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", color: "#14532d", fontWeight: 800 }}>
            {language === "ta" ? "உர & மருந்து டெலிவரி கண்காணிப்பு" : "Doorstep Delivery Tracking"}
          </h2>
          <p style={{ color: "#64748b", marginTop: "0.2rem" }}>
            Track progress of your agricultural inputs from dealer preparation to doorstep delivery.
          </p>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={fetchOrders}
          style={{ gap: "0.3rem" }}
        >
          <RefreshCw size={14} /> Refresh Status
        </button>
      </div>

      {/* Order Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", marginBottom: "1.5rem", paddingBottom: "0.5rem" }}>
        {orders.map((o) => (
          <button
            key={o.id}
            onClick={() => setSelectedOrder(o)}
            className={`btn btn-sm ${selectedOrder?.id === o.id ? "btn-primary" : "btn-secondary"}`}
            style={{ whiteSpace: "nowrap" }}
          >
            {o.order_number} (₹{o.total_amount}) • {o.status.replace("_", " ")}
          </button>
        ))}
      </div>

      {selectedOrder && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Main Delivery Progress Tracker Card */}
          <div className="card" style={{ padding: "2rem", borderTop: "5px solid #16a34a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <span className="badge badge-success" style={{ marginBottom: "0.4rem" }}>
                  Order: {selectedOrder.order_number}
                </span>
                <h3 style={{ fontSize: "1.4rem", color: "#0f291e", fontWeight: 700 }}>
                  {selectedOrder.dealer_shop_name}
                </h3>
                <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.2rem" }}>
                  Delivery to: <strong>{selectedOrder.delivery_address}</strong>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Expected Delivery Window:</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#15803d" }}>
                  {selectedOrder.estimated_delivery_time || "Within 4 Hours"}
                </div>
                {selectedOrder.payment && (
                  <div style={{ fontSize: "0.75rem", color: "#059669", marginTop: "0.2rem" }}>
                    ✓ Paid via {selectedOrder.payment.gateway} (Ref: {selectedOrder.payment.transaction_ref})
                  </div>
                )}
              </div>
            </div>

            {/* Visual 5-Step Stepper */}
            <StatusStepper currentStatus={selectedOrder.status} />

            {/* Current Status Detail Note */}
            <div
              style={{
                background: selectedOrder.status === "delivered" ? "#ecfdf5" : "#f8fafc",
                border: `1.5px solid ${selectedOrder.status === "delivered" ? "#a7f3d0" : "#e2e8f0"}`,
                borderRadius: "12px",
                padding: "1rem 1.25rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                  Current Status:{" "}
                  <span style={{ color: "#16a34a", textTransform: "capitalize" }}>
                    {selectedOrder.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div style={{ fontSize: "0.85rem", color: "#475569", marginTop: "0.25rem" }}>
                  Dealer note: {selectedOrder.delivery_notes || "Your order is being handled by the dealer dispatch team."}
                </div>
              </div>

              {/* Confirm delivery button if out for delivery */}
              {selectedOrder.status !== "delivered" ? (
                <button
                  className="btn btn-primary"
                  onClick={() => handleConfirmDelivery(selectedOrder.id)}
                  disabled={confirming}
                  style={{ gap: "0.4rem" }}
                >
                  <CheckCircle2 size={16} />
                  {confirming ? "Confirming..." : "Confirm Received at Doorstep"}
                </button>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#15803d", fontWeight: 700 }}>
                  <CheckCircle2 size={20} />
                  Doorstep Delivery Confirmed!
                </div>
              )}
            </div>

            {/* Contact Dealer Box */}
            <div
              style={{
                marginTop: "1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "0.75rem",
                paddingTop: "1rem",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Phone size={16} color="#0284c7" />
                <span style={{ fontSize: "0.88rem", color: "#334155" }}>
                  Dealer Contact: <strong>{selectedOrder.dealer_mobile || "9876543211"}</strong>
                </span>
              </div>

              <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                Delivery handled directly by authorized local dealer
              </span>
            </div>
          </div>

          {/* Ordered Products Breakdown */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <h4 style={{ fontSize: "1.1rem", color: "#14532d", fontWeight: 700, marginBottom: "0.75rem" }}>
              Package Contents
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {selectedOrder.items?.map((it, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.6rem 0.8rem",
                    background: "#f8fafc",
                    borderRadius: "8px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{it.product_name}</div>
                    <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                      Brand: {it.brand} • Quantity: {it.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: "#15803d" }}>₹{it.total_price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
