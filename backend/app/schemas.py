from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime
from decimal import Decimal

# --- AUTH SCHEMAS ---
class UserRegister(BaseModel):
    name: str
    mobile: str
    password: str
    role: str  # farmer, dealer, buyer, machinery_owner
    email: Optional[str] = None
    preferred_language: Optional[str] = "ta"
    
    # Farmer specific
    village: Optional[str] = "Natrampalli"
    delivery_address: Optional[str] = None
    
    # Dealer specific
    shop_name: Optional[str] = None
    licence_number: Optional[str] = None
    shop_address: Optional[str] = None
    delivery_service_area: Optional[str] = None
    
    # Buyer specific
    business_name: Optional[str] = None
    buyer_type: Optional[str] = "Wholesaler"
    business_address: Optional[str] = None
    
    # Machinery owner specific
    alternate_mobile: Optional[str] = None

class UserLogin(BaseModel):
    mobile_or_email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserOut(BaseModel):
    id: int
    name: str
    mobile: str
    email: Optional[str] = None
    role: str
    preferred_language: str
    is_active: bool
    farmer_profile: Optional[dict] = None
    dealer_profile: Optional[dict] = None
    buyer_profile: Optional[dict] = None
    machinery_profile: Optional[dict] = None

    class Config:
        from_attributes = True

# --- PRODUCT SCHEMAS ---
class ProductBase(BaseModel):
    name: str
    brand: str
    category: str
    active_ingredient: Optional[str] = None
    description: Optional[str] = None
    unit: str = "500ml Bottle"
    unit_price: Decimal
    stock_quantity: int = 50
    is_regulated: bool = False
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    dealer_id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- AI & DISEASE DIAGNOSIS SCHEMAS ---
class DiseaseRequestCreate(BaseModel):
    crop_name: str
    symptoms_description: str
    affected_part: Optional[str] = "Leaf"
    village: Optional[str] = "Natrampalli"
    delivery_address: str

class AIReportOut(BaseModel):
    id: int
    possible_disease: str
    tamil_name: Optional[str] = None
    confidence: Decimal
    problem_type: str
    symptoms_detected: str
    preventive_measures: str
    recommended_next_steps: str
    requires_expert_review: bool
    is_simulated: bool
    created_at: datetime

    class Config:
        from_attributes = True

class QuotationItemCreate(BaseModel):
    product_id: Optional[int] = None
    product_name: str
    brand: str
    category: str
    quantity: int = 1
    unit_price: Decimal

class QuotationItemOut(BaseModel):
    id: int
    product_id: Optional[int] = None
    product_name: str
    brand: str
    category: str
    quantity: int
    unit_price: Decimal
    total_price: Decimal

    class Config:
        from_attributes = True

class DealerAssessmentCreate(BaseModel):
    possible_disease: str
    assessment_notes: str
    safety_precautions: Optional[str] = None
    application_instructions: Optional[str] = None

class DealerAssessmentOut(BaseModel):
    id: int
    dealer_id: int
    dealer_name: Optional[str] = None
    shop_name: Optional[str] = None
    possible_disease: str
    assessment_notes: str
    safety_precautions: Optional[str] = None
    application_instructions: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class QuotationCreate(BaseModel):
    request_id: int
    items: List[QuotationItemCreate]
    delivery_fee: Decimal = Decimal("50.00")
    estimated_delivery_hours: int = 4
    validity_days: int = 3
    notes: Optional[str] = None
    status: str = "submitted"  # draft or submitted
    # assessment details along with quotation
    assessment_notes: Optional[str] = None
    safety_precautions: Optional[str] = None
    application_instructions: Optional[str] = None

class QuotationOut(BaseModel):
    id: int
    request_id: int
    dealer_id: int
    dealer_name: Optional[str] = None
    shop_name: Optional[str] = None
    dealer_rating: Optional[float] = None
    dealer_verified: Optional[bool] = None
    service_area: Optional[str] = None
    status: str
    total_product_cost: Decimal
    delivery_fee: Decimal
    total_amount: Decimal
    estimated_delivery_hours: int
    validity_days: int
    notes: Optional[str] = None
    is_demo: bool
    items: List[QuotationItemOut] = []
    created_at: datetime

    class Config:
        from_attributes = True

