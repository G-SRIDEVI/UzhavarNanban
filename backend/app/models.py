import datetime
from sqlalchemy import (
    Column, Integer, String, Boolean, Numeric, Text, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    mobile = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # 'farmer', 'dealer', 'buyer', 'machinery_owner', 'admin'
    preferred_language = Column(String(10), default="ta")  # 'ta' or 'en'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete")
    dealer_profile = relationship("DealerProfile", back_populates="user", uselist=False, cascade="all, delete")
    buyer_profile = relationship("BuyerProfile", back_populates="user", uselist=False, cascade="all, delete")
    machinery_profile = relationship("MachineryOwnerProfile", back_populates="user", uselist=False, cascade="all, delete")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete")

class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    village = Column(String(100), nullable=False, default="Natrampalli")
    delivery_address = Column(Text, nullable=False)
    pincode = Column(String(10), default="635852")
    block = Column(String(50), default="Natrampalli")
    district = Column(String(50), default="Tirupattur")
    
    user = relationship("User", back_populates="farmer_profile")

class DealerProfile(Base):
    __tablename__ = "dealer_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    shop_name = Column(String(150), nullable=False)
    licence_number = Column(String(100), nullable=False)
    licence_document = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False)
    shop_address = Column(Text, nullable=False)
    village = Column(String(100), nullable=False, default="Natrampalli")
    delivery_service_area = Column(String(255), default="Natrampalli, Pachur, Kothur, Velakalnatham, Jolarpettai border")
    rating = Column(Numeric(3, 1), default=4.8)
    rating_count = Column(Integer, default=12)
    
    user = relationship("User", back_populates="dealer_profile")
    products = relationship("Product", back_populates="dealer", cascade="all, delete")

class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    business_name = Column(String(150), nullable=False)
    buyer_type = Column(String(50), default="Wholesaler")  # Wholesaler, Retailer, Commission Agent, Food Processor
    business_address = Column(Text, nullable=False)
    village = Column(String(100), nullable=False, default="Natrampalli")
    
    user = relationship("User", back_populates="buyer_profile")

class MachineryOwnerProfile(Base):
    __tablename__ = "machinery_owner_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    village = Column(String(100), nullable=False, default="Natrampalli")
    address = Column(Text, nullable=False)
    alternate_mobile = Column(String(20), nullable=True)
    
    user = relationship("User", back_populates="machinery_profile")

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    dealer_id = Column(Integer, ForeignKey("dealer_profiles.id"), nullable=False)
    name = Column(String(150), nullable=False)
    brand = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)  # 'Fungicide', 'Insecticide', 'Bio-control', 'Fertilizer', 'Micronutrient'
    active_ingredient = Column(String(150), nullable=True)
    description = Column(Text, nullable=True)
    unit = Column(String(20), default="Bottle (500ml)")  # kg, litre, 500ml, packet
    unit_price = Column(Numeric(10, 2), nullable=False)
    stock_quantity = Column(Integer, default=50)
    is_regulated = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    dealer = relationship("DealerProfile", back_populates="products")

class DiseaseRequest(Base):
    __tablename__ = "disease_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_name = Column(String(100), nullable=False)
    symptoms_description = Column(Text, nullable=False)
    affected_part = Column(String(50), default="Leaf")  # Leaf, Stem, Fruit, Root, Whole Plant
    village = Column(String(100), nullable=False, default="Natrampalli")
    delivery_address = Column(Text, nullable=False)
    status = Column(String(30), default="submitted")  # submitted, quotations_received, order_placed, closed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    farmer = relationship("User")
    images = relationship("DiseaseImage", back_populates="request", cascade="all, delete")
    ai_report = relationship("AIReport", back_populates="request", uselist=False, cascade="all, delete")
    assessments = relationship("DealerAssessment", back_populates="request", cascade="all, delete")
    quotations = relationship("Quotation", back_populates="request", cascade="all, delete")

class DiseaseImage(Base):
    __tablename__ = "disease_images"
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("disease_requests.id"), nullable=False)
    file_path = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    request = relationship("DiseaseRequest", back_populates="images")

class AIReport(Base):
    __tablename__ = "ai_reports"
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("disease_requests.id"), unique=True, nullable=False)
    possible_disease = Column(String(150), nullable=False)
    tamil_name = Column(String(150), nullable=True)
    confidence = Column(Numeric(4, 2), nullable=False)  # 0.00 to 1.00
    problem_type = Column(String(50), default="Fungal Disease")  # Fungal, Bacterial, Viral, Pest, Nutrient Deficiency
    symptoms_detected = Column(Text, nullable=False)
    preventive_measures = Column(Text, nullable=False)
    recommended_next_steps = Column(Text, nullable=False)
    requires_expert_review = Column(Boolean, default=False)
    is_simulated = Column(Boolean, default=True)  # Clearly labels simulation as per prompt
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    request = relationship("DiseaseRequest", back_populates="ai_report")

class DealerAssessment(Base):
    __tablename__ = "dealer_assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("disease_requests.id"), nullable=False)
    dealer_id = Column(Integer, ForeignKey("dealer_profiles.id"), nullable=False)
    possible_disease = Column(String(150), nullable=False)
    assessment_notes = Column(Text, nullable=False)
    safety_precautions = Column(Text, nullable=True)
    application_instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    request = relationship("DiseaseRequest", back_populates="assessments")
    dealer = relationship("DealerProfile")

