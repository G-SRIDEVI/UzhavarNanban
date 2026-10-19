import React, { createContext, useContext, useState, useEffect } from "react";

const translations = {
  en: {
    appName: "UzhavarNanban",
    tagline: "Connect Farmers. Reduce Costs. Grow Together.",
    blockBadge: "Natrampalli Block • Tirupattur District",
    
    // Roles
    farmer: "Farmer",
    dealer: "Pesticide & Fertilizer Dealer",
    buyer: "Agricultural Produce Buyer",
    machinery_owner: "Farm Machinery Owner",
    
    // Nav & Common
    home: "Home",
    aiDoctor: "AI Plant Doctor",
    myRequests: "My Disease Requests",
    compareQuotes: "Compare Quotes",
    trackDeliveries: "Track Deliveries",
    cropMarket: "Sell / Buy Crops",
    machinery: "Machinery Rental",
    weather: "Weather Advisory",
    mandiPrices: "Market Prices",
    govtSchemes: "Govt Schemes",
    login: "Log In",
    register: "Create Account",
    logout: "Log Out",
    quickDemo: "Demo Quick-Switch",
    demoBadge: "Demo Simulation Data",
    
    // Actions
    submit: "Submit",
    cancel: "Cancel",
    confirm: "Confirm",
    payNow: "Proceed to Payment (Sandbox)",
    selectDealer: "Select This Dealer",
    viewDetails: "View Details",
    confirmDelivery: "Confirm Doorstep Delivery",
    
    // Hero & Features
    heroTitle: "Smart Agriculture for Natrampalli Farmers",
    heroSubtitle: "Identify crop diseases with AI, receive competitive quotations from local Natrampalli dealers, enjoy doorstep delivery, sell your harvest, and rent machinery — all in one software platform.",
    getStarted: "Get Started Now",
    exploreDemo: "Quick Explore Demo",
    selectRolePrompt: "Select your role to access your personalized agricultural dashboard:"
  },
  ta: {
    appName: "உழவர்நண்பன்",
    tagline: "விவசாயிகளை இணைப்போம். செலவை குறைப்போம். ஒன்றாய் வளர்வோம்.",
    blockBadge: "நாட்ராம்பள்ளி வட்டாரம் • திருப்பத்தூர் மாவட்டம்",
    
    // Roles
    farmer: "விவசாயி (Farmer)",
    dealer: "உர & மருந்து விற்பனையாளர் (Dealer)",
    buyer: "விளைபொருள் வாங்குபவர் (Buyer)",
    machinery_owner: "இயந்திர உரிமையாளர் (Machinery)",
    
    // Nav & Common
    home: "முகப்பு",
    aiDoctor: "AI தாவர மருத்துவர்",
    myRequests: "என் பயிர் நோய் பதிவுகள்",
    compareQuotes: "விலைப்புள்ளி ஒப்பீடு",
    trackDeliveries: "டெலிவரி கண்காணிப்பு",
    cropMarket: "விளைபொருள் சந்தை",
    machinery: "இயந்திர வாடகை",
    weather: "வானிலை & தெளிப்பு ஆலோசனை",
    mandiPrices: "உள்ளூர் மண்டி விலைகள்",
    govtSchemes: "அரசு மானியத் திட்டங்கள்",
    login: "உள்நுழைக",
    register: "புதிய கணக்கு",
    logout: "வெளியேறு",
    quickDemo: "மாதிரி கணக்கு (Demo)",
    demoBadge: "மாதிரி தரவு (Demo)",
    
    // Actions
    submit: "சமர்ப்பிக்கவும்",
    cancel: "ரத்து செய்",
    confirm: "உறுதி செய்",
    payNow: "கட்டணம் செலுத்த (Sandbox)",
    selectDealer: "இந்த டீலரை தேர்வு செய்",
    viewDetails: "விவரங்களைக் காண்க",
    confirmDelivery: "டெலிவரி பெற்றது உறுதி செய்",
    
    // Hero & Features
    heroTitle: "நாட்ராம்பள்ளி விவசாயிகளுக்கான நவீன வேளாண் தளம்",
    heroSubtitle: "பயிர் நோயை AI மூலம் கண்டறிந்து, அருகிலுள்ள உரக்கடைகளின் விலைகளை ஒப்பிட்டு, வீட்டிற்கே மருந்துகளை பெற்று, விளைபொருட்களை விற்று, இயந்திரங்களை வாடகைக்கு எடுங்கள்.",
    getStarted: "தொடங்கவும்",
    exploreDemo: "மாதிரி பயன்பாடு (Demo)",
    selectRolePrompt: "உங்கள் வேளாண் போர்ட்டலை அணுக உங்கள் பங்கை தேர்வு செய்யவும்:"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("uzhavar_lang") || "ta"; // Default Tamil
  });

  useEffect(() => {
    localStorage.setItem("uzhavar_lang", language);
  }, [language]);

  const t = (key) => {
    return (translations[language] && translations[language][key]) || translations["en"][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "ta" ? "en" : "ta"));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
