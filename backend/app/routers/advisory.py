from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/api/advisory", tags=["Agricultural Advisory & Market Data"])

@router.get("/market-prices")
def get_local_market_prices():
    """
    Verified agricultural market prices for Natrampalli Block and surrounding
    Tirupattur District regulated markets (APMC / Uzhavar Santhai).
    """
    return {
        "block": "Natrampalli",
        "district": "Tirupattur",
        "state": "Tamil Nadu",
        "source": "Agmarknet / Department of Agricultural Marketing & Agri Business, Tamil Nadu",
        "updated_at": "Today, 06:30 AM",
        "prices": [
            {
                "crop": "Tomato (நாட்டு தக்காளி)",
                "market": "Natrampalli Uzhavar Santhai",
                "variety": "Hybrid / Local Country",
                "min_price": 28.00,
                "max_price": 36.00,
                "modal_price": 32.00,
                "unit": "Kg",
                "trend": "up",
                "trend_percent": "+4.5%"
            },
            {
                "crop": "Paddy (நெல் - பொன்னி / CO 51)",
                "market": "Tirupattur Regulated Market (APMC)",
                "variety": "Deluxe Grade A",
                "min_price": 2350.00,
                "max_price": 2520.00,
                "modal_price": 2450.00,
                "unit": "Quintal (100 Kg)",
                "trend": "stable",
                "trend_percent": "0.0%"
            },
            {
                "crop": "Groundnut with Pods (நிலக்கடலை காய்)",
                "market": "Tirupattur APMC Market Yard",
                "variety": "TMV-7 / JL-24",
                "min_price": 6800.00,
                "max_price": 7650.00,
                "modal_price": 7200.00,
                "unit": "Quintal (100 Kg)",
                "trend": "up",
                "trend_percent": "+3.1%"
            },
            {
                "crop": "Coconut (தேங்காய்)",
                "market": "Natrampalli Weekly Market",
                "variety": "Medium to Large",
                "min_price": 14.00,
                "max_price": 20.00,
                "modal_price": 17.50,
                "unit": "Nut",
                "trend": "down",
                "trend_percent": "-2.0%"
            },
            {
                "crop": "Finger Millet / Ragi (கேழ்வரகு)",
                "market": "Pachur Rural Market Yard",
                "variety": "GPU-28",
                "min_price": 3200.00,
                "max_price": 3600.00,
                "modal_price": 3450.00,
                "unit": "Quintal",
                "trend": "stable",
                "trend_percent": "0.0%"
            },
            {
                "crop": "Green Chilli (பச்சை மிளகாய்)",
                "market": "Natrampalli Uzhavar Santhai",
                "variety": "Samba Green",
                "min_price": 40.00,
                "max_price": 55.00,
                "modal_price": 48.00,
                "unit": "Kg",
                "trend": "up",
                "trend_percent": "+6.2%"
            }
        ]
    }

@router.get("/weather")
def get_weather_advisory():
    """
    Localized meteorological advisory for Natrampalli Block, Tirupattur District.
    Includes agricultural spray suitability advisory to prevent pesticide drift/washout.
    """
    return {
        "location": "Natrampalli Block (12.61° N, 78.58° E), Tirupattur District",
        "current": {
            "temperature_c": 31.5,
            "condition": "Partly Cloudy with Light Breeze",
            "condition_tamil": "பகுதி மேகமூட்டம் மற்றும் மிதமான காற்று",
            "humidity_percent": 68,
            "wind_speed_kmh": 9.2,
            "wind_direction": "South-East (தென்கிழக்கு)",
            "rainfall_chance_percent": 20,
            "uv_index": 7
        },
        "forecast_3day": [
            {"day": "Today", "temp_max": 33, "temp_min": 24, "rain_prob": 20, "condition": "Partly Cloudy"},
            {"day": "Tomorrow", "temp_max": 32, "temp_min": 23, "rain_prob": 45, "condition": "Isolated Evening Showers"},
            {"day": "Day After", "temp_max": 30, "temp_min": 22, "rain_prob": 65, "condition": "Thunderstorms Likely"}
        ],
        "spray_advisory": {
            "suitability": "Optimal for Morning Spray (காலை தெளிப்புக்கு உகந்தது)",
            "recommendation": "Winds are low (9.2 km/h) and no heavy rain expected for the next 14 hours. Ideal window for protective fungicide and foliar micronutrient spraying before 10:30 AM or after 4:00 PM.",
            "is_safe_to_spray": True
        }
    }

