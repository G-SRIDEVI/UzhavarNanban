from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, FarmerProfile, DealerProfile, BuyerProfile, MachineryOwnerProfile
from app.schemas import UserRegister, UserLogin, Token, UserOut
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    # Check if mobile exists
    existing = db.query(User).filter(User.mobile == payload.mobile.strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this mobile number already exists."
        )
    
    if payload.email:
        existing_email = db.query(User).filter(User.email == payload.email.strip()).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )

    valid_roles = ["farmer", "dealer", "buyer", "machinery_owner"]
    if payload.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of {valid_roles}"
        )

    # Create User
    new_user = User(
        name=payload.name.strip(),
        mobile=payload.mobile.strip(),
        email=payload.email.strip() if payload.email else None,
        password_hash=hash_password(payload.password),
        role=payload.role,
        preferred_language=payload.preferred_language or "ta",
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # Create role specific profile
    if payload.role == "farmer":
        farmer = FarmerProfile(
            user_id=new_user.id,
            village=payload.village or "Natrampalli",
            delivery_address=payload.delivery_address or f"{payload.village or 'Natrampalli'}, Tirupattur District"
        )
        db.add(farmer)
    elif payload.role == "dealer":
        dealer = DealerProfile(
            user_id=new_user.id,
            shop_name=payload.shop_name or f"{new_user.name} Agro Care",
            licence_number=payload.licence_number or "TN-TPT-AGR-TEMP",
            shop_address=payload.shop_address or f"{payload.village or 'Natrampalli'}, Tirupattur",
            village=payload.village or "Natrampalli",
            delivery_service_area=payload.delivery_service_area or "Natrampalli Block",
            is_verified=False  # Requires administrator verification before selling regulated agrochemicals
        )
        db.add(dealer)
    elif payload.role == "buyer":
        buyer = BuyerProfile(
            user_id=new_user.id,
            business_name=payload.business_name or f"{new_user.name} Produce Traders",
            buyer_type=payload.buyer_type or "Wholesaler",
            business_address=payload.business_address or f"{payload.village or 'Natrampalli'}, Tirupattur",
            village=payload.village or "Natrampalli"
        )
        db.add(buyer)
    elif payload.role == "machinery_owner":
        machinery = MachineryOwnerProfile(
            user_id=new_user.id,
            village=payload.village or "Natrampalli",
            address=payload.delivery_address or f"{payload.village or 'Natrampalli'}, Tirupattur",
            alternate_mobile=payload.alternate_mobile
        )
        db.add(machinery)

    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role})
    
    user_dict = {
        "id": new_user.id,
        "name": new_user.name,
        "mobile": new_user.mobile,
        "email": new_user.email,
        "role": new_user.role,
        "preferred_language": new_user.preferred_language
    }

    return {"access_token": token, "token_type": "bearer", "user": user_dict}

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    identifier = payload.mobile_or_email.strip()
    user = db.query(User).filter(
        (User.mobile == identifier) | (User.email == identifier)
    ).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid mobile/email or password"
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role})
    
    # Extract role profile details
    profile_data = {}
    if user.role == "farmer" and user.farmer_profile:
        profile_data = {
            "village": user.farmer_profile.village,
            "delivery_address": user.farmer_profile.delivery_address,
            "district": user.farmer_profile.district
        }
    elif user.role == "dealer" and user.dealer_profile:
        profile_data = {
            "shop_name": user.dealer_profile.shop_name,
            "licence_number": user.dealer_profile.licence_number,
            "is_verified": user.dealer_profile.is_verified,
            "delivery_service_area": user.dealer_profile.delivery_service_area,
            "rating": float(user.dealer_profile.rating)
        }
    elif user.role == "buyer" and user.buyer_profile:
        profile_data = {
            "business_name": user.buyer_profile.business_name,
            "buyer_type": user.buyer_profile.buyer_type,
            "business_address": user.buyer_profile.business_address
        }
    elif user.role == "machinery_owner" and user.machinery_profile:
        profile_data = {
            "village": user.machinery_profile.village,
            "address": user.machinery_profile.address
        }

    user_dict = {
        "id": user.id,
        "name": user.name,
        "mobile": user.mobile,
        "email": user.email,
        "role": user.role,
        "preferred_language": user.preferred_language,
        "profile": profile_data
    }

    return {"access_token": token, "token_type": "bearer", "user": user_dict}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    profile_data = {}
    if current_user.role == "farmer" and current_user.farmer_profile:
        profile_data = {
            "village": current_user.farmer_profile.village,
            "delivery_address": current_user.farmer_profile.delivery_address,
            "district": current_user.farmer_profile.district
        }
    elif current_user.role == "dealer" and current_user.dealer_profile:
        profile_data = {
            "shop_name": current_user.dealer_profile.shop_name,
            "licence_number": current_user.dealer_profile.licence_number,
            "is_verified": current_user.dealer_profile.is_verified,
            "delivery_service_area": current_user.dealer_profile.delivery_service_area,
            "rating": float(current_user.dealer_profile.rating)
        }
    elif current_user.role == "buyer" and current_user.buyer_profile:
        profile_data = {
            "business_name": current_user.buyer_profile.business_name,
            "buyer_type": current_user.buyer_profile.buyer_type,
            "business_address": current_user.buyer_profile.business_address
        }
    elif current_user.role == "machinery_owner" and current_user.machinery_profile:
        profile_data = {
            "village": current_user.machinery_profile.village,
            "address": current_user.machinery_profile.address
        }

    return {
        "id": current_user.id,
        "name": current_user.name,
        "mobile": current_user.mobile,
        "email": current_user.email,
        "role": current_user.role,
        "preferred_language": current_user.preferred_language,
        "profile": profile_data
    }

