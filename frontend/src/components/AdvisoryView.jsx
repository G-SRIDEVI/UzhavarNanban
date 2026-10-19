import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import {
  CloudSun,
  TrendingUp,
  Award,
  ExternalLink,
  Droplets,
  Wind,
  CheckCircle,
  AlertTriangle,
  FileText,
} from "lucide-react";

export const AdvisoryView = () => {
  const { language } = useLanguage();
  const [marketPrices, setMarketPrices] = useState(null);
  const [weather, setWeather] = useState(null);
  const [schemes, setSchemes] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvisory = async () => {
      try {
        const [mRes, wRes, sRes] = await Promise.all([
          api.getMarketPrices(),
          api.getWeather(),
          api.getSchemes(),
        ]);
        setMarketPrices(mRes);
        setWeather(wRes);
        setSchemes(sRes);
      } catch (err) {
        console.error("Error loading advisory data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisory();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
        Loading Natrampalli agricultural advisory, weather and mandi prices...
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      {/* Title Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <h2 style={{ fontSize: "1.8rem", color: "#14532d" }}>
            {language === "ta" ? "வேளாண் ஆலோசனை மற்றும் சந்தை நிலவரம்" : "Agricultural Advisory & Market Insights"}
          </h2>
          <span className="badge badge-success">Natrampalli Block</span>
        </div>
        <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
          {language === "ta"
            ? "நாட்ராம்பள்ளி வட்டார வானிலை, மருந்து தெளிப்பு உகந்த நேரம், திருப்பத்தூர் மண்டி விலைகள் மற்றும் அரசு மானியங்கள்."
            : "Verified meteorological spray advisories, regulated mandi rates, and official government welfare schemes."}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem" }}>
        {/* Weather & Spray Suitability Card */}
        {weather && (
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CloudSun size={24} color="#0284c7" />
                <h3 style={{ fontSize: "1.2rem" }}>
                  {language === "ta" ? "வானிலை & தெளிப்பு ஆலோசனை" : "Weather & Spray Advisory"}
                </h3>
              </div>
              <span className="badge badge-info">{weather.current.temperature_c}°C</span>
            </div>

            <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "12px", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "1.05rem" }}>
                {language === "ta" ? weather.current.condition_tamil : weather.current.condition}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.2rem" }}>
                📍 {weather.location}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "#334155" }}>
                  <Droplets size={16} color="#0284c7" />
                  <span>Humidity: <strong>{weather.current.humidity_percent}%</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "#334155" }}>
                  <Wind size={16} color="#10b981" />
                  <span>Wind: <strong>{weather.current.wind_speed_kmh} km/h</strong></span>
                </div>
              </div>
            </div>

            {/* Spray Suitability Box */}
            <div
              style={{
                background: weather.spray_advisory.is_safe_to_spray ? "#ecfdf5" : "#fef2f2",
                border: `1.5px solid ${weather.spray_advisory.is_safe_to_spray ? "#10b981" : "#ef4444"}`,
                borderRadius: "12px",
                padding: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: weather.spray_advisory.is_safe_to_spray ? "#047857" : "#b91c1c" }}>
                {weather.spray_advisory.is_safe_to_spray ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                <span>{weather.spray_advisory.suitability}</span>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#334155", marginTop: "0.4rem", lineHeight: 1.4 }}>
                {weather.spray_advisory.recommendation}
              </p>
            </div>
          </div>
        )}

        {/* Mandi Market Prices */}
        {marketPrices && (
          <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <TrendingUp size={24} color="#16a34a" />
                <h3 style={{ fontSize: "1.2rem" }}>
                  {language === "ta" ? "மண்டி சந்தை நிலவரம்" : "Local Mandi Prices"}
                </h3>
              </div>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{marketPrices.updated_at}</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "360px", overflowY: "auto" }}>
              {marketPrices.prices.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem 1rem",
                    background: "#ffffff",
                    borderRadius: "10px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#0f172a" }}>
                      {p.crop}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {p.market} • {p.variety}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#15803d" }}>
                      ₹{p.modal_price}
                      <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 400 }}>/{p.unit}</span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: p.trend === "up" ? "#16a34a" : p.trend === "down" ? "#dc2626" : "#64748b",
                        fontWeight: 600,
                      }}
                    >
                      {p.trend_percent}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "0.75rem", fontSize: "0.72rem", color: "#94a3b8", textAlign: "right" }}>
              Source: {marketPrices.source}
            </div>
          </div>
        )}
      </div>

      {/* Tamil Nadu Government Schemes */}
      <div style={{ marginTop: "2.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <Award size={24} color="#d97706" />
          <h3 style={{ fontSize: "1.4rem", color: "#14532d" }}>
            {language === "ta" ? "தமிழக அரசு வேளாண் நலத்திட்டங்கள் & மானியங்கள்" : "Tamil Nadu Agricultural Welfare Schemes & Subsidies"}
          </h3>
        </div>

        <div className="grid-responsive-cards">
          {schemes.map((s) => (
            <div
              key={s.id}
              className="card"
              style={{
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderTop: "4px solid #16a34a",
              }}
            >
              <div>
                <span className="badge badge-warning" style={{ marginBottom: "0.5rem" }}>
                  {s.category}
                </span>
                <h4 style={{ fontSize: "1.05rem", color: "#0f291e", marginBottom: "0.5rem" }}>
                  {language === "ta" ? s.tamil_title : s.title}
                </h4>
                <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.4, marginBottom: "0.75rem" }}>
                  {s.subsidy_details}
                </p>

                <div style={{ background: "#f8fafc", padding: "0.6rem 0.8rem", borderRadius: "8px", fontSize: "0.8rem", color: "#334155" }}>
                  <strong>Eligibility:</strong> {s.eligibility}
                </div>
              </div>

              <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <a
                  href={s.official_portal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ gap: "0.3rem" }}
                >
                  Official Portal <ExternalLink size={12} />
                </a>
                <button
                  onClick={() => setSelectedScheme(s)}
                  className="btn btn-secondary btn-sm"
                >
                  <FileText size={12} /> Documents Checklist
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheme Documents Modal */}
      {selectedScheme && (
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
          onClick={() => setSelectedScheme(null)}
        >
          <div
            className="card"
            style={{ maxWidth: "500px", width: "100%", padding: "1.75rem", background: "#ffffff" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem", color: "#14532d" }}>
              {selectedScheme.title}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
              {selectedScheme.department}
            </p>

            <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.6rem" }}>
              Required Documents for Application (தேவையான ஆவணங்கள்):
            </div>
            <ul style={{ paddingLeft: "1.25rem", color: "#334155", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {selectedScheme.documents_needed.map((doc, i) => (
                <li key={i}>{doc}</li>
              ))}
            </ul>

            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-primary btn-sm" onClick={() => setSelectedScheme(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
