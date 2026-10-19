import React, { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import {
  Tractor,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Phone,
} from "lucide-react";

export const RentMachineryPage = () => {
  const { language, t } = useLanguage();
  const toast = useToast();

  const [machineryList, setMachineryList] = useState([]);
  const [filterType, setFilterType] = useState("All");
  const [myBookings, setMyBookings] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [startDate, setStartDate] = useState("2026-10-25");
  const [endDate, setEndDate] = useState("2026-10-25");
  const [durationUnits, setDurationUnits] = useState(3);
  const [rateType, setRateType] = useState("hourly");
  const [farmLocation, setFarmLocation] = useState("Survey No 142, Natrampalli Pudur");
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchMachinery = async () => {
    try {
      const [mList, bList] = await Promise.all([
        api.browseMachinery({ equipment_type: filterType === "All" ? "" : filterType }),
        api.getFarmerBookings(),
      ]);
      setMachineryList(mList);
      setMyBookings(bList);
    } catch (err) {
      console.error("Failed to load machinery", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachinery();
  }, [filterType]);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMachine) return;
    setBookingLoading(true);

    try {
      await api.bookMachinery(selectedMachine.id, {
        start_date: startDate,
        end_date: endDate,
        duration_units: parseInt(durationUnits),
        rate_type: rateType,
        farm_location: farmLocation,
      });

      toast.success(
        `Booking request sent to ${selectedMachine.owner_name} for ${selectedMachine.equipment_name}!`
      );
      setSelectedMachine(null);
      fetchMachinery();
    } catch (err) {
      toast.error(err.message || "Failed to book machinery");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: "4rem" }}>
      {/* Title */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.8rem", color: "#14532d", fontWeight: 800 }}>
          {language === "ta" ? "பண்ணை இயந்திரங்கள் வாடகை சேவை" : "Agricultural Machinery Rental"}
        </h2>
        <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
          Rent high-power tractors, rotavators, paddy harvesters, and sprayers with verified operators in Natrampalli.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", marginBottom: "1.75rem", paddingBottom: "0.5rem" }}>
        {["All", "Tractor", "Harvester", "Sprayer"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`btn btn-sm ${filterType === type ? "btn-primary" : "btn-secondary"}`}
          >
            {type === "All" ? "All Equipment" : type}
          </button>
        ))}
      </div>

      {/* Machinery Cards Grid */}
      <div className="grid-responsive-cards" style={{ marginBottom: "3rem" }}>
        {machineryList.map((m) => (
          <div
            key={m.id}
            className="card"
            style={{
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <span className="badge" style={{ background: "#ede9fe", color: "#6d28d9" }}>
                  {m.equipment_type}
                </span>
                <span className="badge badge-success">Available</span>
              </div>

              <h3 style={{ fontSize: "1.2rem", color: "#0f291e", fontWeight: 700, marginBottom: "0.3rem" }}>
                {m.equipment_name}
              </h3>
              <div style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: "0.75rem" }}>
                {m.brand_model}
              </div>

              {/* Rates */}
              <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "10px", marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                  <span style={{ color: "#64748b" }}>Hourly Rate:</span>
                  <span style={{ fontWeight: 700, color: "#15803d" }}>₹{m.hourly_rate || "N/A"}/hr</span>
                </div>
                {m.daily_rate && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginTop: "0.3rem" }}>
                    <span style={{ color: "#64748b" }}>Daily Rate:</span>
                    <span style={{ fontWeight: 600, color: "#0f172a" }}>₹{m.daily_rate}/day</span>
                  </div>
                )}
              </div>

              <div style={{ fontSize: "0.8rem", color: "#475569", display: "flex", flexDirection: "column", gap: "0.3rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <MapPin size={13} color="#0284c7" />
                  <span>Coverage: {m.service_area}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Phone size={13} color="#15803d" />
                  <span>Owner: {m.owner_name} ({m.owner_mobile})</span>
                </div>
                {m.booking_conditions && (
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontStyle: "italic", marginTop: "0.2rem" }}>
                    * {m.booking_conditions}
                  </div>
                )}
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => setSelectedMachine(m)}
            >
              Book Equipment
            </button>
          </div>
        ))}
      </div>

      {/* Farmer's Existing Bookings */}
      {myBookings.length > 0 && (
        <div className="card" style={{ padding: "1.75rem" }}>
          <h3 style={{ fontSize: "1.25rem", color: "#14532d", fontWeight: 700, marginBottom: "1rem" }}>
            Your Machinery Bookings ({myBookings.length})
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {myBookings.map((b) => (
              <div
                key={b.id}
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
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}>
                    {b.equipment_name}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
                    Date: <strong>{b.start_date}</strong> • Duration: {b.duration_units} {b.rate_type}s • Farm: {b.farm_location}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                    Owner: {b.owner_name} ({b.owner_mobile})
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#15803d" }}>
                    ₹{b.total_amount}
                  </div>
                  <span
                    className={`badge ${
                      b.status === "accepted"
                        ? "badge-success"
                        : b.status === "pending"
                        ? "badge-warning"
                        : "badge-neutral"
                    }`}
                  >
                    Booking {b.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {selectedMachine && (
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
          onClick={() => setSelectedMachine(null)}
        >
          <div
            className="card"
            style={{ maxWidth: "500px", width: "100%", padding: "2rem", background: "#ffffff" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "1.3rem", color: "#14532d", fontWeight: 700, marginBottom: "0.25rem" }}>
              Book {selectedMachine.equipment_name}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1.25rem" }}>
              Owner: {selectedMachine.owner_name} • Coverage: {selectedMachine.service_area}
            </p>

            <form onSubmit={handleBookSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Booking Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setEndDate(e.target.value);
                    }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rate Type</label>
                  <select
                    className="form-select"
                    value={rateType}
                    onChange={(e) => setRateType(e.target.value)}
                  >
                    <option value="hourly">Hourly (₹{selectedMachine.hourly_rate}/hr)</option>
                    {selectedMachine.daily_rate && (
                      <option value="daily">Daily (₹{selectedMachine.daily_rate}/day)</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Duration ({rateType === "hourly" ? "Hours" : "Days"})</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  className="form-input"
                  value={durationUnits}
                  onChange={(e) => setDurationUnits(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Farm Land Location (நில விவரம்) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Survey No 142, Natrampalli Pudur"
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
                  required
                />
              </div>

              {/* Total Calculation */}
              <div style={{ background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "10px", margin: "1rem 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.9rem", color: "#475569" }}>Estimated Rental Total:</span>
                <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#15803d" }}>
                  ₹
                  {rateType === "daily" && selectedMachine.daily_rate
                    ? selectedMachine.daily_rate * durationUnits
                    : (selectedMachine.hourly_rate || 950) * durationUnits}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedMachine(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? "Confirming..." : "Send Booking Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
