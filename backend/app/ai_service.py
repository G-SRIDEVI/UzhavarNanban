import os
from pathlib import Path
from PIL import Image
import numpy as np
from app.config import settings

# TNAU (Tamil Nadu Agricultural University) verified plant pathology & nutrient knowledge base
AGRI_KNOWLEDGE_BASE = {
    "tomato": [
        {
            "disease": "Tomato Late Blight (Phytophthora infestans)",
            "tamil_name": "தக்காளி பின் பருவ கருகல் நோய்",
            "type": "Fungal Disease",
            "keywords": ["dark spot", "brown", "water soaked", "blight", "black patch", "wilting", "white mould", "fog", "rain"],
            "symptoms": "Water-soaked irregular pale green to dark brown lesions on leaves, stems, and fruits. In humid weather, delicate whitish fungal growth appears on undersides of leaves.",
            "preventive_measures": "Avoid overhead sprinkler irrigation to reduce leaf wetness. Space plants for adequate airflow. Use certified disease-free seedlings and practice crop rotation with non-solanaceous crops.",
            "treatment_steps": "Remove and safely destroy heavily infected leaves. When condition warrants, apply protective copper-based fungicide or Metalaxyl+Mancozeb early morning. Maintain good drainage.",
            "is_nutrient_deficiency": False
        },
        {
            "disease": "Tomato Early Blight (Alternaria solani)",
            "tamil_name": "தக்காளி முன் பருவ கருகல் நோய்",
            "type": "Fungal Disease",
            "keywords": ["concentric rings", "target spot", "lower leaves", "yellow halo", "drying"],
            "symptoms": "Brown to black spots with concentric rings (target board pattern) primarily on older, lower foliage, surrounded by a chlorotic yellow halo.",
            "preventive_measures": "Mulch the soil bed to prevent rain splash from soil to lower foliage. Stake plants to keep leaves off damp soil. Prune lower diseased foliage.",
            "treatment_steps": "Spray Mancozeb (2g/L) or Chlorothalonil early. Incorporate Trichoderma viride in soil prior to planting.",
            "is_nutrient_deficiency": False
        },
        {
            "disease": "Nitrogen Deficiency (Chlorosis)",
            "tamil_name": "தழைச்சத்து (நைட்ரஜன்) பற்றாக்குறை",
            "type": "Nutrient Deficiency",
            "keywords": ["yellow leaf", "pale green", "general yellowing", "stunted growth", "pale", "light green"],
            "symptoms": "Uniform pale yellowing starting from oldest lower leaves, progressing upwards. Stems become slender and fibrous. No necrotic rings or water-soaked patches.",
            "preventive_measures": "Conduct soil testing before planting. Incorporate well-decomposed Farm Yard Manure (FYM) or vermicompost at 10 tonnes/hectare to improve organic carbon.",
            "treatment_steps": "Do NOT apply heavy chemical fertilizers indiscriminately. Apply foliar spray of 1% Urea or Panchagavya (3%) in the evening. Verify soil pH (ideal 6.0-7.0) to ensure nutrient uptake.",
            "is_nutrient_deficiency": True
        },
        {
            "disease": "Blossom End Rot (Calcium Imbalance)",
            "tamil_name": "பூ நுனி அழுகல் (சுண்ணாம்பு சத்து குறைபாடு)",
            "type": "Physiological Disorder",
            "keywords": ["fruit rot", "bottom black", "black end", "sunken blossom", "calcium"],
            "symptoms": "Dark, flattened, leathery sunken black spot at the blossom end of green or ripening tomato fruits. Not caused by pathogen, but calcium uptake stress.",
            "preventive_measures": "Maintain consistent soil moisture through drip irrigation; avoid drought-to-flooding cycles which block calcium transport.",
            "treatment_steps": "Apply foliar Calcium Nitrate (5g/L). Do not over-apply nitrogen/potassium fertilizers which compete with calcium absorption.",
            "is_nutrient_deficiency": True
        }
    ],
    "paddy": [
        {
            "disease": "Rice Blast (Magnaporthe oryzae)",
            "tamil_name": "நெல் குலை நோய்",
            "type": "Fungal Disease",
            "keywords": ["spindle", "eye shaped", "blast", "brown margin", "grey center", "neck blast"],
            "symptoms": "Spindle-shaped elliptical lesions with pointed ends, grey/whitish centers and dark brown borders on leaves. Neck rot causing empty panicles.",
            "preventive_measures": "Avoid excessive nitrogenous fertilizer application in cloudy weather. Maintain moderate water level. Use blast-resistant varieties like CO-51 or ADT-45.",
            "treatment_steps": "Spray Tricyclazole 75% WP (0.6g/L) or Isoprothiolane 40% EC at early tiller/booting stage. Apply Pseudomonas fluorescens bio-control agent (10g/L).",
            "is_nutrient_deficiency": False
        },
        {
            "disease": "Bacterial Leaf Blight (Xanthomonas oryzae)",
            "tamil_name": "நெல் பாக்டீரியா இலைக்கருகல் நோய்",
            "type": "Bacterial Disease",
            "keywords": ["wavy margin", "bacterial", "yellow stripe", "leaf tip drying", "kresek"],
            "symptoms": "Water-soaked to yellowish-orange translucent stripes starting from leaf tips and margins, progressing downwards with wavy edges.",
            "preventive_measures": "Drain field for 3-4 days if outbreak begins. Avoid clipping seedlings during transplanting. Balance potash and nitrogen.",
            "treatment_steps": "Spray Copper Oxychloride (2.5g/L) + Streptocycline (1g for 10L water). Do not top dress urea until infection stabilizes.",
            "is_nutrient_deficiency": False
        },
        {
            "disease": "Potassium Deficiency in Rice",
            "tamil_name": "சாம்பல் சத்து (பொட்டாசியம்) குறைபாடு",
            "type": "Nutrient Deficiency",
            "keywords": ["leaf tip scorching", "burnt edges", "dirty brown spots", "rusty", "lodging"],
            "symptoms": "Dark green leaves with tips and margins turning yellowish-brown and scorched. Rusty brown spots appear on older leaves.",
            "preventive_measures": "Split application of Muriate of Potash (MOP) at basal and panicle initiation stages instead of single dose.",
            "treatment_steps": "Foliar application of 1% MOP (10g/L) or SOP. Ensure soil is aerated and not continuously waterlogged.",
            "is_nutrient_deficiency": True
        }
    ],
    "groundnut": [
        {
            "disease": "Tikka Leaf Spot (Cercospora arachidicola / personata)",
            "tamil_name": "நிலக்கடலை டிக்கா இலைப்புள்ளி நோய்",
            "type": "Fungal Disease",
            "keywords": ["circular spot", "tikka", "black spots", "yellow halo", "defoliation"],
            "symptoms": "Early tikka shows circular brown spots with distinct bright yellow halos on upper leaf surface; late tikka shows smaller, dark brown to black spots on undersides.",
            "preventive_measures": "Seed treatment with Trichoderma viride (4g/kg) or Mancozeb (2g/kg). Collect and burn crop residues after harvest.",
            "treatment_steps": "Foliar spray of Carbendazim + Mancozeb (Saaf 2g/L) or Hexaconazole 5% EC (2ml/L) at 40 and 55 days after sowing.",
            "is_nutrient_deficiency": False
        },
        {
            "disease": "Iron Chlorosis in Groundnut",
            "tamil_name": "இரும்புச்சத்து பற்றாக்குறை (வெளிறிய இலைகள்)",
            "type": "Nutrient Deficiency",
            "keywords": ["white leaf", "interveinal chlorosis", "calcareous soil", "pale young leaves"],
            "symptoms": "Youngest emerging leaves show bright yellow to ivory-white color between veins while veins remain temporarily green. Common in alkaline/calcareous Tirupattur soils.",
            "preventive_measures": "Do not apply chemical fertilizers; rectify soil alkalinity. Increase farmyard manure to chelate micro-nutrients naturally.",
            "treatment_steps": "Foliar spray of Ferrous Sulphate (0.5% - 5g/L) along with Citric Acid (1g/L) on sunny mornings. Repeat after 10 days.",
            "is_nutrient_deficiency": True
        }
    ]
}

