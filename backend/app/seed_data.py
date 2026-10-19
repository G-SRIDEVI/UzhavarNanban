import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from app.models import (
    User, FarmerProfile, DealerProfile, BuyerProfile, MachineryOwnerProfile,
    Product, DiseaseRequest, DiseaseImage, AIReport, DealerAssessment,
    Quotation, QuotationItem, CropListing, BuyerOffer, MachineryListing, MachineryBooking
)
from app.auth import hash_password

def seed_database(db: Session):
    # Check if already seeded
    existing_user = db.query(User).filter(User.mobile == "9876543210").first()
    if existing_user:
        print("Database already contains seed data.")
        return

    print("Seeding UzhavarNanban database for Natrampalli Block...")
    default_pw = hash_password("Password123!")

    # 1. FARMER
    farmer_user = User(
        name="Ramasamy Gounder (ராமசாமி)",
        mobile="9876543210",
        email="farmer@uzhavar.in",
        password_hash=default_pw,
        role="farmer",
        preferred_language="ta",
        is_active=True
    )
    db.add(farmer_user)
    db.flush()

    farmer_profile = FarmerProfile(
        user_id=farmer_user.id,
        village="Natrampalli Pudur",
        delivery_address="Plot 14, Mariamman Koil Street, Natrampalli Pudur, Natrampalli Block, Tirupattur - 635852",
        pincode="635852",
        block="Natrampalli",
        district="Tirupattur"
    )
    db.add(farmer_profile)

    # 2. DEALER A: Sri Murugan Agro Agencies
    dealer1_user = User(
        name="Murugan M. (முருகன்)",
        mobile="9876543211",
        email="dealer.murugan@uzhavar.in",
        password_hash=default_pw,
        role="dealer",
        preferred_language="ta",
        is_active=True
    )
    db.add(dealer1_user)
    db.flush()

    dealer1_profile = DealerProfile(
        user_id=dealer1_user.id,
        shop_name="Sri Murugan Agro Agencies (Dealer A)",
        licence_number="TN-TPT-AGR-40192 (Verified)",
        is_verified=True,
        shop_address="Shop 8, Bazaar Street, Near Bus Stand, Natrampalli - 635852",
        village="Natrampalli Bazaar",
        delivery_service_area="Natrampalli, Pudur, Kothur, Dasiriyappanur (Within 12 km)",
        rating=Decimal("4.9"),
        rating_count=38
    )
    db.add(dealer1_profile)

    # 3. DEALER B: Kaveri Krishi Kendra
    dealer2_user = User(
        name="Kaveri Sundaram (காவேரி சுந்தரம்)",
        mobile="9876543212",
        email="dealer.kaveri@uzhavar.in",
        password_hash=default_pw,
        role="dealer",
        preferred_language="ta",
        is_active=True
    )
    db.add(dealer2_user)
    db.flush()

    dealer2_profile = DealerProfile(
        user_id=dealer2_user.id,
        shop_name="Kaveri Krishi Kendra (Dealer B)",
        licence_number="TN-TPT-AGR-40288 (Verified)",
        is_verified=True,
        shop_address="Pachur Main Road, Near Railway Bridge, Pachur, Natrampalli - 635854",
        village="Pachur, Natrampalli",
        delivery_service_area="Pachur, Velakalnatham, Natrampalli North (Within 15 km)",
        rating=Decimal("4.7"),
        rating_count=24
    )
    db.add(dealer2_profile)

    # 4. DEALER C: Tirupattur Farmers Fertilizer Depot
    dealer3_user = User(
        name="Rajendran C. (ராஜேந்திரன்)",
        mobile="9876543213",
        email="dealer.tirupattur@uzhavar.in",
        password_hash=default_pw,
        role="dealer",
        preferred_language="en",
        is_active=True
    )
    db.add(dealer3_user)
    db.flush()

    dealer3_profile = DealerProfile(
        user_id=dealer3_user.id,
        shop_name="Tirupattur Farmers Fertilizer Depot (Dealer C)",
        licence_number="TN-TPT-AGR-39811 (Verified)",
        is_verified=True,
        shop_address="Old Highway Junction, Opp Market Yard, Natrampalli - Tirupattur Main Road",
        village="Natrampalli Highway",
        delivery_service_area="All Natrampalli Block & Jolarpettai border",
        rating=Decimal("4.8"),
        rating_count=52
    )
    db.add(dealer3_profile)

    # 5. BUYER: Velan Agro Traders
    buyer_user = User(
        name="Velan Agro Wholesale (வேலன் அக்ரோ)",
        mobile="9876543214",
        email="buyer.velan@uzhavar.in",
        password_hash=default_pw,
        role="buyer",
        preferred_language="ta",
        is_active=True
    )
    db.add(buyer_user)
    db.flush()

    buyer_profile = BuyerProfile(
        user_id=buyer_user.id,
        business_name="Velan Agro Wholesale & Commission Traders",
        buyer_type="Wholesale Trader & Mandi Commission Agent",
        business_address="Godown 4, Vaniyambadi-Natrampalli Highway Mandi Yard, Tirupattur",
        village="Vaniyambadi-Natrampalli"
    )
    db.add(buyer_profile)

    # 6. MACHINERY OWNER: Gowtham Mechanization
    machinery_user = User(
        name="Gowtham K. (கௌதம்)",
        mobile="9876543215",
        email="machinery.gowtham@uzhavar.in",
        password_hash=default_pw,
        role="machinery_owner",
        preferred_language="ta",
        is_active=True
    )
    db.add(machinery_user)
    db.flush()

    machinery_profile = MachineryOwnerProfile(
        user_id=machinery_user.id,
        village="Thoppalagunda, Natrampalli",
        address="Kariyakottai Road, Thoppalagunda Village, Natrampalli Block - 635852",
        alternate_mobile="9443210987"
    )
    db.add(machinery_profile)

    db.flush()

    # --- PRODUCTS FOR DEALERS ---
    p1 = Product(
        dealer_id=dealer1_profile.id,
        name="Infinito High-Power Systemic Fungicide",
        brand="Bayer CropScience",
        category="Fungicide",
        active_ingredient="Fluopicolide + Propamocarb (62.5% SC)",
        description="Exceptional protection against tomato late blight and downy mildew. Rainfast within 2 hours.",
        unit="500ml Bottle",
        unit_price=Decimal("650.00"),
        stock_quantity=45,
        is_regulated=False,
        is_active=True,
        image_url="https://images.unsplash.com/photo-1592417817098-8f3d6eb2252a?w=400"
    )
    p2 = Product(
        dealer_id=dealer2_profile.id,
        name="Saaf Dual Systemic & Contact Fungicide",
        brand="UPL Limited",
        category="Fungicide",
        active_ingredient="Carbendazim 12% + Mancozeb 63% WP",
        description="Broad spectrum disease controller for early & late blight and leaf spots.",
        unit="500g Pack",
        unit_price=Decimal("600.00"),
        stock_quantity=60,
        is_regulated=False,
        is_active=True,
        image_url="https://images.unsplash.com/photo-1589923188900-85dae523342b?w=400"
    )
    p3 = Product(
        dealer_id=dealer3_profile.id,
        name="Blitox 50 Blue Copper Fungicide",
        brand="Tata Rallis",
        category="Fungicide",
        active_ingredient="Copper Oxychloride 50% WP",
        description="Classic protective contact fungicide with strong bactericidal properties for Solanaceous and Rice crops.",
        unit="500g Pack",
        unit_price=Decimal("700.00"),
        stock_quantity=40,
        is_regulated=False,
        is_active=True,
        image_url="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400"
    )
    p4 = Product(
        dealer_id=dealer1_profile.id,
        name="TNAU Bio-Control Pseudomonas Fluorescens",
        brand="TNAU Agritech",
        category="Bio-control",
        active_ingredient="Pseudomonas fluorescens (1x10^8 CFU/ml)",
        description="Eco-friendly biological bactericide & fungicide. Induces systemic resistance in roots and foliage.",
        unit="1 Litre Bottle",
        unit_price=Decimal("180.00"),
        stock_quantity=80,
        is_regulated=False,
        is_active=True,
        image_url="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400"
    )
    p5 = Product(
        dealer_id=dealer2_profile.id,
        name="Gromor 20:20:0:13 Complex Fertilizer",
        brand="Coromandel International",
        category="Fertilizer",
        active_ingredient="Nitrogen 20%, Phosphorus 20%, Sulphur 13%",
        description="High-efficiency balanced ammonium phosphate sulphate for root and vegetative vigor.",
        unit="50 Kg Bag",
        unit_price=Decimal("1350.00"),
        stock_quantity=120,
        is_regulated=True,
        is_active=True,
        image_url="https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=400"
    )
    db.add_all([p1, p2, p3, p4, p5])
    db.flush()

    # --- SEED DISEASE REQUEST (DEMONSTRATION SCENARIO AS IN PROMPT SECTION 5) ---
    req = DiseaseRequest(
        farmer_id=farmer_user.id,
        crop_name="Tomato (நாட்டு தக்காளி)",
        symptoms_description="Dark water-soaked brown spots rapidly spreading on tomato leaves with slight white powder underneath. Lower leaves turning yellow and dropping after recent cloudy drizzle.",
        affected_part="Leaf and Stem",
        village="Natrampalli Pudur",
        delivery_address="Plot 14, Mariamman Koil Street, Natrampalli Pudur, Natrampalli - 635852",
        status="quotations_received"
    )
    db.add(req)
    db.flush()

    # Seed image
    img = DiseaseImage(
        request_id=req.id,
        file_path="/uploads/demo_tomato_blight.jpg"
    )
    db.add(img)

    # AI Preliminary Report
    ai = AIReport(
        request_id=req.id,
        possible_disease="Tomato Late Blight (Phytophthora infestans)",
        tamil_name="தக்காளி பின் பருவ கருகல் நோய்",
        confidence=Decimal("0.89"),
        problem_type="Fungal Disease",
        symptoms_detected="Water-soaked dark lesions with irregular chlorotic border and subtle fungal sporulation observed under humid weather.",
        preventive_measures="Ensure proper spacing for ventilation; avoid overhead sprinkler watering. Prune heavily infested foliage.",
        recommended_next_steps="Apply protective fungicide early morning. Avoid high nitrogen top-dressing during blight outbreak. Compare quotes below from 3 verified local dealers in Natrampalli.",
        requires_expert_review=False,
        is_simulated=True
    )
    db.add(ai)

    # Dealer A Assessment & Quotation (Section 5 prompt example: Products ₹650 + Delivery ₹50 = ₹700)
    a1 = DealerAssessment(
        request_id=req.id,
        dealer_id=dealer1_profile.id,
        possible_disease="Late Blight (Phytophthora infestans) Confirmed",
        assessment_notes="Inspected plant photo: Symptoms indicate severe late blight triggered by morning mist. Strongly recommend Bayer Infinito which offers translaminar systemic action to stop lesion expansion within 24 hours.",
        safety_precautions="Wear rubber gloves and mask during spray. Do not spray against the wind. Withholding period: 3 days before tomato harvest.",
        application_instructions="Mix 2.5 ml of Infinito per 1 Litre of clean water. Spray thoroughly covering upper and lower leaf surfaces before 10 AM."
    )
    db.add(a1)

    q1 = Quotation(
        request_id=req.id,
        dealer_id=dealer1_profile.id,
        status="submitted",
        total_product_cost=Decimal("650.00"),
        delivery_fee=Decimal("50.00"),
        total_amount=Decimal("700.00"),
        estimated_delivery_hours=3,
        validity_days=3,
        notes="Fast delivery via our two-wheeler courier to Natrampalli Pudur within 3 hours.",
        is_demo=True
    )
    db.add(q1)
    db.flush()

    qi1 = QuotationItem(
        quotation_id=q1.id,
        product_id=p1.id,
        product_name="Infinito High-Power Systemic Fungicide",
        brand="Bayer CropScience",
        category="Fungicide",
        quantity=1,
        unit_price=Decimal("650.00"),
        total_price=Decimal("650.00")
    )
    db.add(qi1)

    # Dealer B Assessment & Quotation (Section 5 prompt example: Products ₹600 + Delivery ₹80 = ₹680)
    a2 = DealerAssessment(
        request_id=req.id,
        dealer_id=dealer2_profile.id,
        possible_disease="Early to Late Blight Complex",
        assessment_notes="Dual infection risk. Saaf (Mancozeb + Carbendazim) provides both contact barrier and systemic cure at economical cost.",
        safety_precautions="Wash spray equipment thoroughly. Keep domestic animals away for 24 hours.",
        application_instructions="Mix 2 grams per litre of water using knapsack sprayer. Ensure good coverage."
    )
    db.add(a2)

    q2 = Quotation(
        request_id=req.id,
        dealer_id=dealer2_profile.id,
        status="submitted",
        total_product_cost=Decimal("600.00"),
        delivery_fee=Decimal("80.00"),
        total_amount=Decimal("680.00"),
        estimated_delivery_hours=5,
        validity_days=3,
        notes="Dispatched from Pachur depot via rural delivery route.",
        is_demo=True
    )
    db.add(q2)
    db.flush()

    qi2 = QuotationItem(
        quotation_id=q2.id,
        product_id=p2.id,
        product_name="Saaf Dual Systemic & Contact Fungicide (500g)",
        brand="UPL Limited",
        category="Fungicide",
        quantity=1,
        unit_price=Decimal("600.00"),
        total_price=Decimal("600.00")
    )
    db.add(qi2)

    # Dealer C Assessment & Quotation (Section 5 prompt example: Products ₹700 + Delivery ₹30 = ₹730)
    a3 = DealerAssessment(
        request_id=req.id,
        dealer_id=dealer3_profile.id,
        possible_disease="Bacterial / Late Blight Blitox Cure",
        assessment_notes="Copper Oxychloride creates protective coating preventing spore germination. Excellent stickiness.",
        safety_precautions="Do not mix with alkaline solutions or lime sulfur.",
        application_instructions="Mix 3g Blitox per litre of water. Apply during clear sky."
    )
    db.add(a3)

    q3 = Quotation(
        request_id=req.id,
        dealer_id=dealer3_profile.id,
        status="submitted",
        total_product_cost=Decimal("700.00"),
        delivery_fee=Decimal("30.00"),
        total_amount=Decimal("730.00"),
        estimated_delivery_hours=4,
        validity_days=3,
        notes="Subsidized delivery from Natrampalli Highway center.",
        is_demo=True
    )
    db.add(q3)
    db.flush()

    qi3 = QuotationItem(
        quotation_id=q3.id,
        product_id=p3.id,
        product_name="Blitox 50 Blue Copper Fungicide (500g)",
        brand="Tata Rallis",
        category="Fungicide",
        quantity=1,
        unit_price=Decimal("700.00"),
        total_price=Decimal("700.00")
    )
    db.add(qi3)

    # --- SEED CROP LISTINGS ---
    c1 = CropListing(
        farmer_id=farmer_user.id,
        crop_name="Fresh Red Tomatoes (நாட்டு தக்காளி)",
        variety="Sivam Hybrid Grade-A",
        available_quantity=Decimal("35.00"),
        unit="Quintal",
        expected_price=Decimal("3200.00"),
        harvest_date="Ready for Harvest in 2 days",
        village="Natrampalli Pudur",
        pickup_preference="Farm Gate Pickup (Direct loading)",
        image_url="https://images.unsplash.com/photo-1592417817098-8f3d6eb2252a?w=400",
        status="active"
    )
    db.add(c1)
    db.flush()

    offer1 = BuyerOffer(
        listing_id=c1.id,
        buyer_id=buyer_user.id,
        offered_price_per_unit=Decimal("3100.00"),
        total_offered_amount=Decimal("108500.00"),
        message="Can pick up entire 35 quintals on Thursday morning with our transport lorry. Spot cash/immediate NEFT payment.",
        status="pending"
    )
    db.add(offer1)

    c2 = CropListing(
        farmer_id=farmer_user.id,
        crop_name="Groundnut with Pods (நிலக்கடலை)",
        variety="TMV-7 Well-Dried",
        available_quantity=Decimal("20.00"),
        unit="Quintal",
        expected_price=Decimal("7200.00"),
        harvest_date="Harvested & Sun-Dried (Moisture < 8%)",
        village="Natrampalli Pudur",
        pickup_preference="Farm Gate Pickup",
        image_url="https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400",
        status="active"
    )
    db.add(c2)

    # --- SEED MACHINERY LISTINGS ---
    m1 = MachineryListing(
        owner_id=machinery_user.id,
        equipment_type="Tractor",
        equipment_name="Mahindra 575 DI (45 HP) with 42-Blade Rotavator",
        brand_model="Mahindra 2023 Model with Heavy-Duty Rotary Tiller",
        hourly_rate=Decimal("950.00"),
        daily_rate=Decimal("7500.00"),
        rate_type="hourly",
        availability_status=True,
        service_area="Natrampalli, Pudur, Kothur, Dasiriyappanur, Pachur (Radius 15 km)",
        booking_conditions="Includes experienced operator and diesel. Minimum booking: 2 hours.",
        image_url="https://images.unsplash.com/photo-1589923188900-85dae523342b?w=400"
    )
    m2 = MachineryListing(
        owner_id=machinery_user.id,
        equipment_type="Harvester",
        equipment_name="Yanmar Paddy Combine Harvester (Rubber Track)",
        brand_model="Yanmar AW70V Track Combine",
        hourly_rate=Decimal("2400.00"),
        daily_rate=Decimal("16000.00"),
        rate_type="hourly",
        availability_status=True,
        service_area="All Tirupattur District & Natrampalli Block",
        booking_conditions="Rubber tracks suitable for wet paddy fields without bogging down. Operator included.",
        image_url="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400"
    )
    m3 = MachineryListing(
        owner_id=machinery_user.id,
        equipment_type="Sprayer",
        equipment_name="Stihl High-Pressure Power Sprayer (4-Stroke)",
        brand_model="Stihl SG-20 Engine Sprayer",
        hourly_rate=Decimal("120.00"),
        daily_rate=Decimal("450.00"),
        rate_type="daily",
        availability_status=True,
        service_area="Natrampalli Town & Surroundings",
        booking_conditions="Farmer provides petrol/oil. Clean thoroughly after pesticide spray before return.",
        image_url="https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=400"
    )
    db.add_all([m1, m2, m3])

    db.commit()
    print("Seed data loaded successfully!")
