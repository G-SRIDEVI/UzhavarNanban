import React from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  Sprout,
  Store,
  ShoppingBag,
  Truck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Cpu,
} from "lucide-react";

export const LandingPage = ({ setActiveTab, setRegisterRole }) => {
  const { demoAccounts, quickLoginAs } = useAuth();
  const { language, t } = useLanguage();

  const handleRoleCardClick = (roleKey) => {
    // If demo account exists for this role, we can offer quick access or go to registration
    setRegisterRole(roleKey);
    setActiveTab("register");
  };

  const handleQuickDemoLogin = (roleKey) => {
    const acc = demoAccounts.find((a) => a.role === roleKey);
    if (acc) {
      quickLoginAs(acc);
      if (roleKey === "farmer") setActiveTab("home");
      else if (roleKey === "dealer") setActiveTab("dealer_dashboard");
      else if (roleKey === "buyer") setActiveTab("buyer_dashboard");
      else if (roleKey === "machinery_owner") setActiveTab("machinery_dashboard");
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: "3rem" }}>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(180deg, rgba(220, 252, 231, 0.6) 0%, rgba(248, 250, 249, 1) 100%)",
          padding: "3.5rem 1rem 2.5rem 1rem",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Location Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#ffffff",
              border: "1.5px solid #bbf7d0",
              padding: "0.35rem 1rem",
              borderRadius: "9999px",
              boxShadow: "0 2px 8px rgba(34, 197, 94, 0.15)",
              marginBottom: "1.5rem",
            }}
          >
            <MapPin size={16} color="#15803d" />
            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#14532d" }}>
              Natrampalli Block • Tirupattur District, Tamil Nadu
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
              lineHeight: 1.15,
              color: "#0f291e",
              fontWeight: 800,
              marginBottom: "1rem",
            }}
          >
            {language === "ta" ? (
              <>
                உழவர் நண்பன்: <span style={{ color: "#16a34a" }}>வேளாண் புரட்சி</span>
              </>
            ) : (
              <>
                UzhavarNanban: <span style={{ color: "#16a34a" }}>AI Plant Doctor</span> & Multi-Dealer Delivery
              </>
            )}
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              color: "#475569",
              lineHeight: 1.6,
              maxWidth: "760px",
              margin: "0 auto 2rem auto",
            }}
          >
            {t("heroSubtitle")}
          </p>

          {/* Call to Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-primary btn-lg"
              onClick={() => handleQuickDemoLogin("farmer")}
              style={{ gap: "0.6rem" }}
            >
              <Sparkles size={18} color="#fde047" />
              {language === "ta" ? "விவசாயி டெமோ தொடங்கு" : "Launch Farmer Demo"}
              <ArrowRight size={18} />
            </button>

            <button
              className="btn btn-secondary btn-lg"
              onClick={() => setActiveTab("register")}
            >
              {t("register")}
            </button>

            <button
              className="btn btn-outline btn-lg"
              onClick={() => setActiveTab("advisory")}
            >
              View Local Mandi Prices
            </button>
          </div>

          {/* Core Workflow Highlight */}
          <div
            className="glass-panel"
            style={{
              marginTop: "2.75rem",
              padding: "1.25rem",
              display: "flex",
              justifyContent: "space-around",
              flexWrap: "wrap",
              gap: "1.25rem",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ background: "#dcfce7", padding: "0.5rem", borderRadius: "10px" }}>
                <Cpu size={22} color="#15803d" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>1. AI Vision Diagnosis</div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Instant plant disease & nutrient scan</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ background: "#e0f2fe", padding: "0.5rem", borderRadius: "10px" }}>
                <Layers size={22} color="#0284c7" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>2. Multi-Dealer Quotes</div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Compare 3+ local dealers transparently</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ background: "#fef3c7", padding: "0.5rem", borderRadius: "10px" }}>
                <Truck size={22} color="#d97706" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>3. Doorstep Delivery</div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Delivery tracking to your farm gate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Role Selection Cards Section */}
      <section className="container" style={{ marginTop: "1rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.8rem", color: "#14532d" }}>
            {t("selectRolePrompt")}
          </h2>
          <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
            Each stakeholder in Natrampalli has a specialized, tailored workspace.
          </p>
        </div>

        <div className="grid-responsive-cards">
          {/* Card 1: Farmer */}
          <div
            className="card"
            style={{
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderTop: "5px solid #16a34a",
              position: "relative",
            }}
          >
            <div>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  background: "#dcfce7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <Sprout size={28} color="#15803d" />
              </div>

              <span className="badge badge-success" style={{ marginBottom: "0.5rem" }}>
                Role 1: Primary Producer
              </span>

              <h3 style={{ fontSize: "1.3rem", color: "#0f291e", marginBottom: "0.5rem" }}>
                {t("farmer")}
              </h3>

              <p style={{ fontSize: "0.88rem", color: "#64748b", lineHeight: 1.5, marginBottom: "1rem" }}>
                Upload photos of affected crops, receive preliminary AI diagnosis, compare quotes from local Natrampalli dealers, order with doorstep delivery, sell harvest, and book machinery.
              </p>

              <ul style={{ fontSize: "0.82rem", color: "#334155", display: "flex", flexDirection: "column", gap: "0.4rem", paddingLeft: "1.1rem" }}>
                <li>AI Plant Doctor with TNAU guidance</li>
                <li>Compare Dealer A, B, C prices side-by-side</li>
                <li>Track fertilizer delivery to farm gate</li>
                <li>Direct crop selling & tractor rental</li>
              </ul>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem" }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => handleQuickDemoLogin("farmer")}
              >
                Demo as Farmer
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleRoleCardClick("farmer")}
              >
                Register
              </button>
            </div>
          </div>

          {/* Card 2: Dealer */}
          <div
            className="card"
            style={{
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderTop: "5px solid #0284c7",
            }}
          >
            <div>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  background: "#e0f2fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <Store size={28} color="#0284c7" />
              </div>

              <span className="badge badge-info" style={{ marginBottom: "0.5rem" }}>
                Role 2: Agri Retailer & Depot
              </span>

              <h3 style={{ fontSize: "1.3rem", color: "#0f291e", marginBottom: "0.5rem" }}>
                {t("dealer")}
              </h3>

              <p style={{ fontSize: "0.88rem", color: "#64748b", lineHeight: 1.5, marginBottom: "1rem" }}>
                Receive farmer plant disease requests in Natrampalli, review photos, submit independent agricultural assessments and multi-product quotations, and dispatch doorstep deliveries.
              </p>

              <ul style={{ fontSize: "0.82rem", color: "#334155", display: "flex", flexDirection: "column", gap: "0.4rem", paddingLeft: "1.1rem" }}>
                <li>Verified pesticide & fertilizer dealer status</li>
                <li>Custom quotation builder with safety instructions</li>
                <li>Doorstep dispatch & status updater</li>
                <li>Inventory and price management</li>
              </ul>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem" }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1, background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)" }}
                onClick={() => handleQuickDemoLogin("dealer")}
              >
                Demo as Dealer
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleRoleCardClick("dealer")}
              >
                Register
              </button>
            </div>
          </div>

          {/* Card 3: Buyer */}
          <div
            className="card"
            style={{
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderTop: "5px solid #f59e0b",
            }}
          >
            <div>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  background: "#fef3c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <ShoppingBag size={28} color="#d97706" />
              </div>

              <span className="badge badge-warning" style={{ marginBottom: "0.5rem" }}>
                Role 3: Wholesaler & Trader
              </span>

              <h3 style={{ fontSize: "1.3rem", color: "#0f291e", marginBottom: "0.5rem" }}>
                {t("buyer")}
              </h3>

              <p style={{ fontSize: "0.88rem", color: "#64748b", lineHeight: 1.5, marginBottom: "1rem" }}>
                Directly source fresh farm produce from Natrampalli farmers. Filter crops by variety, quantity, village, submit purchase offers, and negotiate transparently.
              </p>

              <ul style={{ fontSize: "0.82rem", color: "#334155", display: "flex", flexDirection: "column", gap: "0.4rem", paddingLeft: "1.1rem" }}>
                <li>Direct farm gate harvest purchasing</li>
                <li>Browse Tomato, Paddy, Groundnut, etc.</li>
                <li>Submit official purchase offers & negotiate</li>
                <li>No middlemen commission leakage</li>
              </ul>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem" }}>
              <button
                className="btn btn-accent"
                style={{ flex: 1 }}
                onClick={() => handleQuickDemoLogin("buyer")}
              >
                Demo as Buyer
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleRoleCardClick("buyer")}
              >
                Register
              </button>
            </div>
          </div>

          {/* Card 4: Machinery Owner */}
          <div
            className="card"
            style={{
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              borderTop: "5px solid #8b5cf6",
            }}
          >
            <div>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  background: "#ede9fe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <Truck size={28} color="#7c3aed" />
              </div>

              <span className="badge" style={{ background: "#ede9fe", color: "#6d28d9", border: "1px solid #ddd6fe", marginBottom: "0.5rem" }}>
                Role 4: Mechanization Provider
              </span>

              <h3 style={{ fontSize: "1.3rem", color: "#0f291e", marginBottom: "0.5rem" }}>
                {t("machinery_owner")}
              </h3>

              <p style={{ fontSize: "0.88rem", color: "#64748b", lineHeight: 1.5, marginBottom: "1rem" }}>
                List your tractors, rotavators, harvesters, and sprayers for rental. Receive booking requests from nearby farmers and prevent double bookings.
              </p>

              <ul style={{ fontSize: "0.82rem", color: "#334155", display: "flex", flexDirection: "column", gap: "0.4rem", paddingLeft: "1.1rem" }}>
                <li>Hourly & daily rental rate listing</li>
                <li>Service area coverage in Natrampalli</li>
                <li>Automated overlap booking prevention</li>
                <li>Rental earnings and customer tracking</li>
              </ul>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem" }}>
              <button
                className="btn"
                style={{ flex: 1, background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", color: "#ffffff" }}
                onClick={() => handleQuickDemoLogin("machinery_owner")}
              >
                Demo as Owner
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleRoleCardClick("machinery_owner")}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
