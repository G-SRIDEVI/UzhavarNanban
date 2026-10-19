import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { api } from "../../services/api";
import {
  Sparkles,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  FileText,
  Activity,
  Droplet,
} from "lucide-react";

export const PlantDoctorPage = ({ setActiveTab, setSelectedRequestId }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [cropName, setCropName] = useState("Tomato (தக்காளி)");
  const [affectedPart, setAffectedPart] = useState("Leaf");
  const [symptomsDesc, setSymptomsDesc] = useState("");
  const [village, setVillage] = useState(user?.farmer_profile?.village || "Natrampalli Pudur");
  const [deliveryAddress, setDeliveryAddress] = useState(user?.farmer_profile?.delivery_address || "Natrampalli Pudur, Tirupattur District");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);

  const sampleSymptoms = [
    { label: "Dark water-soaked brown spots (கரும் புள்ளிகள்)", val: "Water soaked dark brown spots spreading on foliage after rains." },
    { label: "Yellow leaves / Chlorosis (மஞ்சள் இலைகள்)", val: "Lower leaves turning uniformly pale yellow, light green stunted stems." },
    { label: "Powdery white mildew (வெண் தூள் பூஞ்சை)", val: "White powdery patches on both leaf surfaces with leaf curling." },
    { label: "Wilting & drooping leaves (வாடல் நோய்)", val: "Sudden wilting of healthy plants despite moist soil, stem discoloration." },
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptomsDesc) {
      toast.error("Please describe the visible symptoms");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("crop_name", cropName);
    formData.append("symptoms_description", symptomsDesc);
    formData.append("affected_part", affectedPart);
    formData.append("village", village);
    formData.append("delivery_address", deliveryAddress);
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      const res = await api.createDiseaseRequest(formData);
      setDiagnosisResult(res);
      setStep(3); // Result view
      toast.success("AI Analysis Complete & Dealers Notified in Natrampalli!");
    } catch (err) {
      toast.error(err.message || "Failed to submit disease assessment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: "800px", paddingBottom: "3rem" }}>
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            background: "#dcfce7",
            color: "#15803d",
            padding: "0.3rem 0.85rem",
            borderRadius: "9999px",
            fontSize: "0.8rem",
            fontWeight: 700,
            marginBottom: "0.6rem",
          }}
        >
          <Sparkles size={15} color="#15803d" /> AI Plant Doctor • TNAU Agronomy Engine
        </div>
        <h2 style={{ fontSize: "2rem", color: "#14532d", fontWeight: 800 }}>
          {language === "ta" ? "AI தாவர மருத்துவர் பரிசோதனை" : "AI Plant Doctor Diagnosis"}
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.95rem", maxWidth: "600px", margin: "0.25rem auto 0 auto" }}>
          {language === "ta"
            ? "பாதிக்கப்பட்ட பயிரின் புகைப்படத்தை பதிவேற்றுங்கள். உடனடி AI ஆய்வு மற்றும் நாட்ராம்பள்ளி வட்டார உரக்கடைகளின் விலைப்புள்ளிகளை பெறுங்கள்."
            : "Upload plant photographs to distinguish fungal/bacterial diseases from nutrient deficiencies, and receive quotations from local Natrampalli dealers."}
        </p>
      </div>

      {step < 3 ? (
        <div className="card" style={{ padding: "2rem" }}>
          <form onSubmit={handleSubmit}>
            {/* Step 1: Crop & Affected Part */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#14532d", marginBottom: "0.75rem" }}>
                Step 1: Select Your Crop & Affected Plant Part (பயிர் விவரம்)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Crop Name (பயிர்)</label>
                  <select
                    className="form-select"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                  >
                    <option value="Tomato (தக்காளி)">Tomato (தக்காளி)</option>
                    <option value="Paddy / Rice (நெல்)">Paddy / Rice (நெல்)</option>
                    <option value="Groundnut (நிலக்கடலை)">Groundnut (நிலக்கடலை)</option>
                    <option value="Brinjal / Eggplant (கத்தரிக்காய்)">Brinjal (கத்தரிக்காய்)</option>
                    <option value="Chilli (மிளகாய்)">Chilli (மிளகாய்)</option>
                    <option value="Cotton (பருத்தி)">Cotton (பருத்தி)</option>
                    <option value="Banana (வாழை)">Banana (வாழை)</option>
                    <option value="Coconut (தென்னை)">Coconut (தென்னை)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Affected Plant Part (பாதிக்கப்பட்ட பாகம்)</label>
                  <select
                    className="form-select"
                    value={affectedPart}
                    onChange={(e) => setAffectedPart(e.target.value)}
                  >
                    <option value="Leaf">Leaf (இலைகள்)</option>
                    <option value="Stem">Stem / Twig (தண்டு)</option>
                    <option value="Fruit">Fruit / Pod (காய் / கனி)</option>
                    <option value="Root">Root / Collar (வேர்)</option>
                    <option value="Whole Plant">Whole Plant (முழு செடி)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Upload Photo */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#14532d", marginBottom: "0.75rem" }}>
                Step 2: Upload Photograph of Affected Foliage (புகைப்படம்)
              </div>

              <div
                style={{
                  border: "2px dashed #cbd5e1",
                  borderRadius: "14px",
                  padding: "1.5rem",
                  textAlign: "center",
                  background: "#f8fafc",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => document.getElementById("plantPhotoInput").click()}
              >
                <input
                  id="plantPhotoInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />

                {previewUrl ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                    <img
                      src={previewUrl}
                      alt="Plant Preview"
                      style={{
                        maxHeight: "220px",
                        maxWidth: "100%",
                        borderRadius: "10px",
                        objectFit: "cover",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <span style={{ fontSize: "0.85rem", color: "#15803d", fontWeight: 600 }}>
                      ✓ Photo loaded: {selectedFile?.name}. Click to change.
                    </span>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ background: "#dcfce7", padding: "0.75rem", borderRadius: "50%" }}>
                      <Camera size={28} color="#15803d" />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#1e293b" }}>
                      Tap to upload or take a clear photo of the diseased leaf/plant
                    </div>
                    <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                      Supports JPEG, PNG, WebP • High resolution leaf close-up recommended
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Describe Symptoms */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#14532d", marginBottom: "0.5rem" }}>
                Step 3: Describe Visible Symptoms (அறிகுறிகள்) *
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.78rem", color: "#64748b", alignSelf: "center" }}>Quick symptoms:</span>
                {sampleSymptoms.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSymptomsDesc((prev) => (prev ? `${prev} ${s.val}` : s.val))}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.6rem" }}
                  >
                    + {s.label}
                  </button>
                ))}
              </div>

              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Dark water-soaked brown spots rapidly spreading on tomato leaves with slight white powder underneath. Lower leaves turning yellow and dropping after recent cloudy drizzle."
                value={symptomsDesc}
                onChange={(e) => setSymptomsDesc(e.target.value)}
                required
              />
            </div>

            {/* Step 4: Village & Doorstep Delivery Address */}
            <div style={{ marginBottom: "1.75rem", background: "#f8fafc", padding: "1rem", borderRadius: "12px" }}>
              <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#14532d", marginBottom: "0.75rem" }}>
                Step 4: Natrampalli Location & Delivery Address (டெலிவரி முகவரி)
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Village (கிராமம்)</label>
                  <select
                    className="form-select"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                  >
                    <option value="Natrampalli Town">Natrampalli Town</option>
                    <option value="Natrampalli Pudur">Natrampalli Pudur</option>
                    <option value="Pachur">Pachur</option>
                    <option value="Velakalnatham">Velakalnatham</option>
                    <option value="Kothur">Kothur</option>
                    <option value="Dasiriyappanur">Dasiriyappanur</option>
                    <option value="Thoppalagunda">Thoppalagunda</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Doorstep Delivery Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", gap: "0.5rem" }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Activity className="animate-spin" size={18} />
                  Running AI Vision & Notifying Natrampalli Dealers...
                </>
              ) : (
                <>
                  <Sparkles size={18} color="#fde047" />
                  Submit Disease Request & Get AI Diagnosis
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Step 3: Diagnosis Result View */
        diagnosisResult && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* AI Diagnosis Card */}
            <div
              className="card"
              style={{
                padding: "2rem",
                borderLeft: "6px solid #16a34a",
                background: "#ffffff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                    <span className="badge badge-success">
                      AI Vision Assessment
                    </span>
                    {diagnosisResult.ai_report?.is_simulated && (
                      <span className="badge badge-warning" title="Clearly labeled demonstration prediction as required">
                        Simulated Demonstration Mode
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: "1.75rem", color: "#14532d", fontWeight: 800 }}>
                    {diagnosisResult.ai_report?.possible_disease}
                  </h3>
                  {diagnosisResult.ai_report?.tamil_name && (
                    <div style={{ fontSize: "1.1rem", color: "#047857", fontWeight: 600 }}>
                      {diagnosisResult.ai_report.tamil_name}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    background: "#ecfdf5",
                    border: "1.5px solid #a7f3d0",
                    padding: "0.75rem 1.25rem",
                    borderRadius: "12px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", color: "#065f46", fontWeight: 600 }}>PREDICTION CONFIDENCE</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#047857" }}>
                    {(diagnosisResult.ai_report?.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Problem Type & Nutrient Distinction */}
              <div
                style={{
                  margin: "1.25rem 0",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  background: "#f0fdf4",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  fontSize: "0.9rem",
                }}
              >
                <Activity size={18} color="#16a34a" />
                <span>
                  Classification: <strong>{diagnosisResult.ai_report?.problem_type}</strong> (Distinguished from abiotic physiological stress)
                </span>
              </div>

              {/* Symptoms Detected */}
              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#334155", marginBottom: "0.3rem" }}>
                  Visible Symptoms Analyzed:
                </div>
                <p style={{ fontSize: "0.9rem", color: "#475569", lineHeight: 1.5 }}>
                  {diagnosisResult.ai_report?.symptoms_detected}
                </p>
              </div>

              {/* Preventive Measures */}
              <div style={{ marginBottom: "1.25rem", background: "#f8fafc", padding: "1rem", borderRadius: "10px" }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#15803d", marginBottom: "0.3rem" }}>
                  TNAU Agronomic Preventive Measures (தடுப்பு முறைகள்):
                </div>
                <p style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.5 }}>
                  {diagnosisResult.ai_report?.preventive_measures}
                </p>
              </div>

              {/* Treatment Guidance */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0369a1", marginBottom: "0.3rem" }}>
                  Recommended Agronomic Next Steps:
                </div>
                <p style={{ fontSize: "0.88rem", color: "#334155", lineHeight: 1.5 }}>
                  {diagnosisResult.ai_report?.recommended_next_steps}
                </p>
              </div>

              {/* Multi-dealer broadcast notification banner */}
              <div
                style={{
                  background: "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)",
                  border: "1.5px solid #7dd3fc",
                  borderRadius: "14px",
                  padding: "1.25rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#0369a1", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Layers size={18} /> Participating Natrampalli Dealers Notified
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#334155", marginTop: "0.25rem" }}>
                    Murugan Agro Agencies, Kaveri Krishi Kendra, and Tirupattur Farmers Depot can now independently inspect your plant photos and submit product quotations.
                  </p>
                </div>

                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => {
                    if (setSelectedRequestId) setSelectedRequestId(diagnosisResult.id);
                    setActiveTab("compare_quotes");
                  }}
                >
                  Compare Dealer Quotations <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Back button */}
            <div style={{ textAlign: "center" }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setStep(1);
                  setDiagnosisResult(null);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
              >
                ← Diagnose Another Plant
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};