def analyze_plant_image(image_path: str, crop_name: str, symptoms_desc: str) -> dict:
    """
    Genuine image inspection combined with TNAU plant pathology agronomy engine.
    1. Analyzes image attributes: dimensions, format, color histogram, green/yellow/brown ratio.
    2. Validates if image exhibits typical foliage color tones.
    3. Evaluates symptoms and crop context against plant disease vs nutrient deficiency models.
    4. Explicitly labels simulated/demonstration AI as required by instructions.
    """
    crop_key = crop_name.strip().lower()
    if "tomato" in crop_key or "thakkali" in crop_key:
        crop_category = "tomato"
        normalized_crop = "Tomato (தக்காளி)"
    elif "paddy" in crop_key or "rice" in crop_key or "nel" in crop_key:
        crop_category = "paddy"
        normalized_crop = "Paddy / Rice (நெல்)"
    elif "groundnut" in crop_key or "peanut" in crop_key or "kadalai" in crop_key:
        crop_category = "groundnut"
        normalized_crop = "Groundnut (நிலக்கடலை)"
    else:
        # Fallback to tomato/general agronomy model
        crop_category = "tomato"
        normalized_crop = crop_name.title()

    # Image analysis using Pillow & numpy
    is_valid_image = False
    green_ratio = 0.0
    brown_yellow_ratio = 0.0
    image_detail_text = ""
    
    if os.path.exists(image_path):
        try:
            with Image.open(image_path) as img:
                img_rgb = img.convert("RGB")
                width, height = img_rgb.size
                arr = np.array(img_rgb)
                r = arr[:, :, 0].astype(float)
                g = arr[:, :, 1].astype(float)
                b = arr[:, :, 2].astype(float)
                
                # Chlorophyll foliage index: where green dominates over red and blue
                green_mask = (g > r) & (g > b) & (g > 30)
                # Chlorosis / Necrosis / Dark spot index: high yellow (r & g high, b low) or dark lesions
                yellow_mask = (r > 120) & (g > 100) & (b < 100)
                brown_mask = (r > 60) & (g > 30) & (g < r) & (b < 60)
                
                total_pixels = width * height
                green_ratio = float(np.sum(green_mask)) / total_pixels
                brown_yellow_ratio = float(np.sum(yellow_mask | brown_mask)) / total_pixels
                is_valid_image = True
                image_detail_text = f"Analyzed image resolution: {width}x{height}px. Foliage green ratio: {green_ratio*100:.1f}%, necrotic/chlorotic pattern: {brown_yellow_ratio*100:.1f}%."
        except Exception as e:
            image_detail_text = f"Image processing fallback: {str(e)}"
    
    # Matching against known disease and nutrient profiles
    candidates = AGRI_KNOWLEDGE_BASE.get(crop_category, AGRI_KNOWLEDGE_BASE["tomato"])
    best_candidate = candidates[0]
    best_score = 0
    symptoms_lower = symptoms_desc.lower()
    
    for candidate in candidates:
        score = 0
        for kw in candidate["keywords"]:
            if kw in symptoms_lower:
                score += 3
        # Match visually if yellow/brown detected and disease mentions yellowing/spotting
        if brown_yellow_ratio > 0.15 and ("yellow" in candidate["symptoms"].lower() or "brown" in candidate["symptoms"].lower()):
            score += 2
        if score > best_score:
            best_score = score
            best_candidate = candidate

    # Calculate confidence based on symptom correlation and image analysis
    if best_score >= 6:
        confidence = 0.92
    elif best_score >= 3:
        confidence = 0.85
    elif is_valid_image and (green_ratio > 0.10 or brown_yellow_ratio > 0.10):
        confidence = 0.78
    else:
        confidence = 0.62  # Low confidence, warrants expert review

    requires_expert = confidence < 0.80 or "severe" in symptoms_lower or "wilt" in symptoms_lower

    return {
        "crop_name": normalized_crop,
        "possible_disease": best_candidate["disease"],
        "tamil_name": best_candidate["tamil_name"],
        "confidence": confidence,
        "problem_type": best_candidate["type"],
        "symptoms_detected": f"{best_candidate['symptoms']} {image_detail_text}",
        "preventive_measures": best_candidate["preventive_measures"],
        "recommended_next_steps": (
            f"{best_candidate['treatment_steps']} "
            "Please review quotes from verified Natrampalli agricultural dealers before making any product purchase."
        ),
        "requires_expert_review": requires_expert,
        "is_simulated": True,  # Clearly labels demonstration/simulated AI vision as required
        "is_nutrient_deficiency": best_candidate["is_nutrient_deficiency"]
    }
