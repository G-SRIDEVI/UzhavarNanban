import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import {
  Tractor,
  Calendar,
  CheckCircle2,
  XCircle,
  Plus,
  Clock,
  MapPin,
  TrendingUp,
  Truck,
  Phone,
  ShieldCheck,
} from "lucide-react";

export const MachineryDashboard = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("bookings"); // 'bookings' or 'equipment'
  const [myMachinery, setMyMachinery] = useState([]);
  const [incomingBookings, setIncomingBookings] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [eqType, setEqType] = useState("Tractor");
  const [eqName, setEqName] = useState("");
  const [brandModel, setBrandModel] = useState("");
  const [hourlyRate, setHourlyRate] = useState("950");
  const [dailyRate, setDailyRate] = useState("7500");
  const [rateType, setRateType] = useState("hourly");
  const [serviceArea, setServiceArea] = useState("Natrampalli, Pachur, Kothur (Radius 15 km)");
  const [bookingConditions, setBookingConditions] = useState("Includes skilled operator and fuel. Minimum 2 hours.");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [mList, bList] = await Promise.all([
        api.getMyMachinery(),
        api.getOwnerBookings(),
      ]);
      setMyMachinery(mList);
      setIncomingBookings(bList);
    } catch (err) {
      console.error("Machinery dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookingStatus = async (bookingId, status) => {
    try {
      await api.updateBookingStatus(bookingId, status);
      toast.success(`Booking request ${status}!`);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to update booking status");
    }
  };

  const handleCreateMachinery = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createMachinery({
        equipment_type: eqType,
        equipment_name: eqName,
        brand_model: brandModel,
        hourly_rate: parseFloat(hourlyRate) || null,
        daily_rate: parseFloat(dailyRate) || null,
        rate_type: rateType,
        service_area: serviceArea,
        booking_conditions: bookingConditions,
      });

      toast.success("Machinery equipment listed successfully!");
      setShowAddModal(false);
      setEqName("");
      setBrandModel("");
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to list equipment");
    } finally {
      setSubmitting(false);
    }
  };

  const totalEarnings = incomingBookings
    .filter((b) => b.status === "accepted" || b.status === "completed")
    .reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0);

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: "4rem" }}>
      {/* Machinery Owner Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: "1.75rem",
          background: "linear-gradient(135deg, rgba(245, 243, 255, 0.9) 0%, rgba(237, 233, 254, 0.7) 100%)",
          border: "1.5px solid #ddd6fe",
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
            <Tractor size={24} color="#7c3aed" />
            <h2 style={{ fontSize: "1.75rem", color: "#0f172a", fontWeight: 800 }}>
              {user?.name || "Gowtham Farm Mechanization"}
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <span className="badge" style={{ background: "#ede9fe", color: "#6d28d9" }}>
              Farm Mechanization Fleet
            </span>
            <span style={{ fontSize: "0.85rem", color: "#475569" }}>
              📍 Base: {user?.machinery_profile?.village || "Thoppalagunda, Natrampalli"}
            </span>
          </div>
        </div>

        {/* Counters */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ background: "#ffffff", padding: "0.75rem 1.25rem", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#7c3aed" }}>{myMachinery.length}</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Equipment</div>
          </div>
          <div style={{ background: "#ffffff", padding: "0.75rem 1.25rem", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0284c7" }}>{incomingBookings.length}</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Bookings</div>
          </div>
          <div style={{ background: "#ffffff", padding: "0.75rem 1.25rem", borderRadius: "10px", textAlign: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#16a34a" }}>₹{totalEarnings}</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>Confirmed Earnings</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1.75rem", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem" }}>
        <button
          className={`btn btn-sm ${activeTab === "bookings" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("bookings")}
        >
          <Calendar size={15} /> Incoming Booking Requests ({incomingBookings.length})
        </button>
        <button
          className={`btn btn-sm ${activeTab === "equipment" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("equipment")}
        >
          <Tractor size={15} /> My Machinery Fleet ({myMachinery.length})
        </button>
      </div>

      {/* TAB 1: Incoming Bookings */}
      {activeTab === "bookings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {incomingBookings.length === 0 ? (
            <div className="card" style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
              No booking requests currently pending.
            </div>
          ) : (
            incomingBookings.map((b) => (
              <div
                key={b.id}
                className="card"
                style={{
                  padding: "1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                    <span className="badge" style={{ background: "#ede9fe", color: "#6d28d9" }}>
                      {b.equipment_name}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                      Date: <strong>{b.start_date}</strong> ({b.duration_units} {b.rate_type}s)
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.2rem", color: "#0f172a", fontWeight: 700 }}>
                    Farmer: {b.farmer_name}
                  </h3>
                  <div style={{ fontSize: "0.85rem", color: "#475569", marginTop: "0.2rem" }}>
                    📍 Farm Location: <strong>{b.farm_location}</strong> • Phone: {b.farmer_mobile}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#15803d" }}>
                      ₹{b.total_amount}
                    </div>
                    <span
                      className={`badge ${
                        b.status === "accepted"
                          ? "badge-success"
                          : b.status === "rejected"
                          ? "badge-neutral"
                          : "badge-warning"
                      }`}
                    >
                      {b.status.toUpperCase()}
                    </span>
                  </div>

                  {b.status === "pending" && (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleBookingStatus(b.id, "accepted")}
                      >
                        <CheckCircle2 size={14} /> Accept
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ color: "#ef4444" }}
                        onClick={() => handleBookingStatus(b.id, "rejected")}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: My Equipment Fleet */}
      {activeTab === "equipment" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <p style={{ color: "#64748b", margin: 0 }}>
              Register your tractors, rotavators, sprayers, and paddy harvesters for farmer rentals.
            </p>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Register New Machinery
            </button>
          </div>

          <div className="grid-responsive-cards">
            {myMachinery.map((m) => (
              <div key={m.id} className="card" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <span className="badge" style={{ background: "#ede9fe", color: "#6d28d9" }}>
                    {m.equipment_type}
                  </span>
                  <span className="badge badge-success">Active</span>
                </div>

                <h3 style={{ fontSize: "1.2rem", color: "#0f172a", fontWeight: 700, marginBottom: "0.2rem" }}>
                  {m.equipment_name}
                </h3>
                <div style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: "0.75rem" }}>
                  {m.brand_model}
                </div>

                <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "10px", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
                    <span style={{ color: "#64748b" }}>Hourly Rate:</span>
                    <span style={{ fontWeight: 700, color: "#15803d" }}>₹{m.hourly_rate}/hr</span>
                  </div>
                  {m.daily_rate && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                      <span style={{ color: "#64748b" }}>Daily Rate:</span>
                      <span style={{ fontWeight: 600 }}>₹{m.daily_rate}/day</span>
                    </div>
                  )}
                </div>

                <div style={{ fontSize: "0.8rem", color: "#475569" }}>
                  Coverage: {m.service_area}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Machinery Modal */}
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
            <h3 style={{ fontSize: "1.3rem", color: "#0f172a", fontWeight: 700, marginBottom: "1rem" }}>
              Register Agricultural Machinery
            </h3>

            <form onSubmit={handleCreateMachinery}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Equipment Type *</label>
                  <select
                    className="form-select"
                    value={eqType}
                    onChange={(e) => setEqType(e.target.value)}
                  >
                    <option value="Tractor">Tractor (டிராக்டர்)</option>
                    <option value="Harvester">Combine Harvester (அறுவடை இயந்திரம்)</option>
                    <option value="Rotavator">Rotavator / Tiller (ரோட்டோவேட்டர்)</option>
                    <option value="Sprayer">Power Sprayer (தெளிப்பான்)</option>
                    <option value="Seed Drill">Seed Drill (விதைப்பான்)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Model / Make</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mahindra 575 DI / Yanmar"
                    value={brandModel}
                    onChange={(e) => setBrandModel(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Equipment Title / Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mahindra 45 HP Tractor with 42-blade Rotavator"
                  value={eqName}
                  onChange={(e) => setEqName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Hourly Rental Rate (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Daily Rental Rate (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Service Area in Natrampalli Block</label>
                <input
                  type="text"
                  className="form-input"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Booking Conditions / Driver Details</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={bookingConditions}
                  onChange={(e) => setBookingConditions(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.25rem" }}>
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
                  {submitting ? "Saving..." : "Save Equipment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
