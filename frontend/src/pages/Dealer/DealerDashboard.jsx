import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import {
  Store,
  Sprout,
  Truck,
  Package,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  ArrowRight,
  ShieldCheck,
  Send,
  Save,
  Check,
} from "lucide-react";

export const DealerDashboard = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("requests"); // 'requests', 'orders', 'inventory'
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedReqForQuote, setSelectedReqForQuote] = useState(null);
  const [loading, setLoading] = useState(true);

  // Quote Builder State
  const [quoteProducts, setQuoteProducts] = useState([
    { product_name: "", brand: "", category: "Fungicide", quantity: 1, unit_price: "650" },
  ]);
  const [deliveryFee, setDeliveryFee] = useState("50");
  const [deliveryHours, setDeliveryHours] = useState(4);
  const [validityDays, setValidityDays] = useState(3);
  const [dealerAssessmentNotes, setDealerAssessmentNotes] = useState("");
  const [safetyInstructions, setSafetyInstructions] = useState("Wear mask and gloves while spraying. Do not spray against wind.");
  const [applicationInstructions, setApplicationInstructions] = useState("Mix 2.5ml per litre of water. Apply early morning before 10 AM.");
  const [quoteNotes, setQuoteNotes] = useState("Express doorstep dispatch from Natrampalli shop.");
  const [submittingQuote, setSubmittingQuote] = useState(false);

  // Product Inventory Form State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdBrand, setNewProdBrand] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Fungicide");
  const [newProdActive, setNewProdActive] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("50");
  const [newProdRegulated, setNewProdRegulated] = useState(false);

  const fetchData = async () => {
    try {
      const [reqs, ords, prods] = await Promise.all([
        api.getDealerDiseaseRequests(),
        api.getDealerOrders(),
        api.getMyProducts(),
      ]);
      setRequests(reqs);
      setOrders(ords);
      setProducts(prods);
    } catch (err) {
      console.error("Dealer dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, {
        status: newStatus,
        delivery_notes: `Status updated to ${newStatus.replace(/_/g, " ")} by ${user.dealer_profile?.shop_name || "Dealer"}`,
      });
      toast.success(`Order status updated to ${newStatus.replace(/_/g, " ")}!`);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to update order status");
    }
  };

  const handleAddQuoteProductRow = () => {
    setQuoteProducts([
      ...quoteProducts,
      { product_name: "", brand: "", category: "Fungicide", quantity: 1, unit_price: "200" },
    ]);
  };

  const handleRemoveQuoteProductRow = (index) => {
    if (quoteProducts.length > 1) {
      setQuoteProducts(quoteProducts.filter((_, i) => i !== index));
    }
  };

  const handleQuoteProductChange = (index, field, value) => {
    const updated = [...quoteProducts];
    updated[index][field] = value;
    setQuoteProducts(updated);
  };

  const handleSubmitQuotation = async (status = "submitted") => {
    if (!selectedReqForQuote) return;
    if (quoteProducts.some((p) => !p.product_name || !p.brand)) {
      toast.error("Please fill product name and brand for all items");
      return;
    }
    setSubmittingQuote(true);

    try {
      const payload = {
        request_id: selectedReqForQuote.id,
        items: quoteProducts.map((p) => ({
          product_name: p.product_name,
          brand: p.brand,
          category: p.category,
          quantity: parseInt(p.quantity) || 1,
          unit_price: parseFloat(p.unit_price) || 0,
        })),
        delivery_fee: parseFloat(deliveryFee) || 0,
        estimated_delivery_hours: parseInt(deliveryHours) || 4,
        validity_days: parseInt(validityDays) || 3,
        notes: quoteNotes,
        status, // 'draft' or 'submitted'
        assessment_notes: dealerAssessmentNotes || `Recommended treatment for ${selectedReqForQuote.crop_name}`,
        safety_precautions: safetyInstructions,
        application_instructions: applicationInstructions,
      };

      await api.submitDealerQuotation(selectedReqForQuote.id, payload);
      toast.success(
        status === "draft"
          ? "Quotation saved as draft!"
          : "Quotation submitted to farmer! Farmer can now compare prices."
      );
      setSelectedReqForQuote(null);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to submit quotation");
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.createProduct({
        name: newProdName,
        brand: newProdBrand,
        category: newProdCategory,
        active_ingredient: newProdActive,
        unit: "500ml / 500g Pack",
        unit_price: parseFloat(newProdPrice),
        stock_quantity: parseInt(newProdStock) || 50,
        is_regulated: newProdRegulated,
      });
      toast.success("Product added to your inventory!");
      setShowAddProduct(false);
      setNewProdName("");
      setNewProdBrand("");
      setNewProdPrice("");
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to add product");
    }
  };

  const calculateQuoteTotal = () => {
    const prodTotal = quoteProducts.reduce(
      (sum, p) => sum + (parseFloat(p.unit_price) || 0) * (parseInt(p.quantity) || 1),
      0
    );
    const delFee = parseFloat(deliveryFee) || 0;
    return prodTotal + delFee;
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: "4rem" }}>
      {/* Dealer Header Profile Banner */}
      <div
        className="glass-panel"
        style={{
          padding: "1.75rem",
          background: "linear-gradient(135deg, rgba(238, 242, 255, 0.9) 0%, rgba(224, 242, 254, 0.8) 100%)",
          border: "1.5px solid #93c5fd",
          borderRadius: "16px",
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.25rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <Store size={24} color="#0284c7" />
            <h2 style={{ fontSize: "1.75rem", color: "#0f172a", fontWeight: 800 }}>
              {user?.dealer_profile?.shop_name || "Agro Care Depot"}
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <span className="badge badge-success">
              <ShieldCheck size={12} /> {user?.dealer_profile?.licence_number || "Verified Licence"}
            </span>
            <span style={{ fontSize: "0.85rem", color: "#475569" }}>
              📍 Service Area: {user?.dealer_profile?.delivery_service_area || "Natrampalli Block"}
            </span>
          </div>
        </div>

        {/* Quick summary counters */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ background: "#ffffff", padding: "0.75rem 1.25rem", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0284c7" }}>{requests.length}</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Requests</div>
          </div>
          <div style={{ background: "#ffffff", padding: "0.75rem 1.25rem", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#16a34a" }}>{orders.length}</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Orders</div>
          </div>
          <div style={{ background: "#ffffff", padding: "0.75rem 1.25rem", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#d97706" }}>{products.length}</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Stock Items</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1.75rem", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem" }}>
        <button
          className={`btn btn-sm ${activeTab === "requests" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("requests")}
        >
          <Sprout size={15} /> Incoming Plant Disease Requests ({requests.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === "orders" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("orders")}
        >
          <Truck size={15} /> Orders & Doorstep Deliveries ({orders.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === "inventory" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("inventory")}
        >
          <Package size={15} /> Product Inventory & Pricing ({products.length})
        </button>
      </div>

      {/* TAB 1: Incoming Plant Disease Requests */}
      {activeTab === "requests" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
            Farmers in Natrampalli who uploaded affected plant photos. Inspect photos, AI findings, and submit your independent agricultural assessment and competitive quotation.
          </div>

          {requests.map((req) => (
            <div key={req.id} className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                    <span className="badge badge-info">Request #{req.id}</span>
                    <span className="badge badge-neutral">📍 {req.village}</span>
                    {req.dealer_has_quoted && (
                      <span className="badge badge-success">✓ You Quoted</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: "1.3rem", color: "#0f172a", fontWeight: 700 }}>
                    {req.crop_name} — Farmer: {req.farmer_name}
                  </h3>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.2rem" }}>
                    Delivery Location: <strong>{req.delivery_address}</strong> • Contact: {req.farmer_mobile}
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedReqForQuote(req);
                    setDealerAssessmentNotes(`Inspected ${req.crop_name} symptoms. Formulated targeted curative formulation.`);
                  }}
                >
                  <FileText size={16} /> Submit Assessment & Quotation
                </button>
              </div>

              {/* Symptom Description & AI Preliminary Finding */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginTop: "1.25rem" }}>
                <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#475569", marginBottom: "0.3rem" }}>
                    Farmer's Reported Symptoms:
                  </div>
                  <p style={{ fontSize: "0.88rem", color: "#1e293b", lineHeight: 1.4 }}>
                    "{req.symptoms_description}"
                  </p>
                  <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "0.4rem" }}>
                    Affected part: {req.affected_part}
                  </div>
                </div>

                {req.ai_report && (
                  <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "1rem", borderRadius: "10px" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#047857", marginBottom: "0.3rem" }}>
                      AI Vision Preliminary Finding ({(req.ai_report.confidence * 100).toFixed(0)}% confidence):
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#065f46" }}>
                      {req.ai_report.possible_disease}
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "#047857", marginTop: "0.25rem" }}>
                      {req.ai_report.preventive_measures}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Orders & Deliveries Management */}
      {activeTab === "orders" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
            Orders confirmed by farmers with verified payment. Progress each order from preparation to doorstep delivery.
          </div>

          {orders.length === 0 ? (
            <div className="card" style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
              No paid orders currently waiting for dispatch.
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="card" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <span className="badge badge-success" style={{ marginBottom: "0.3rem" }}>
                      Paid Order: {order.order_number}
                    </span>
                    <h3 style={{ fontSize: "1.25rem", color: "#0f172a", fontWeight: 700 }}>
                      Farmer: {order.farmer_name} ({order.contact_mobile})
                    </h3>
                    <div style={{ fontSize: "0.85rem", color: "#475569", marginTop: "0.2rem" }}>
                      Doorstep Destination: <strong>{order.delivery_address}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#15803d" }}>
                      ₹{order.total_amount}
                    </div>
                    <span className="badge badge-info" style={{ textTransform: "capitalize" }}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Items in order */}
                <div style={{ background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "10px", margin: "1rem 0" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "#475569", marginBottom: "0.4rem" }}>
                    Items to Pack:
                  </div>
                  {order.items?.map((it, i) => (
                    <div key={i} style={{ fontSize: "0.88rem", display: "flex", justifyContent: "space-between" }}>
                      <span>• {it.product_name} ({it.brand}) x {it.quantity}</span>
                      <span style={{ fontWeight: 600 }}>₹{it.total_price}</span>
                    </div>
                  ))}
                </div>

                {/* Status progression actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap", borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
                    Update Delivery Status:
                  </span>

                  <button
                    className={`btn btn-sm ${order.status === "order_accepted" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => handleUpdateOrderStatus(order.id, "order_accepted")}
                  >
                    1. Accept Order
                  </button>

                  <button
                    className={`btn btn-sm ${order.status === "preparing" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => handleUpdateOrderStatus(order.id, "preparing")}
                  >
                    2. Preparing Items
                  </button>

                  <button
                    className={`btn btn-sm ${order.status === "ready_for_dispatch" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => handleUpdateOrderStatus(order.id, "ready_for_dispatch")}
                  >
                    3. Ready For Dispatch
                  </button>

                  <button
                    className={`btn btn-sm ${order.status === "out_for_delivery" ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => handleUpdateOrderStatus(order.id, "out_for_delivery")}
                  >
                    4. Out For Delivery
                  </button>

                  <button
                    className={`btn btn-sm ${order.status === "delivered" ? "btn-primary" : "btn-secondary"}`}
                    style={{ background: order.status === "delivered" ? "#16a34a" : "", color: order.status === "delivered" ? "#fff" : "" }}
                    onClick={() => handleUpdateOrderStatus(order.id, "delivered")}
                  >
                    5. Delivered
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Product Inventory & Pricing */}
      {activeTab === "inventory" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <p style={{ color: "#64748b", margin: 0 }}>
              Manage your stock of fertilizers, insecticides, fungicides, and biological inputs.
            </p>
            <button className="btn btn-primary" onClick={() => setShowAddProduct(true)}>
              <Plus size={16} /> Add Product to Catalog
            </button>
          </div>

          <div className="grid-responsive-cards">
            {products.map((p) => (
              <div key={p.id} className="card" style={{ padding: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <span className="badge badge-info">{p.category}</span>
                  <span className="badge badge-success">In Stock: {p.stock_quantity}</span>
                </div>
                <h4 style={{ fontSize: "1.05rem", color: "#0f172a", marginBottom: "0.2rem" }}>
                  {p.name}
                </h4>
                <div style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "0.75rem" }}>
                  Brand: {p.brand} {p.active_ingredient && `• ${p.active_ingredient}`}
                </div>

                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{p.unit}</span>
                  <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "#15803d" }}>₹{p.unit_price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quotation Builder Modal */}
      {selectedReqForQuote && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={() => setSelectedReqForQuote(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: "700px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "2rem",
              background: "#ffffff",
              borderRadius: "16px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <span className="badge badge-info">Quotation Builder</span>
                <h3 style={{ fontSize: "1.35rem", color: "#14532d", fontWeight: 700, marginTop: "0.2rem" }}>
                  Submit Quotation for {selectedReqForQuote.crop_name}
                </h3>
                <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                  Farmer: {selectedReqForQuote.farmer_name} • Destination: {selectedReqForQuote.village}
                </div>
              </div>
            </div>

            {/* Assessment Notes */}
            <div className="form-group">
              <label className="form-label">Dealer Agronomic Assessment & Diagnosis Note *</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={dealerAssessmentNotes}
                onChange={(e) => setDealerAssessmentNotes(e.target.value)}
                placeholder="e.g. Confirmed late blight. Recommend protective translaminar fungicide."
                required
              />
            </div>

            {/* Products in Quote */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label className="form-label" style={{ margin: 0 }}>Recommended Products in Quotation:</label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddQuoteProductRow}
                >
                  + Add Another Product
                </button>
              </div>

              {quoteProducts.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1.5fr 1fr 1fr auto",
                    gap: "0.5rem",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Product Name (e.g. Infinito)"
                    value={p.product_name}
                    onChange={(e) => handleQuoteProductChange(idx, "product_name", e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Brand (e.g. Bayer)"
                    value={p.brand}
                    onChange={(e) => handleQuoteProductChange(idx, "brand", e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    placeholder="Qty"
                    value={p.quantity}
                    onChange={(e) => handleQuoteProductChange(idx, "quantity", e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Price (₹)"
                    value={p.unit_price}
                    onChange={(e) => handleQuoteProductChange(idx, "unit_price", e.target.value)}
                    required
                  />
                  {quoteProducts.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ color: "#ef4444" }}
                      onClick={() => handleRemoveQuoteProductRow(idx)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Delivery Charge & Delivery Hours */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Delivery Fee (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Delivery (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  className="form-input"
                  value={deliveryHours}
                  onChange={(e) => setDeliveryHours(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Quote Validity (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  className="form-input"
                  value={validityDays}
                  onChange={(e) => setValidityDays(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Instructions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">Dosage & Application Instructions</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={applicationInstructions}
                  onChange={(e) => setApplicationInstructions(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Safety Precautions</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={safetyInstructions}
                  onChange={(e) => setSafetyInstructions(e.target.value)}
                />
              </div>
            </div>

            {/* Quotation Summary Total */}
            <div
              style={{
                background: "#f0fdf4",
                border: "1.5px solid #86efac",
                borderRadius: "10px",
                padding: "0.85rem 1.25rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <span style={{ fontWeight: 600, color: "#166534" }}>Total Quotation Amount (Farmer Payable):</span>
              <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#15803d" }}>
                ₹{calculateQuoteTotal()}
              </span>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedReqForQuote(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleSubmitQuotation("draft")}
                disabled={submittingQuote}
              >
                <Save size={16} /> Save Draft
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSubmitQuotation("submitted")}
                disabled={submittingQuote}
              >
                <Send size={16} /> Submit to Farmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={() => setShowAddProduct(false)}
        >
          <div
            className="card"
            style={{ maxWidth: "500px", width: "100%", padding: "2rem", background: "#ffffff" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "1.3rem", color: "#0f172a", fontWeight: 700, marginBottom: "1rem" }}>
              Add Agrochemical Product
            </h3>

            <form onSubmit={handleCreateProduct}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Nativo Fungicide"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Brand / Manufacturer *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Bayer / UPL"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                  >
                    <option value="Fungicide">Fungicide (பூஞ்சாணக்கொல்லி)</option>
                    <option value="Insecticide">Insecticide (பூச்சிக்கொல்லி)</option>
                    <option value="Fertilizer">Fertilizer (உரம்)</option>
                    <option value="Bio-control">Bio-control (உயிர் உரங்கள்)</option>
                    <option value="Micronutrient">Micronutrient (நுண்ணூட்டம்)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Price per Unit (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 580"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddProduct(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
