import React from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { RoleBadge } from "./RoleBadge";
import {
  Sprout,
  LogOut,
  Globe,
  Sparkles,
  ShoppingBag,
  Truck,
  CloudSun,
  TrendingUp,
  FileText,
  User,
  ShieldCheck,
} from "lucide-react";

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout, demoAccounts, quickLoginAs } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="app-header">
      {/* Top micro banner for Natrampalli Block and Demo Switcher */}
      <div
        style={{
          background: "linear-gradient(90deg, #14532d 0%, #15803d 100%)",
          color: "#ffffff",
          padding: "0.4rem 1.25rem",
          fontSize: "0.8rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1rem" }}>📍</span>
          <span style={{ fontWeight: 600 }}>{t("blockBadge")}</span>
          <span
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              padding: "0.15rem 0.5rem",
              borderRadius: "4px",
              fontSize: "0.72rem",
            }}
          >
            Software-Only Platform • No IoT Required
          </span>
        </div>

        {/* Quick Demo Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ opacity: 0.9, fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Sparkles size={13} color="#fde047" /> {t("quickDemo")}:
          </span>
          {demoAccounts.slice(0, 4).map((acc) => (
            <button
              key={acc.role + acc.tag}
              onClick={() => quickLoginAs(acc)}
              style={{
                background: user?.role === acc.role ? "#fde047" : "rgba(255, 255, 255, 0.15)",
                color: user?.role === acc.role ? "#14532d" : "#ffffff",
                border: "none",
                borderRadius: "4px",
                padding: "0.2rem 0.45rem",
                fontSize: "0.72rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              title={`Switch to ${acc.name} (${acc.role})`}
            >
              {acc.tag || acc.role}
            </button>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="header-container">
        {/* Brand */}
        <div
          onClick={() => setActiveTab("home")}
          style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 10px rgba(34, 197, 94, 0.3)",
            }}
          >
            <Sprout size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: "1.3rem",
                  color: "#14532d",
                  lineHeight: 1.1,
                }}
              >
                {t("appName")}
              </span>
              <span style={{ fontSize: "1.1rem" }}>🌱</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
              {language === "ta" ? "உழவர் நண்பன் - நாட்ராம்பள்ளி" : "Farmer's True Friend"}
            </div>
          </div>
        </div>

        {/* Center Navigation Links based on role */}
        {user && (
          <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {user.role === "farmer" && (
              <>
                <button
                  className={`btn btn-sm ${activeTab === "home" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveTab("home")}
                >
                  {t("home")}
                </button>
                <button
                  className={`btn btn-sm ${activeTab === "ai_doctor" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveTab("ai_doctor")}
                >
                  <Sparkles size={14} color="#f59e0b" /> {t("aiDoctor")}
                </button>
                <button
                  className={`btn btn-sm ${activeTab === "compare_quotes" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveTab("compare_quotes")}
                >
                  {t("compareQuotes")}
                </button>
                <button
                  className={`btn btn-sm ${activeTab === "my_orders" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveTab("my_orders")}
                >
                  {t("trackDeliveries")}
                </button>
                <button
                  className={`btn btn-sm ${activeTab === "crop_market" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveTab("crop_market")}
                >
                  <ShoppingBag size={14} /> {t("cropMarket")}
                </button>
                <button
                  className={`btn btn-sm ${activeTab === "machinery" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveTab("machinery")}
                >
                  <Truck size={14} /> {t("machinery")}
                </button>
              </>
            )}

            {user.role === "dealer" && (
              <>
                <button
                  className={`btn btn-sm ${activeTab === "dealer_dashboard" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveTab("dealer_dashboard")}
                >
                  {t("home")} / Dashboard
                </button>
                <button
                  className={`btn btn-sm ${activeTab === "dealer_requests" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveTab("dealer_requests")}
                >
                  <Sprout size={14} /> Incoming Requests
                </button>
                <button
                  className={`btn btn-sm ${activeTab === "dealer_orders" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveTab("dealer_orders")}
                >
                  <Truck size={14} /> Deliveries & Orders
                </button>
                <button
                  className={`btn btn-sm ${activeTab === "dealer_inventory" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveTab("dealer_inventory")}
                >
                  Products & Stock
                </button>
              </>
            )}

            {user.role === "buyer" && (
              <>
                <button
                  className={`btn btn-sm ${activeTab === "buyer_dashboard" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveTab("buyer_dashboard")}
                >
                  Browse Produce Market
                </button>
                <button
                  className={`btn btn-sm ${activeTab === "buyer_offers" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveTab("buyer_offers")}
                >
                  My Purchase Offers
                </button>
              </>
            )}

            {user.role === "machinery_owner" && (
              <>
                <button
                  className={`btn btn-sm ${activeTab === "machinery_dashboard" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveTab("machinery_dashboard")}
                >
                  My Machinery Fleet
                </button>
                <button
                  className={`btn btn-sm ${activeTab === "machinery_bookings" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveTab("machinery_bookings")}
                >
                  Booking Requests
                </button>
              </>
            )}

            {/* Advisory Utilities */}
            <button
              className={`btn btn-sm ${activeTab === "advisory" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("advisory")}
              title="Weather, Mandi Prices & Schemes"
            >
              <CloudSun size={14} /> Advisory & Mandi
            </button>
          </nav>
        )}

        {/* Right controls: Language Toggle & User Profile / Login */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 700, padding: "0.35rem 0.75rem" }}
            title="Switch Language (தமிழ் / English)"
          >
            <Globe size={14} color="#15803d" />
            {language === "ta" ? "English" : "தமிழ்"}
          </button>

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>
                  {user.name.split(" ")[0]}
                </span>
                <RoleBadge role={user.role} />
              </div>
              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
                style={{ color: "#ef4444" }}
                title="Log Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab("login")}
              >
                {t("login")}
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab("register")}
              >
                {t("register")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
