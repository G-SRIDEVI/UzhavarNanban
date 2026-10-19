import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Sprout, Store, ShoppingBag, Truck, UserPlus } from "lucide-react";

export const RegisterPage = ({ setActiveTab, defaultRole = "farmer" }) => {
  const { register } = useAuth();
  const { language, t } = useLanguage();

  const [role, setRole] = useState(defaultRole);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferredLang, setPreferredLang] = useState(language);

  // Role specific fields
  const [village, setVillage] = useState("Natrampalli Pudur");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [shopName, setShopName] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [serviceArea, setServiceArea] = useState("Natrampalli Block (Radius 12 km)");
  const [businessName, setBusinessName] = useState("");
  const [buyerType, setBuyerType] = useState("Wholesaler");
  const [businessAddress, setBusinessAddress] = useState("");
  const [alternateMobile, setAlternateMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      mobile,
      email: email || null,
      password,
      role,
      preferred_language: preferredLang,
      village,
      delivery_address: deliveryAddress || `${village}, Natrampalli Block`,
      shop_name: shopName,
      licence_number: licenceNumber,
      shop_address: shopAddress,
      delivery_service_area: serviceArea,
      business_name: businessName,
      buyer_type: buyerType,
      business_address: businessAddress,
      alternate_mobile: alternateMobile,
    };

    try {
      const res = await register(payload);
      if (res.user.role === "farmer") setActiveTab("home");
      else if (res.user.role === "dealer") setActiveTab("dealer_dashboard");
      else if (res.user.role === "buyer") setActiveTab("buyer_dashboard");
      else if (res.user.role === "machinery_owner") setActiveTab("machinery_dashboard");
    } catch (err) {
      // Handled by AuthContext toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: "600px", margin: "2rem auto" }}>
      <div className="card" style={{ padding: "2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.6rem", color: "#14532d" }}>
            {language === "ta" ? "புதிய பயனர் பதிவு" : "Create UzhavarNanban Account"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>
            Select your agricultural role in Natrampalli Block
          </p>
        </div>

        {/* 4 Role Selector Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0.4rem",
            background: "#f1f5f9",
            padding: "0.35rem",
            borderRadius: "12px",
            marginBottom: "1.75rem",
          }}
        >
          <button
            type="button"
            className="btn btn-sm"
            style={{
              background: role === "farmer" ? "#16a34a" : "transparent",
              color: role === "farmer" ? "#ffffff" : "#475569",
              padding: "0.5rem 0.2rem",
              fontSize: "0.78rem",
            }}
            onClick={() => setRole("farmer")}
          >
            <Sprout size={14} /> Farmer
          </button>

          <button
            type="button"
            className="btn btn-sm"
            style={{
              background: role === "dealer" ? "#0284c7" : "transparent",
              color: role === "dealer" ? "#ffffff" : "#475569",
              padding: "0.5rem 0.2rem",
              fontSize: "0.78rem",
            }}
            onClick={() => setRole("dealer")}
          >
            <Store size={14} /> Dealer
          </button>

          <button
            type="button"
            className="btn btn-sm"
            style={{
              background: role === "buyer" ? "#d97706" : "transparent",
              color: role === "buyer" ? "#ffffff" : "#475569",
              padding: "0.5rem 0.2rem",
              fontSize: "0.78rem",
            }}
            onClick={() => setRole("buyer")}
          >
            <ShoppingBag size={14} /> Buyer
          </button>

          <button
            type="button"
            className="btn btn-sm"
            style={{
              background: role === "machinery_owner" ? "#7c3aed" : "transparent",
              color: role === "machinery_owner" ? "#ffffff" : "#475569",
              padding: "0.5rem 0.2rem",
              fontSize: "0.78rem",
            }}
            onClick={() => setRole("machinery_owner")}
          >
            <Truck size={14} /> Owner
          </button>
        </div>

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit}>
          {/* Universal Core Fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Full Name (முழு பெயர்) *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ramasamy / முருகன்"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number (அலைபேசி) *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="10-digit mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Password (கடவுச்சொல்) *</label>
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email (மின்னஞ்சல் - Optional)</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Role 1: Farmer Specific */}
          {role === "farmer" && (
            <div style={{ background: "#f0fdf4", padding: "1rem", borderRadius: "10px", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#15803d", marginBottom: "0.6rem" }}>
                🌾 Farmer Location & Delivery Details (விவசாயி இருப்பிடம்)
              </div>
              <div className="form-group">
                <label className="form-label">Village in Natrampalli Block (கிராமம்)</label>
                <select
                  className="form-select"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                >
                  <option value="Natrampalli Town">Natrampalli Town (நாட்ராம்பள்ளி)</option>
                  <option value="Natrampalli Pudur">Natrampalli Pudur (நாட்ராம்பள்ளி புதூர்)</option>
                  <option value="Pachur">Pachur (பாச்சூர்)</option>
                  <option value="Velakalnatham">Velakalnatham (வெலகல்நத்தம்)</option>
                  <option value="Kothur">Kothur (கொத்தூர்)</option>
                  <option value="Dasiriyappanur">Dasiriyappanur (தசிரையப்பனூர்)</option>
                  <option value="Thoppalagunda">Thoppalagunda (தொப்பலகுண்டா)</option>
                  <option value="Bandarapalli">Bandarapalli (பண்டாரப்பள்ளி)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Farm / Doorstep Delivery Address (டெலிவரி முகவரி)</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Door No, Street name, Near Landmark for fertilizer courier delivery"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Role 2: Dealer Specific */}
          {role === "dealer" && (
            <div style={{ background: "#f0f9ff", padding: "1rem", borderRadius: "10px", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#0284c7", marginBottom: "0.6rem" }}>
                🏪 Dealer Shop & Official Licence (உரக்கடை விவரங்கள்)
              </div>

              <div className="form-group">
                <label className="form-label">Shop / Business Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sri Balaji Agro Agencies Natrampalli"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fertilizer/Pesticide Licence No. *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. TN-TPT-AGR-49102"
                  value={licenceNumber}
                  onChange={(e) => setLicenceNumber(e.target.value)}
                  required
                />
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Note: Verified by administrator before selling regulated agrochemical products.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Shop Address & Delivery Service Area</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Bazaar Street, Natrampalli (Delivery radius 15 km)"
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Role 3: Buyer Specific */}
          {role === "buyer" && (
            <div style={{ background: "#fffbeb", padding: "1rem", borderRadius: "10px", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#d97706", marginBottom: "0.6rem" }}>
                📦 Agricultural Wholesale / Trader Details (வியாபாரி விவரங்கள்)
              </div>

              <div className="form-group">
                <label className="form-label">Company / Business Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Tirupattur Mandi Traders"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Buyer Type</label>
                <select
                  className="form-select"
                  value={buyerType}
                  onChange={(e) => setBuyerType(e.target.value)}
                >
                  <option value="Wholesaler">Wholesale Merchant (மொத்த வியாபாரி)</option>
                  <option value="Commission Agent">Mandi Commission Agent (மண்டி ஏஜென்ட்)</option>
                  <option value="Retailer">Retail Store / Supermarket (சில்லறை வியாபாரி)</option>
                  <option value="Food Processor">Food Processing Unit (உணவு பதப்படுத்தும் நிறுவனம்)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Business Address / Mandi Yard</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Vaniyambadi Market Yard"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Role 4: Machinery Owner Specific */}
          {role === "machinery_owner" && (
            <div style={{ background: "#f5f3ff", padding: "1rem", borderRadius: "10px", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#7c3aed", marginBottom: "0.6rem" }}>
                🚜 Farm Machinery Fleet Location
              </div>

              <div className="form-group">
                <label className="form-label">Base Village / Shed Location in Natrampalli</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Thoppalagunda, Natrampalli"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alternate Driver Mobile Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Optional driver contact"
                  value={alternateMobile}
                  onChange={(e) => setAlternateMobile(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem", padding: "0.85rem" }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Complete Registration"}
          </button>
        </form>

        <div style={{ marginTop: "1.25rem", textAlign: "center", fontSize: "0.85rem", color: "#64748b" }}>
          Already have an account?{" "}
          <button
            onClick={() => setActiveTab("login")}
            style={{
              background: "transparent",
              border: "none",
              color: "#16a34a",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {t("login")}
          </button>
        </div>
      </div>
    </div>
  );
};