class Quotation(Base):
    __tablename__ = "quotations"
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("disease_requests.id"), nullable=False)
    dealer_id = Column(Integer, ForeignKey("dealer_profiles.id"), nullable=False)
    status = Column(String(30), default="submitted")  # draft, submitted, accepted, rejected
    total_product_cost = Column(Numeric(10, 2), nullable=False, default=0.00)
    delivery_fee = Column(Numeric(10, 2), nullable=False, default=0.00)
    total_amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    estimated_delivery_hours = Column(Integer, default=4)  # in hours
    validity_days = Column(Integer, default=3)
    notes = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    request = relationship("DiseaseRequest", back_populates="quotations")
    dealer = relationship("DealerProfile")
    items = relationship("QuotationItem", back_populates="quotation", cascade="all, delete")

class QuotationItem(Base):
    __tablename__ = "quotation_items"
    
    id = Column(Integer, primary_key=True, index=True)
    quotation_id = Column(Integer, ForeignKey("quotations.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    product_name = Column(String(150), nullable=False)
    brand = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    
    quotation = relationship("Quotation", back_populates="items")
    product = relationship("Product")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    dealer_id = Column(Integer, ForeignKey("dealer_profiles.id"), nullable=False)
    quotation_id = Column(Integer, ForeignKey("quotations.id"), nullable=True)
    subtotal = Column(Numeric(10, 2), nullable=False)
    delivery_fee = Column(Numeric(10, 2), nullable=False)
    taxes = Column(Numeric(10, 2), default=0.00)
    total_amount = Column(Numeric(10, 2), nullable=False)
    delivery_address = Column(Text, nullable=False)
    contact_mobile = Column(String(20), nullable=False)
    # workflow: payment_confirmed -> order_accepted -> preparing -> ready_for_dispatch -> out_for_delivery -> delivered
    status = Column(String(40), default="payment_confirmed")
    estimated_delivery_time = Column(String(100), default="Within 4 hours (Today)")
    delivery_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    farmer = relationship("User", foreign_keys=[farmer_id])
    dealer = relationship("DealerProfile")
    quotation = relationship("Quotation")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete")
    payment = relationship("Payment", back_populates="order", uselist=False, cascade="all, delete")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    product_name = Column(String(150), nullable=False)
    brand = Column(String(100), nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    
    order = relationship("Order", back_populates="items")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), unique=True, nullable=False)
    transaction_ref = Column(String(100), unique=True, index=True, nullable=False)
    gateway = Column(String(50), default="Razorpay Sandbox (Demo)")
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(30), default="completed")  # initiated, completed, failed, refunded
    is_sandbox = Column(Boolean, default=True)
    payment_method = Column(String(50), default="UPI / NetBanking")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    verified_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    order = relationship("Order", back_populates="payment")

class CropListing(Base):
    __tablename__ = "crop_listings"
    
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_name = Column(String(100), nullable=False)
    variety = Column(String(100), nullable=True)
    available_quantity = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(20), default="Quintal")  # Quintal, Kg, Ton, Bag (50kg)
    expected_price = Column(Numeric(10, 2), nullable=False)  # per unit
    harvest_date = Column(String(50), nullable=False)
    village = Column(String(100), default="Natrampalli")
    pickup_preference = Column(String(100), default="Farm Gate Pickup")  # Farm Gate Pickup, Buyer to Arrange, Farmer Delivers
    image_url = Column(String(255), nullable=True)
    status = Column(String(30), default="active")  # active, sold, withdrawn
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    farmer = relationship("User")
    offers = relationship("BuyerOffer", back_populates="listing", cascade="all, delete")

class BuyerOffer(Base):
    __tablename__ = "buyer_offers"
    
    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("crop_listings.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    offered_price_per_unit = Column(Numeric(10, 2), nullable=False)
    total_offered_amount = Column(Numeric(10, 2), nullable=False)
    message = Column(Text, nullable=True)
    status = Column(String(30), default="pending")  # pending, accepted, rejected, countered
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    listing = relationship("CropListing", back_populates="offers")
    buyer = relationship("User")

class MachineryListing(Base):
    __tablename__ = "machinery_listings"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    equipment_type = Column(String(50), nullable=False)  # Tractor, Rotavator, Harvester, Power Tiller, Sprayer
    equipment_name = Column(String(150), nullable=False)
    brand_model = Column(String(100), nullable=True)
    hourly_rate = Column(Numeric(10, 2), nullable=True)
    daily_rate = Column(Numeric(10, 2), nullable=True)
    rate_type = Column(String(20), default="hourly")  # hourly, daily
    availability_status = Column(Boolean, default=True)
    service_area = Column(String(255), default="Natrampalli, Pachur, Vaniyambadi surroundings")
    booking_conditions = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    owner = relationship("User")
    bookings = relationship("MachineryBooking", back_populates="machinery", cascade="all, delete")

class MachineryBooking(Base):
    __tablename__ = "machinery_bookings"
    
    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("machinery_listings.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_date = Column(String(20), nullable=False)  # YYYY-MM-DD
    end_date = Column(String(20), nullable=False)    # YYYY-MM-DD
    duration_units = Column(Integer, default=1)      # hours or days
    rate_type = Column(String(20), default="hourly")
    total_amount = Column(Numeric(10, 2), nullable=False)
    farm_location = Column(Text, nullable=False)
    status = Column(String(30), default="pending")  # pending, accepted, rejected, completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    machinery = relationship("MachineryListing", back_populates="bookings")
    farmer = relationship("User")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="notifications")