class DiseaseRequestOut(BaseModel):
    id: int
    farmer_id: int
    farmer_name: Optional[str] = None
    farmer_mobile: Optional[str] = None
    crop_name: str
    symptoms_description: str
    affected_part: str
    village: str
    delivery_address: str
    status: str
    created_at: datetime
    images: List[str] = []
    ai_report: Optional[AIReportOut] = None
    assessments: List[DealerAssessmentOut] = []
    quotations: List[QuotationOut] = []

    class Config:
        from_attributes = True

# --- ORDER & PAYMENT SCHEMAS ---
class OrderCreate(BaseModel):
    quotation_id: int
    delivery_address: str
    contact_mobile: str
    delivery_notes: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str  # order_accepted, preparing, ready_for_dispatch, out_for_delivery, delivered, cancelled
    delivery_notes: Optional[str] = None
    estimated_delivery_time: Optional[str] = None

class PaymentVerify(BaseModel):
    order_id: int
    payment_method: Optional[str] = "UPI (Demo Sandbox)"

class OrderOut(BaseModel):
    id: int
    order_number: str
    farmer_id: int
    farmer_name: Optional[str] = None
    dealer_id: int
    dealer_shop_name: Optional[str] = None
    dealer_mobile: Optional[str] = None
    quotation_id: Optional[int] = None
    subtotal: Decimal
    delivery_fee: Decimal
    taxes: Decimal
    total_amount: Decimal
    delivery_address: str
    contact_mobile: str
    status: str
    estimated_delivery_time: Optional[str] = None
    delivery_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[dict] = []
    payment: Optional[dict] = None

    class Config:
        from_attributes = True

# --- CROP MARKETPLACE SCHEMAS ---
class CropListingCreate(BaseModel):
    crop_name: str
    variety: Optional[str] = None
    available_quantity: Decimal
    unit: str = "Quintal"
    expected_price: Decimal
    harvest_date: str
    village: Optional[str] = "Natrampalli"
    pickup_preference: Optional[str] = "Farm Gate Pickup"
    image_url: Optional[str] = None

class BuyerOfferCreate(BaseModel):
    offered_price_per_unit: Decimal
    message: Optional[str] = None

class BuyerOfferOut(BaseModel):
    id: int
    listing_id: int
    crop_name: Optional[str] = None
    buyer_id: int
    buyer_name: Optional[str] = None
    buyer_business_name: Optional[str] = None
    buyer_mobile: Optional[str] = None
    offered_price_per_unit: Decimal
    total_offered_amount: Decimal
    message: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class CropListingOut(BaseModel):
    id: int
    farmer_id: int
    farmer_name: Optional[str] = None
    farmer_mobile: Optional[str] = None
    crop_name: str
    variety: Optional[str] = None
    available_quantity: Decimal
    unit: str
    expected_price: Decimal
    harvest_date: str
    village: str
    pickup_preference: str
    image_url: Optional[str] = None
    status: str
    created_at: datetime
    offers: List[BuyerOfferOut] = []

    class Config:
        from_attributes = True

# --- MACHINERY SCHEMAS ---
class MachineryListingCreate(BaseModel):
    equipment_type: str
    equipment_name: str
    brand_model: Optional[str] = None
    hourly_rate: Optional[Decimal] = None
    daily_rate: Optional[Decimal] = None
    rate_type: str = "hourly"
    service_area: Optional[str] = "Natrampalli & nearby villages"
    booking_conditions: Optional[str] = None
    image_url: Optional[str] = None

class MachineryBookingCreate(BaseModel):
    start_date: str
    end_date: str
    duration_units: int = 1
    rate_type: str = "hourly"
    farm_location: str

class MachineryBookingOut(BaseModel):
    id: int
    listing_id: int
    equipment_name: Optional[str] = None
    equipment_type: Optional[str] = None
    owner_name: Optional[str] = None
    owner_mobile: Optional[str] = None
    farmer_id: int
    farmer_name: Optional[str] = None
    farmer_mobile: Optional[str] = None
    start_date: str
    end_date: str
    duration_units: int
    rate_type: str
    total_amount: Decimal
    farm_location: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class MachineryListingOut(BaseModel):
    id: int
    owner_id: int
    owner_name: Optional[str] = None
    owner_mobile: Optional[str] = None
    equipment_type: str
    equipment_name: str
    brand_model: Optional[str] = None
    hourly_rate: Optional[Decimal] = None
    daily_rate: Optional[Decimal] = None
    rate_type: str
    availability_status: bool
    service_area: str
    booking_conditions: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime
    bookings: List[MachineryBookingOut] = []

    class Config:
        from_attributes = True
