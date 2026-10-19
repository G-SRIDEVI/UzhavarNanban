import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import {
  ShieldCheck,
  Star,
  Clock,
  Truck,
  CheckCircle2,
  Package,
  Layers,
  Info,
  Check,
  MapPin,
  Sparkles,
  ArrowRight,
  FileText,
} from "lucide-react";

export const QuotationComparePage = ({
  setActiveTab,
  selectedRequestId,
  setSelectedQuotation,
}) => {
  const { language, t } = useLanguage();
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [activeReqId, setActiveReqId] = useState(selectedRequestId || null);
  const [activeRequest, setActiveRequest] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModalQuote, setDetailModalQuote] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const reqs = await api.getMyDiseaseRequests();
        setRequests(reqs);
        if (reqs.length > 0) {
          const targetId = activeReqId || reqs[0].id;
          setActiveReqId(targetId);
        }
      } catch (err) {
        console.error("Failed to fetch requests", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  useEffect(() => {
    const fetchQuotes = async () => {
      if (!activeReqId) return;
      try {
        const [reqData, quotesData] = await Promise.all([
          api.getDiseaseRequest(activeReqId),
          api.getQuotations(activeReqId),
        ]);
        setActiveRequest(reqData);
        setQuotations(quotesData);
      } catch (err) {
        console.error("Error loading quotations", err);
      }
    };
    fetchQuotes();
  }, [activeReqId]);

  const handleSelectDealer = (quote) => {
    setSelectedQuotation(quote);
    setActiveTab("order_checkout");
    toast.info(`Selected ${quote.shop_name}. Proceeding to checkout.`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
        Loading quotations comparison matrix...
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌱</div>
        <h3 style={{ fontSize: "1.4rem", color: "#14532d", marginBottom: "0.5rem" }}>
          No Active Disease Requests Yet
        </h3>
        <p style={{ color: "#64748b", maxWidth: "500px", margin: "0 auto 1.5rem auto" }}>
          Submit a photograph of your affected crop using AI Plant Doctor to receive competitive quotations from local Natrampalli agricultural dealers.
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => setActiveTab("ai_doctor")}>
          <Sparkles size={18} /> Launch AI Plant Doctor
        </button>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: "4rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <h2 style={{ fontSize: "1.8rem", color: "#14532d", fontWeight: 800 }}>
            {language === "ta" ? "டீலர் விலைப்புள்ளி ஒப்பீடு" : "Compare Dealer Recommendations & Prices"}
          </h2>
          <span className="badge badge-success">Core Feature</span>
        </div>
        <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
          Transparent price comparison across participating Natrampalli agricultural input dealers. Compare product suitability, total cost, and delivery time.
        </p>
      </div>

      {/* Disease Request Selector Tab bar */}
      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
        {requests.map((r) => (
          <button
            key={r.id}
            onClick={() => setActiveReqId(r.id)}
            className={`btn btn-sm ${activeReqId === r.id ? "btn-primary" : "btn-secondary"}`}
            style={{ whiteSpace: "nowrap" }}
          >
            {r.crop_name} (#{r.id}) • {r.quotations?.length || 0} Quotes
          </button>
        ))}
      </div>

      {/* Request Summary Card */}
      {activeRequest && (
        <div
          className="glass-panel"
          style={{
            padding: "1.25rem 1.5rem",
            marginBottom: "2rem",
            background: "#ffffff",
            border: "1.5px solid #bbf7d0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Selected Crop Assessment Request
            </div>
            <div style={{ fontWeight: 800, fontSize: "1.2rem", color: "#0f172a" }}>
              {activeRequest.crop_name} — {activeRequest.ai_report?.possible_disease || "Plant Assessment"}
            </div>
            <div style={{ fontSize: "0.85rem", color: "#475569", marginTop: "0.2rem" }}>
              📍 Delivery Location: <strong>{activeRequest.delivery_address}</strong>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span className="badge badge-success" style={{ fontSize: "0.85rem", padding: "0.35rem 0.75rem" }}>
              {quotations.length} Local Dealers Responded
            </span>
          </div>
        </div>
      )}

      {/* Notice on Demonstration Data as mandated by prompt Section 5 */}
      <div
        style={{
          background: "#fefce8",
          border: "1px solid #fef08a",
          borderRadius: "10px",
          padding: "0.6rem 1rem",
          fontSize: "0.82rem",
          color: "#854d0e",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <Info size={16} color="#ca8a04" />
        <span>
          <strong>Demonstration Pricing Data:</strong> Dealer A (₹700), Dealer B (₹680), and Dealer C (₹730) are preloaded verified demonstration dealers for Natrampalli Block.
        </span>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <div className="grid-comparison">
        {quotations.map((quote, idx) => {
          const isBestPrice = quote.total_amount === Math.min(...quotations.map((q) => q.total_amount));

          return (
            <div
              key={quote.id}
              className="card"
              style={{
                padding: "1.75rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                border: isBestPrice ? "2px solid #16a34a" : "1px solid var(--border)",
                boxShadow: isBestPrice ? "0 8px 24px rgba(22, 163, 74, 0.12)" : "var(--shadow-sm)",
              }}
            >
              {isBestPrice && (
                <div
                  style={{
                    position: "absolute",
                    top: "-12px",
                    right: "20px",
                    background: "linear-gradient(135deg, #15803d 0%, #16a34a 100%)",
                    color: "#ffffff",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.6rem",
                    borderRadius: "9999px",
                    letterSpacing: "0.04em",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  LOWEST TOTAL COST
                </div>
              )}

              <div>
                {/* Dealer Shop Name & Verified Badge */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", color: "#0f291e", fontWeight: 700 }}>
                      {quote.shop_name}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.2rem" }}>
                      {quote.dealer_verified && (
                        <span className="badge badge-success" style={{ fontSize: "0.7rem", padding: "0.15rem 0.45rem" }}>
                          <ShieldCheck size={12} /> Verified Dealer
                        </span>
                      )}
                      <span style={{ fontSize: "0.78rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <Star size={13} fill="#f59e0b" color="#f59e0b" /> {quote.dealer_rating || 4.8} / 5.0
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: "0.78rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "1rem" }}>
                  <MapPin size={13} /> {quote.service_area || "Natrampalli Service Area"}
                </div>

                {/* Recommended Products Box */}
                <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "0.85rem", marginBottom: "1rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "#475569", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    Recommended Treatment Product:
                  </div>

                  {quote.items.map((item, i) => (
                    <div key={i} style={{ borderBottom: i < quote.items.length - 1 ? "1px solid #e2e8f0" : "none", paddingBottom: "0.4rem" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#1e293b" }}>
                        {item.product_name}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b", display: "flex", justifyContent: "space-between", marginTop: "0.15rem" }}>
                        <span>Brand: {item.brand} ({item.category})</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Breakdown Table as in prompt section 5 */}
                <div style={{ borderTop: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", padding: "0.75rem 0", marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "#475569", marginBottom: "0.3rem" }}>
                    <span>Products Subtotal:</span>
                    <span style={{ fontWeight: 600 }}>₹{quote.total_product_cost}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "#475569", marginBottom: "0.3rem" }}>
                    <span>Doorstep Delivery Charge:</span>
                    <span style={{ fontWeight: 600 }}>₹{quote.delivery_fee}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.15rem", color: "#14532d", fontWeight: 800, marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px dashed #cbd5e1" }}>
                    <span>Total Payable:</span>
                    <span>₹{quote.total_amount}</span>
                  </div>
                </div>

                {/* Delivery Time & Stock */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.8rem", color: "#334155", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Clock size={15} color="#0284c7" />
                    <span>ETA: <strong>Within {quote.estimated_delivery_hours}h</strong></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <CheckCircle2 size={15} color="#16a34a" />
                    <span>Stock: <strong>Available</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => setDetailModalQuote(quote)}
                >
                  <FileText size={14} /> View Details
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1.5 }}
                  onClick={() => handleSelectDealer(quote)}
                >
                  <Check size={16} /> Select & Order
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Details Modal for Dealer Assessment & Instructions */}
      {detailModalQuote && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1rem",
          }}
          onClick={() => setDetailModalQuote(null)}
        >
          <div
            className="card"
            style={{ maxWidth: "560px", width: "100%", padding: "2rem", background: "#ffffff" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.3rem", color: "#14532d", fontWeight: 700 }}>
                  {detailModalQuote.shop_name}
                </h3>
                <span className="badge badge-success">Verified Agricultural Shop</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#15803d" }}>
                  ₹{detailModalQuote.total_amount}
                </div>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Total with Delivery</span>
              </div>
            </div>

            {/* Delivery & Dispatch Note */}
            <div style={{ background: "#f8fafc", padding: "0.85rem", borderRadius: "10px", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155" }}>
                Delivery Note:
              </div>
              <p style={{ fontSize: "0.85rem", color: "#475569", marginTop: "0.2rem" }}>
                {detailModalQuote.notes || "Direct doorstep dispatch via store personnel."}
              </p>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setDetailModalQuote(null)}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const q = detailModalQuote;
                  setDetailModalQuote(null);
                  handleSelectDealer(q);
                }}
              >
                Select This Dealer <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