@router.get("/demo-accounts")
def get_demo_accounts():
    """Returns convenient pre-configured demonstration accounts for quick evaluation."""
    return [
        {
            "role": "farmer",
            "name": "Ramasamy G. (ராமசாமி)",
            "mobile": "9876543210",
            "email": "farmer@uzhavar.in",
            "password": "Password123!",
            "village": "Natrampalli Pudur, Natrampalli Block",
            "tag": "Demo Farmer"
        },
        {
            "role": "dealer",
            "name": "Murugan Agro Agencies (முருகன் அக்ரோ)",
            "mobile": "9876543211",
            "email": "dealer.murugan@uzhavar.in",
            "password": "Password123!",
            "village": "Natrampalli Main Bazaar",
            "tag": "Verified Dealer A"
        },
        {
            "role": "dealer",
            "name": "Kaveri Krishi Kendra (காவேரி கிருஷி கேந்திரா)",
            "mobile": "9876543212",
            "email": "dealer.kaveri@uzhavar.in",
            "password": "Password123!",
            "village": "Pachur Road, Natrampalli",
            "tag": "Verified Dealer B"
        },
        {
            "role": "dealer",
            "name": "Tirupattur Farmers Fertilizer Depot",
            "mobile": "9876543213",
            "email": "dealer.tirupattur@uzhavar.in",
            "password": "Password123!",
            "village": "Tirupattur-Natrampalli Highway",
            "tag": "Verified Dealer C"
        },
        {
            "role": "buyer",
            "name": "Velan Agro Traders (வேலன் டிரேடர்ஸ்)",
            "mobile": "9876543214",
            "email": "buyer.velan@uzhavar.in",
            "password": "Password123!",
            "village": "Vaniyambadi-Natrampalli Mandi",
            "tag": "Wholesale Buyer"
        },
        {
            "role": "machinery_owner",
            "name": "Gowtham Farm Mechanization (கௌதம் பண்ணை இயந்திரங்கள்)",
            "mobile": "9876543215",
            "email": "machinery.gowtham@uzhavar.in",
            "password": "Password123!",
            "village": "Thoppalagunda, Natrampalli",
            "tag": "Machinery Owner"
        }
    ]
