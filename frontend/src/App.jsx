import React, { useState } from "react";
import { ToastProvider } from "./context/ToastContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { AdvisoryView } from "./components/AdvisoryView";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { FarmerDashboard } from "./pages/Farmer/FarmerDashboard";
import { PlantDoctorPage } from "./pages/Farmer/PlantDoctorPage";
import { QuotationComparePage } from "./pages/Farmer/QuotationComparePage";
import { OrderCheckoutPage } from "./pages/Farmer/OrderCheckoutPage";
import { OrdersTrackingPage } from "./pages/Farmer/OrdersTrackingPage";
import { SellCropPage } from "./pages/Farmer/SellCropPage";
import { RentMachineryPage } from "./pages/Farmer/RentMachineryPage";
import { DealerDashboard } from "./pages/Dealer/DealerDashboard";
import { BuyerDashboard } from "./pages/Buyer/BuyerDashboard";
import { MachineryDashboard } from "./pages/MachineryOwner/MachineryDashboard";

function MainContent() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState("home");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [registerRole, setRegisterRole] = useState("farmer");

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ fontSize: "3rem" }}>🌱</div>
        <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#15803d" }}>
          UzhavarNanban • உழவர்நண்பன்
        </div>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Loading Natrampalli Agricultural Network...</p>
      </div>
    );
  }

  // Routing render
  const renderCurrentView = () => {
    // If not logged in and not on login/register/advisory, show Landing
    if (!user) {
      if (activeTab === "login") return <LoginPage setActiveTab={setActiveTab} />;
      if (activeTab === "register") {
        return (
          <RegisterPage
            setActiveTab={setActiveTab}
            defaultRole={registerRole}
          />
        );
      }
      if (activeTab === "advisory") return <AdvisoryView />;
      return (
        <LandingPage
          setActiveTab={setActiveTab}
          setRegisterRole={setRegisterRole}
        />
      );
    }

    // Role: Farmer
    if (user.role === "farmer") {
      switch (activeTab) {
        case "home":
          return (
            <FarmerDashboard
              setActiveTab={setActiveTab}
              setSelectedRequestId={setSelectedRequestId}
            />
          );
        case "ai_doctor":
          return (
            <PlantDoctorPage
              setActiveTab={setActiveTab}
              setSelectedRequestId={setSelectedRequestId}
            />
          );
        case "compare_quotes":
          return (
            <QuotationComparePage
              setActiveTab={setActiveTab}
              selectedRequestId={selectedRequestId}
              setSelectedQuotation={setSelectedQuotation}
            />
          );
        case "order_checkout":
          return (
            <OrderCheckoutPage
              setActiveTab={setActiveTab}
              selectedQuotation={selectedQuotation}
              setActiveOrderId={setActiveOrderId}
            />
          );
        case "my_orders":
          return <OrdersTrackingPage activeOrderId={activeOrderId} />;
        case "crop_market":
          return <SellCropPage />;
        case "machinery":
          return <RentMachineryPage />;
        case "advisory":
          return <AdvisoryView />;
        default:
          return (
            <FarmerDashboard
              setActiveTab={setActiveTab}
              setSelectedRequestId={setSelectedRequestId}
            />
          );
      }
    }

    // Role: Dealer
    if (user.role === "dealer") {
      if (activeTab === "advisory") return <AdvisoryView />;
      return <DealerDashboard />;
    }

    // Role: Buyer
    if (user.role === "buyer") {
      if (activeTab === "advisory") return <AdvisoryView />;
      return <BuyerDashboard />;
    }

    // Role: Machinery Owner
    if (user.role === "machinery_owner") {
      if (activeTab === "advisory") return <AdvisoryView />;
      return <MachineryDashboard />;
    }

    // Default fallback
    return <LandingPage setActiveTab={setActiveTab} setRegisterRole={setRegisterRole} />;
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ flex: 1 }}>{renderCurrentView()}</main>

      {/* Modern Agricultural Footer */}
      <footer
        style={{
          background: "#0f291e",
          color: "#94a3b8",
          padding: "2rem 1.5rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          fontSize: "0.85rem",
        }}
      >
        <div
          style={{
            maxWidth: "1240px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.25rem",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#ffffff", fontWeight: 700, fontSize: "1.1rem" }}>
              <span>🌱</span> UzhavarNanban • உழவர்நண்பன்
            </div>
            <div style={{ color: "#6ee7b7", fontSize: "0.8rem", marginTop: "0.2rem" }}>
              Connect Farmers. Reduce Costs. Grow Together.
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.2rem" }}>
              Natrampalli Block, Tirupattur District, Tamil Nadu
            </div>
          </div>

          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap", fontSize: "0.8rem" }}>
            <span style={{ color: "#e2e8f0" }}>TNAU Agritech Integration</span>
            <span style={{ color: "#e2e8f0" }}>Multi-Dealer Price Comparison</span>
            <span style={{ color: "#e2e8f0" }}>Verified Pesticide Dealers</span>
            <span style={{ color: "#e2e8f0" }}>Software-Only Architecture</span>
          </div>

          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
            © 2026 UzhavarNanban. Built for Tamil Nadu Farmers.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainContent />
        </AuthProvider>
      </LanguageProvider>
    </ToastProvider>
  );
}
