import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { api } from "../../services/api";
import {
  Sparkles,
  Layers,
  Truck,
  ShoppingBag,
  Tractor,
  CloudSun,
  TrendingUp,
  Award,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from "lucide-react";

export const FarmerDashboard = ({ setActiveTab, setSelectedRequestId }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [myRequests, setMyRequests] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqs, ords, wRes] = await Promise.all([
          api.getMyDiseaseRequests(),
          api.getMyOrders(),
          api.getWeather(),
        ]);
        setMyRequests(reqs);
        setMyOrders(ords);
        setWeather(wRes);
      } catch (e) {
        console.error("Dashboard fetch error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const farmerVillage = user?.farmer_profile?.village || "Natrampalli Pudur";

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: "3rem" }}>
      {/* Farmer Greeting Banner */}
      <div
        className="glass-panel"
        style={{
          padding: "1.75rem",
          background: "linear-gradient(135deg, rgba(240, 253, 244, 0.9) 0%, rgba(220, 252, 231, 0.7) 100%)",
          border: "1.5px solid #86efac",
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
            <span style={{ fontSize: "1.4rem" }}>🙏</span>
            <h2 style={{ fontSize: "1.75rem", color: "#14532d", fontWeight: 800 }}>
              {language === "ta" ? `வணக்கம், ${user?.name || "விவசாயி"}` : `Welcome, ${user?.name || "Farmer"}`}
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#15803d", fontSize: "0.95rem" }}>
            <MapPin size={16} />
            <span>{farmerVillage}, Natrampalli Block, Tirupattur</span>
          </div>
        </div>

        {weather && (
          <div
            style={{
              background: "#ffffff",
              padding: "0.75rem 1.25rem",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              gap: "0.85rem",
            }}
          >
            <CloudSun size={28} color="#0284c7" />
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#0f172a" }}>
                {weather.current.temperature_c}°C
              </div>
              <div style={{ fontSize: "0.75rem", color: "#15803d", fontWeight: 600 }}>
                {weather.spray_advisory.is_safe_to_spray ? "✓ Spraying Favorable" : "⚠ Hold Spraying"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Feature Highlight: AI Plant Doctor Card */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
          color: "#ffffff",
          padding: "2rem",
          borderRadius: "20px",
          boxShadow: "0 10px 25px rgba(22, 101, 52, 0.25)",
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "600px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "rgba(255, 255, 255, 0.2)",
              padding: "0.3rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              marginBottom: "0.75rem",
            }}
          >
            <Sparkles size={14} color="#fde047" /> CORE INNOVATION • பிரதான அம்சம்
          </div>

          <h3 style={{ fontSize: "1.8rem", color: "#ffffff", marginBottom: "0.5rem" }}>
            {language === "ta" ? "AI தாவர மருத்துவர் & பல டீலர் விலை ஒப்பீடு" : "AI Plant Doctor & Multi-Dealer Quotations"}
          </h3>

          <p style={{ color: "#dcfce7", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "1.25rem" }}>
            {language === "ta"
              ? "பாதிக்கப்பட்ட பயிரின் புகைப்படத்தை பதிவேற்றுங்கள். AI ஆரம்ப நோயறிதல் மற்றும் நாட்ராம்பள்ளி வட்டார உரக்கடைகளின் விலைப்புள்ளிகளை பெற்று, விலையை ஒப்பிட்டு, வீட்டிற்கே மருந்துகளை ஆர்டர் செய்யுங்கள்."
              : "Upload affected plant photos, receive instant AI agronomic diagnosis, compare quotes from multiple Natrampalli dealers, pay securely, and get doorstep delivery."}
          </p>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              className="btn btn-accent btn-lg"
              style={{ fontWeight: 700 }}
              onClick={() => setActiveTab("ai_doctor")}
            >
              <Sparkles size={18} />
              {language === "ta" ? "பயிர் நோய் கண்டறி (Diagnose Now)" : "Diagnose Crop Problem"}
            </button>
            <button
              className="btn btn-secondary btn-lg"
              style={{ background: "rgba(255, 255, 255, 0.9)" }}
              onClick={() => setActiveTab("compare_quotes")}
            >
              <Layers size={18} />
              {t("compareQuotes")}
            </button>
          </div>
        </div>

        <div
          style={{
            background: "rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(8px)",
            padding: "1.5rem",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            minWidth: "240px",
          }}
        >
          <div style={{ fontSize: "0.85rem", opacity: 0.9, marginBottom: "0.25rem" }}>Active Disease Requests:</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800 }}>{myRequests.length}</div>
          <div style={{ fontSize: "0.8rem", color: "#fef08a", marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Clock size={14} /> Quotations waiting for review
          </div>
        </div>
      </div>

      {/* Grid of Farmer Modules */}
      <h3 style={{ fontSize: "1.3rem", color: "#14532d", marginBottom: "1rem" }}>
        {language === "ta" ? "விவசாய சேவைகள்" : "Farmer Services & Marketplace"}
      </h3>

      <div className="grid-responsive-cards" style={{ marginBottom: "2.5rem" }}>
        {/* Module 1: Compare Quotes */}
        <div
          className="card"
          style={{ padding: "1.5rem", cursor: "pointer" }}
          onClick={() => setActiveTab("compare_quotes")}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <div style={{ background: "#e0f2fe", padding: "0.6rem", borderRadius: "10px" }}>
              <Layers size={22} color="#0284c7" />
            </div>
            <span className="badge badge-info">3 Quotes Available</span>
          </div>
          <h4 style={{ fontSize: "1.15rem", marginBottom: "0.4rem" }}>{t("compareQuotes")}</h4>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
            Compare Dealer A (₹700), Dealer B (₹680), and Dealer C (₹730) total costs, delivery fees, and ETAs.
          </p>
          <div style={{ color: "#0284c7", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            Compare & Order <ArrowRight size={14} />
          </div>
        </div>

        {/* Module 2: Delivery Tracking */}
        <div
          className="card"
          style={{ padding: "1.5rem", cursor: "pointer" }}
          onClick={() => setActiveTab("my_orders")}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <div style={{ background: "#fef3c7", padding: "0.6rem", borderRadius: "10px" }}>
              <Truck size={22} color="#d97706" />
            </div>
            <span className="badge badge-warning">{myOrders.length} Orders</span>
          </div>
          <h4 style={{ fontSize: "1.15rem", marginBottom: "0.4rem" }}>{t("trackDeliveries")}</h4>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
            Real-time fertilizer and pesticide delivery tracking with 5-step status stepper to your farm gate.
          </p>
          <div style={{ color: "#d97706", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            View Order Progress <ArrowRight size={14} />
          </div>
        </div>

        {/* Module 3: Sell Harvested Crops */}
        <div
          className="card"
          style={{ padding: "1.5rem", cursor: "pointer" }}
          onClick={() => setActiveTab("crop_market")}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <div style={{ background: "#dcfce7", padding: "0.6rem", borderRadius: "10px" }}>
              <ShoppingBag size={22} color="#15803d" />
            </div>
            <span className="badge badge-success">Direct Trading</span>
          </div>
          <h4 style={{ fontSize: "1.15rem", marginBottom: "0.4rem" }}>{t("cropMarket")}</h4>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
            List harvested Tomato, Paddy, Groundnut, etc. and receive direct purchase offers from verified buyers.
          </p>
          <div style={{ color: "#15803d", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            Manage Crops & Offers <ArrowRight size={14} />
          </div>
        </div>

        {/* Module 4: Farm Machinery Rental */}
        <div
          className="card"
          style={{ padding: "1.5rem", cursor: "pointer" }}
          onClick={() => setActiveTab("machinery")}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <div style={{ background: "#ede9fe", padding: "0.6rem", borderRadius: "10px" }}>
              <Tractor size={22} color="#7c3aed" />
            </div>
            <span className="badge" style={{ background: "#ede9fe", color: "#6d28d9" }}>Tractors & Harvesters</span>
          </div>
          <h4 style={{ fontSize: "1.15rem", marginBottom: "0.4rem" }}>{t("machinery")}</h4>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
            Rent Mahindra tractors with rotavators, Yanmar combine harvesters, and sprayers with verified operators.
          </p>
          <div style={{ color: "#7c3aed", fontWeight: 700, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            Book Machinery <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* Recent Disease Requests Snippet */}
      {myRequests.length > 0 && (
        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h4 style={{ fontSize: "1.2rem", color: "#14532d" }}>
              {language === "ta" ? "உங்கள் சமீபத்திய பயிர் நோய் கோரிக்கைகள்" : "Your Recent Disease Requests"}
            </h4>
            <button className="btn btn-outline btn-sm" onClick={() => setActiveTab("compare_quotes")}>
              Compare All Quotes
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {myRequests.slice(0, 2).map((req) => (
              <div
                key={req.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#0f172a" }}>
                    {req.crop_name}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.2rem" }}>
                    AI Diagnosis: <strong>{req.ai_report?.possible_disease || "Analysis Pending"}</strong> ({(req.ai_report?.confidence * 100).toFixed(0)}% confidence)
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "0.2rem" }}>
                    📍 {req.village} • {req.quotations?.length || 0} dealer quotations received
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span className="badge badge-success">
                    {req.quotations?.length || 0} Quotes Received
                  </span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      if (setSelectedRequestId) setSelectedRequestId(req.id);
                      setActiveTab("compare_quotes");
                    }}
                  >
                    Compare Quotes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
