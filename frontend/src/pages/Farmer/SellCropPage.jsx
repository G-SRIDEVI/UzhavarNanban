import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import {
  ShoppingBag,
  Plus,
  CheckCircle2,
  XCircle,
  Tag,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export const SellCropPage = () => {
  const { language, t } = useLanguage();
  const toast = useToast();

  const [myCrops, setMyCrops] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cropName, setCropName] = useState("Tomato (நாட்டு தக்காளி)");
  const [variety, setVariety] = useState("Hybrid S-21");
  const [availableQuantity, setAvailableQuantity] = useState("30");
  const [unit, setUnit] = useState("Quintal");
  const [expectedPrice, setExpectedPrice] = useState("3200");
  const [harvestDate, setHarvestDate] = useState("Ready in 3 days");
  const [village, setVillage] = useState("Natrampalli Pudur");
  const [pickupPreference, setPickupPreference] = useState("Farm Gate Pickup");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchMyCrops = async () => {
    try {
      const data = await api.getMyCrops();
      setMyCrops(data);
    } catch (err) {
      console.error("Failed to load crops", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCrops();
  }, []);

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createCropListing({
        crop_name: cropName,
        variety,
        available_quantity: parseFloat(availableQuantity),
        unit,
        expected_price: parseFloat(expectedPrice),
        harvest_date: harvestDate,
        village,
        pickup_preference: pickupPreference,
      });
      toast.success("Crop listing published to buyers!");
      setShowAddModal(false);
      fetchMyCrops();
    } catch (err) {
      toast.error(err.message || "Failed to create crop listing");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOfferStatus = async (offerId, status) => {
    try {
      await api.updateOfferStatus(offerId, status);
      toast.success(`Buyer offer ${status}!`);
      fetchMyCrops();
    } catch (err) {
      toast.error(err.message || "Failed to update offer");
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: "4rem" }}>
      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", color: "#14532d", fontWeight: 800 }}>
            {language === "ta" ? "விளைபொருள் விற்பனை சந்தை" : "Direct Crop Selling & Buyer Offers"}
          </h2>
          <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
            List your harvest directly to wholesale buyers without middleman commissions.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> List Harvested Crop
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
          Loading your crop listings...
        </div>
      ) : myCrops.length === 0 ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
          <ShoppingBag size={42} color="#16a34a" style={{ margin: "0 auto 1rem auto" }} />
          <h3 style={{ fontSize: "1.3rem", color: "#0f291e", marginBottom: "0.5rem" }}>
            No Crop Listings Yet
          </h3>
          <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
            List your ripe tomatoes, paddy, groundnut, or other produce to receive purchase offers from wholesale traders in Tirupattur and Vaniyambadi.
          </p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Create First Crop Listing
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {myCrops.map((crop) => (
            <div key={crop.id} className="card" style={{ padding: "1.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <span className="badge badge-success" style={{ marginBottom: "0.3rem" }}>
                    Status: {crop.status.toUpperCase()}
                  </span>
                  <h3 style={{ fontSize: "1.35rem", color: "#0f291e", fontWeight: 700 }}>
                    {crop.crop_name}
                  </h3>
                  <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    Variety: <strong>{crop.variety || "Local Selection"}</strong> • Available: <strong>{crop.available_quantity} {crop.unit}s</strong>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" }}>
                    📍 {crop.village} • {crop.pickup_preference}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Expected Price:</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#15803d" }}>
                    ₹{crop.expected_price}
                    <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 400 }}>/{crop.unit}</span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{crop.harvest_date}</div>
                </div>
              </div>

              {/* Received Buyer Offers */}
              <div style={{ marginTop: "1.5rem", borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, fontSize: "0.95rem", color: "#1e293b", marginBottom: "0.75rem" }}>
                  <TrendingUp size={16} color="#d97706" />
                  Received Buyer Offers ({crop.offers?.length || 0}):
                </div>

                {crop.offers && crop.offers.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {crop.offers.map((offer) => (
                      <div
                        key={offer.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "1rem",
                          background: "#f8fafc",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          flexWrap: "wrap",
                          gap: "0.75rem",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>
                            {offer.buyer_business_name || offer.buyer_name}
                          </div>
                          <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                            Offered Rate: <strong style={{ color: "#15803d" }}>₹{offer.offered_price_per_unit}/{crop.unit}</strong> (Total: ₹{offer.total_offered_amount})
                          </div>
                          {offer.message && (
                            <p style={{ fontSize: "0.82rem", color: "#334155", marginTop: "0.25rem", fontStyle: "italic" }}>
                              "{offer.message}"
                            </p>
                          )}
                          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.2rem" }}>
                            Buyer Phone: {offer.buyer_mobile || "Verified"}
                          </div>
                        </div>

                        {offer.status === "pending" ? (
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleOfferStatus(offer.id, "accepted")}
                            >
                              <CheckCircle2 size={14} /> Accept Offer
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ color: "#ef4444" }}
                              onClick={() => handleOfferStatus(offer.id, "rejected")}
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`badge ${
                              offer.status === "accepted" ? "badge-success" : "badge-neutral"
                            }`}
                          >
                            Offer {offer.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic" }}>
                    No offers received yet. Wholesale buyers in Natrampalli and Tirupattur have been notified.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Crop Listing Modal */}
      {showAddModal && (
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
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="card"
            style={{ maxWidth: "540px", width: "100%", padding: "2rem", background: "#ffffff" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "1.3rem", color: "#14532d", fontWeight: 700, marginBottom: "1rem" }}>
              List Harvested Crop For Sale
            </h3>

            <form onSubmit={handleCreateListing}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Crop Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Variety / Grade</label>
                  <input
                    type="text"
                    className="form-input"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Available Quantity *</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-input"
                    value={availableQuantity}
                    onChange={(e) => setAvailableQuantity(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit of Measure</label>
                  <select
                    className="form-select"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    <option value="Quintal">Quintal (100 Kg)</option>
                    <option value="Kg">Kilogram (Kg)</option>
                    <option value="Bag">Bag (50 Kg)</option>
                    <option value="Ton">Ton</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Expected Price per {unit} (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Harvest / Ready Date</label>
                  <input
                    type="text"
                    className="form-input"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Pickup / Delivery Preference</label>
                <select
                  className="form-select"
                  value={pickupPreference}
                  onChange={(e) => setPickupPreference(e.target.value)}
                >
                  <option value="Farm Gate Pickup">Farm Gate Pickup (Buyer arranges lorry)</option>
                  <option value="Farmer Delivers to Mandi">Farmer delivers to Natrampalli Mandi</option>
                  <option value="Negotiable">Negotiable</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Publishing..." : "Publish Crop to Buyers"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
