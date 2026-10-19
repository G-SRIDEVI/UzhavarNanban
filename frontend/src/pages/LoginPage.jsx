import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Lock, Phone, ArrowRight, Sparkles, UserCheck } from "lucide-react";

export const LoginPage = ({ setActiveTab }) => {
  const { login, demoAccounts, quickLoginAs } = useAuth();
  const { language, t } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;
    setLoading(true);
    try {
      const res = await login(identifier, password);
      // Route to role-specific dashboard
      if (res.user.role === "farmer") setActiveTab("home");
      else if (res.user.role === "dealer") setActiveTab("dealer_dashboard");
      else if (res.user.role === "buyer") setActiveTab("buyer_dashboard");
      else if (res.user.role === "machinery_owner") setActiveTab("machinery_dashboard");
    } catch (err) {
      // Error handled by AuthContext toast
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (acc) => {
    await quickLoginAs(acc);
    if (acc.role === "farmer") setActiveTab("home");
    else if (acc.role === "dealer") setActiveTab("dealer_dashboard");
    else if (acc.role === "buyer") setActiveTab("buyer_dashboard");
    else if (acc.role === "machinery_owner") setActiveTab("machinery_dashboard");
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: "480px", margin: "2.5rem auto" }}>
      <div className="card" style={{ padding: "2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.25rem" }}>🌱</div>
          <h2 style={{ fontSize: "1.6rem", color: "#14532d" }}>
            {language === "ta" ? "உழவர் நண்பனில் உள்நுழைக" : "Sign in to UzhavarNanban"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.25rem" }}>
            Natrampalli Block Agricultural Portal
          </p>
        </div>

        {/* 1-Click Demo Accounts Quick Selector */}
        <div
          style={{
            background: "#f0fdf4",
            border: "1px dashed #86efac",
            borderRadius: "12px",
            padding: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, fontSize: "0.85rem", color: "#166534", marginBottom: "0.6rem" }}>
            <Sparkles size={16} color="#16a34a" /> 1-Click Demo Login (பரிசோதனைக்கு):
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {demoAccounts.map((acc) => (
              <button
                key={acc.mobile}
                type="button"
                onClick={() => handleQuick(acc)}
                className="btn btn-secondary btn-sm"
                style={{
                  justifyContent: "space-between",
                  background: "#ffffff",
                  fontSize: "0.8rem",
                  padding: "0.4rem 0.75rem",
                }}
              >
                <span style={{ fontWeight: 600 }}>{acc.tag || acc.name}</span>
                <span style={{ color: "#16a34a", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                  Login <ArrowRight size={12} />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Phone size={14} /> Mobile Number or Email (அலைபேசி எண்)
              </span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 9876543210 or farmer@uzhavar.in"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Lock size={14} /> Password (கடவுச்சொல்)
              </span>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "1rem", padding: "0.8rem" }}
            disabled={loading}
          >
            {loading ? "Verifying..." : t("login")}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.85rem", color: "#64748b" }}>
          Don't have an account?{" "}
          <button
            onClick={() => setActiveTab("register")}
            style={{
              background: "transparent",
              border: "none",
              color: "#16a34a",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {t("register")}
          </button>
        </div>
      </div>
    </div>
  );
};
