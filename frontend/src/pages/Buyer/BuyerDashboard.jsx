import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import {
  ShoppingBag,
  Search,
  Filter,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle2,
  Send,
  Building2,
  Tag,
  Phone,
} from "lucide-react";

export const BuyerDashboard = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("browse"); // 'browse' or 'my_offers'
  const [crops, setCrops] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [searchCrop, setSearchCrop] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [selectedCropForOffer, setSelectedCropForOffer] = useState(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [cropsData, offersData] = await Promise.all([
        api.browseCrops({ crop: searchCrop, village: selectedVillage }),
        api.getMyCrops ? [] : [], // placeholder
      ]);
      setCrops(cropsData);

      // Fetch buyer's sent offers
      const token = localStorage.getItem("uzhavar_token");
      const res = await fetch("http://localhost:8000/api/crop-listings/offers/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const oData = await res.json();
        setMyOffers(oData);
      }
    } catch (err) {
      console.error("Buyer dashboard error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchCrop, selectedVillage]);

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!selectedCropForOffer || !offerPrice) return;
    setSubmittingOffer(true);

    try {
      await api.makeBuyerOffer(selectedCropForOffer.id, {
        offered_price_per_unit: parseFloat(offerPrice),
        message: offerMessage || "Interested in purchasing your harvest at this price.",
      });

      toast.success(
        `Purchase offer of ₹${offerPrice}/${selectedCropForOffer.unit} sent to farmer ${selectedCropForOffer.farmer_name}!`
      );
      setSelectedCropForOffer(null);
      setOfferPrice("");
      setOfferMessage("");
      fetchData();
      setActiveTab("my_offers");
    } catch (err) {
      toast.error(err.message || "Failed to submit purchase offer");
    } finally {
      setSubmittingOffer(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: "4rem" }}>
      {/* Buyer Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: "1.75rem",
          background: "linear-gradient(135deg, rgba(254, 243, 199, 0.9) 0%, rgba(254, 249, 195, 0.7) 100%)",
          border: "1.5px solid #fde047",
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
            <Building2 size={24} color="#d97706" />
            <h2 style={{ fontSize: "1.75rem", color: "#0f172a", fontWeight: 800 }}>
              {user?.buyer_profile?.business_name || "Agri Wholesale Traders"}
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <span className="badge badge-warning">
              {user?.buyer_profile?.buyer_type || "Wholesale Buyer"}
            </span>
            <span style={{ fontSize: "0.85rem", color: "#475569" }}>
              📍 Natrampalli & Tirupattur Mandi Region
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ background: "#ffffff", padding: "0.75rem 1.25rem", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#d97706" }}>{crops.length}</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Available Crops</div>
          </div>
          <div style={{ background: "#ffffff", padding: "0.75rem 1.25rem", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#16a34a" }}>{myOffers.length}</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Offers Sent</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1.75rem", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem" }}>
        <button
          className={`btn btn-sm ${activeTab === "browse" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("browse")}
        >
          <ShoppingBag size={15} /> Browse Available Produce ({crops.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === "my_offers" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("my_offers")}
        >
          <TrendingUp size={15} /> My Purchase Offers & Status ({myOffers.length})
        </button>
      </div>

      {/* TAB 1: Browse Crops */}
      {activeTab === "browse" && (
        <div>
          {/* Search and Filters */}
          <div
            className="card"
            style={{
              padding: "1rem 1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Search size={18} color="#64748b" />
              <input
                type="text"
                className="form-input"
                placeholder="Search by crop (Tomato, Paddy, Groundnut...)"
                value={searchCrop}
                onChange={(e) => setSearchCrop(e.target.value)}
                style={{ margin: 0 }}
              />
            </div>

            <div style={{ minWidth: "180px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Filter size={18} color="#64748b" />
              <select
                className="form-select"
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                style={{ margin: 0 }}
              >
                <option value="">All Villages</option>
                <option value="Natrampalli">Natrampalli</option>
                <option value="Pachur">Pachur</option>
                <option value="Velakalnatham">Velakalnatham</option>
                <option value="Kothur">Kothur</option>
              </select>
            </div>
          </div>

          {/* Crops Grid */}
          <div className="grid-responsive-cards">
            {crops.map((crop) => (
              <div
                key={crop.id}
                className="card"
                style={{
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <span className="badge badge-success">Fresh Harvest</span>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{crop.harvest_date}</span>
                  </div>

                  <h3 style={{ fontSize: "1.25rem", color: "#0f291e", fontWeight: 700, marginBottom: "0.2rem" }}>
                    {crop.crop_name}
                  </h3>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "0.6rem" }}>
                    Variety: <strong>{crop.variety || "Local Selection"}</strong>
                  </div>

                  <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "10px", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginBottom: "0.3rem" }}>
                      <span style={{ color: "#64748b" }}>Available Quantity:</span>
                      <span style={{ fontWeight: 700 }}>{crop.available_quantity} {crop.unit}s</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", color: "#15803d", fontWeight: 800 }}>
                      <span>Farmer Expected:</span>
                      <span>₹{crop.expected_price}/{crop.unit}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: "0.8rem", color: "#475569", display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <MapPin size={13} color="#0284c7" />
                      <span>{crop.village} • {crop.pickup_preference}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Phone size={13} color="#15803d" />
                      <span>Farmer: {crop.farmer_name} ({crop.farmer_mobile || "Verified"})</span>
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: "100%", background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)" }}
                  onClick={() => {
                    setSelectedCropForOffer(crop);
                    setOfferPrice(crop.expected_price.toString());
                  }}
                >
                  <Send size={15} /> Submit Purchase Offer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: My Sent Offers */}
      {activeTab === "my_offers" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {myOffers.length === 0 ? (
            <div className="card" style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
              You have not submitted any purchase offers yet.
            </div>
          ) : (
            myOffers.map((o) => (
              <div
                key={o.id}
                className="card"
                style={{
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <h4 style={{ fontSize: "1.15rem", color: "#0f172a", fontWeight: 700 }}>
                    {o.crop_name}
                  </h4>
                  <div style={{ fontSize: "0.85rem", color: "#475569", marginTop: "0.2rem" }}>
                    Your Offered Rate: <strong>₹{o.offered_price_per_unit}</strong> • Total: <strong>₹{o.total_offered_amount}</strong>
                  </div>
                  {o.message && (
                    <div style={{ fontSize: "0.8rem", color: "#64748b", fontStyle: "italic", marginTop: "0.2rem" }}>
                      Note: "{o.message}"
                    </div>
                  )}
                </div>

                <div style={{ textAlign: "right" }}>
                  <span
                    className={`badge ${
                      o.status === "accepted"
                        ? "badge-success"
                        : o.status === "rejected"
                        ? "badge-neutral"
                        : "badge-warning"
                    }`}
                    style={{ fontSize: "0.82rem", padding: "0.3rem 0.75rem" }}
                  >
                    {o.status.toUpperCase()}
                  </span>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.3rem" }}>
                    {o.status === "accepted" ? "Farmer accepted! Prepare procurement." : "Waiting for farmer response"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Make Purchase Offer Modal */}
      {selectedCropForOffer && (
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
            zIndex: 100,
            padding: "1rem",
          }}
          onClick={() => setSelectedCropForOffer(null)}
        >
          <div
            className="card"
            style={{ maxWidth: "500px", width: "100%", padding: "2rem", background: "#ffffff" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "1.3rem", color: "#0f172a", fontWeight: 700, marginBottom: "0.25rem" }}>
              Submit Offer for {selectedCropForOffer.crop_name}
            </h3>
            <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.25rem" }}>
              Farmer Expected: ₹{selectedCropForOffer.expected_price}/{selectedCropForOffer.unit} • Available: {selectedCropForOffer.available_quantity} {selectedCropForOffer.unit}s
            </div>

            <form onSubmit={handleSubmitOffer}>
              <div className="form-group">
                <label className="form-label">
                  Your Offered Price per {selectedCropForOffer.unit} (₹) *
                </label>
                <input
                  type="number"
                  step="10"
                  className="form-input"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  required
                />
              </div>

              {/* Estimated Total */}
              <div
                style={{
                  background: "#fef3c7",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <span style={{ fontSize: "0.85rem", color: "#92400e" }}>Total Offered Value:</span>
                <span style={{ fontWeight: 800, fontSize: "1.2rem", color: "#b45309" }}>
                  ₹{(parseFloat(offerPrice) || 0) * selectedCropForOffer.available_quantity}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Message / Logistics Note to Farmer</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Can arrange transport lorry to your farm on Thursday morning. Immediate bank transfer."
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.25rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedCropForOffer(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: "#d97706" }}
                  disabled={submittingOffer}
                >
                  {submittingOffer ? "Sending..." : "Send Purchase Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