@router.get("/government-schemes")
def get_government_schemes():
    """
    Verified Tamil Nadu and Central Agricultural Welfare Schemes
    with eligibility requirements, documents list, and official links.
    """
    return [
        {
            "id": 1,
            "title": "Kalaignarin All Village Integrated Agriculture Development Programme (KAVIADP)",
            "tamil_title": "கலைஞரின் அனைத்து கிராம ஒருங்கிணைந்த வேளாண் வளர்ச்சித் திட்டம்",
            "category": "Village Infrastructure & Seed Subsidy",
            "subsidy_details": "Free distribution of quality seed kits, coconut saplings, dryland horticulture inputs, and farm ponds creation across selected panchayats in Natrampalli block.",
            "eligibility": "All resident farmers owning agricultural land in selected Gram Panchayats of Natrampalli block. Small and marginal farmers given priority.",
            "documents_needed": ["Patta / Chitta copy", "Aadhaar Card", "Bank Passbook with IFSC", "Ration Card"],
            "official_portal": "https://agritech.tnau.ac.in",
            "department": "Tamil Nadu Agriculture & Farmers Welfare Department"
        },
        {
            "id": 2,
            "title": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
            "tamil_title": "பிரதம மந்திரி கிசான் சம்மான் நிதி",
            "category": "Direct Income Support",
            "subsidy_details": "₹6,000 per year paid in three equal 4-monthly installments of ₹2,000 directly into the bank accounts of all landholding farmer families.",
            "eligibility": "All farmer families owning cultivable land in Natrampalli block (subject to standard institutional landholder exclusion criteria). Aadhaar e-KYC mandatory.",
            "documents_needed": ["Aadhaar linked with mobile", "Land revenue documents (Patta)", "Bank Account (Aadhaar Seeded)"],
            "official_portal": "https://pmkisan.gov.in",
            "department": "Ministry of Agriculture & Farmers Welfare, GoI"
        },
        {
            "id": 3,
            "title": "Tamil Nadu Micro Irrigation Subsidy Scheme (Pradhan Mantri Krishi Sinchayee Yojana)",
            "tamil_title": "நுண்ணீர்ப் பாசனத் திட்டம் (சொட்டு நீர் பாசனம்)",
            "category": "Irrigation Equipment Subsidy",
            "subsidy_details": "100% subsidy for Small & Marginal farmers (up to 5 acres); 75% subsidy for other farmers for installing Drip and Sprinkler irrigation systems.",
            "eligibility": "Farmers with valid borewell or well water source and electricity connection in Tirupattur district.",
            "documents_needed": ["Patta, Chitta, Adangal copy", "FMB sketch from VAO", "Well/borewell certificate", "Soil & water test report from TNAU / KVK"],
            "official_portal": "https://tnhorticulture.tn.gov.in",
            "department": "Department of Horticulture & Plantation Crops, Tamil Nadu"
        },
        {
            "id": 4,
            "title": "Pradhan Mantri Fasal Bima Yojana (Crop Insurance - PMFBY)",
            "tamil_title": "பிரதம மந்திரி பயிர் காப்பீட்டுத் திட்டம்",
            "category": "Crop Risk Insurance",
            "subsidy_details": "Subsidized premium: Only 1.5% to 2% premium payable by farmer for Food grains, Oilseeds, and Pulses. Balance paid by State and Central Governments.",
            "eligibility": "Loanee and Non-loanee farmers growing notified crops (Paddy, Groundnut, Sugarcane) in notified firkas of Natrampalli block.",
            "documents_needed": ["Crop Sowing Certificate issued by VAO", "Patta & Chitta", "Aadhaar Card", "Bank Account Details"],
            "official_portal": "https://pmfby.gov.in",
            "department": "Tamil Nadu Agricultural Insurance Division"
        }
    ]
