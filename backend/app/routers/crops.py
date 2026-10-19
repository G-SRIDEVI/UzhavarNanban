from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, CropListing, BuyerOffer, Notification
from app.schemas import CropListingCreate, BuyerOfferCreate, CropListingOut, BuyerOfferOut
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/crop-listings", tags=["Direct Farmer-to-Buyer Crop Marketplace"])

def serialize_offer(offer: BuyerOffer) -> dict:
    return {
        "id": offer.id,
        "listing_id": offer.listing_id,
        "crop_name": offer.listing.crop_name if offer.listing else "Crop",
        "buyer_id": offer.buyer_id,
        "buyer_name": offer.buyer.name if offer.buyer else "Buyer",
        "buyer_business_name": offer.buyer.buyer_profile.business_name if offer.buyer and offer.buyer.buyer_profile else "",
        "buyer_mobile": offer.buyer.mobile if offer.buyer else "",
        "offered_price_per_unit": float(offer.offered_price_per_unit),
        "total_offered_amount": float(offer.total_offered_amount),
        "message": offer.message,
        "status": offer.status,
        "created_at": offer.created_at
    }

def serialize_crop(crop: CropListing) -> dict:
    return {
        "id": crop.id,
        "farmer_id": crop.farmer_id,
        "farmer_name": crop.farmer.name if crop.farmer else "Farmer",
        "farmer_mobile": crop.farmer.mobile if crop.farmer else "",
        "crop_name": crop.crop_name,
        "variety": crop.variety,
        "available_quantity": float(crop.available_quantity),
        "unit": crop.unit,
        "expected_price": float(crop.expected_price),
        "harvest_date": crop.harvest_date,
        "village": crop.village,
        "pickup_preference": crop.pickup_preference,
        "image_url": crop.image_url,
        "status": crop.status,
        "created_at": crop.created_at,
        "offers": [serialize_offer(o) for o in crop.offers]
    }

@router.get("")
def browse_crops(
    crop: Optional[str] = Query(None),
    village: Optional[str] = Query(None),
    max_price: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(CropListing).filter(CropListing.status == "active")
    if crop:
        query = query.filter(CropListing.crop_name.ilike(f"%{crop}%"))
    if village:
        query = query.filter(CropListing.village.ilike(f"%{village}%"))
    if max_price:
        query = query.filter(CropListing.expected_price <= Decimal(str(max_price)))

    crops = query.order_by(CropListing.created_at.desc()).all()
    return [serialize_crop(c) for c in crops]

@router.post("")
def create_crop_listing(
    payload: CropListingCreate,
    current_user: User = Depends(require_role(["farmer", "admin"])),
    db: Session = Depends(get_db)
):
    listing = CropListing(
        farmer_id=current_user.id,
        crop_name=payload.crop_name.strip(),
        variety=payload.variety.strip() if payload.variety else None,
        available_quantity=Decimal(str(payload.available_quantity)),
        unit=payload.unit,
        expected_price=Decimal(str(payload.expected_price)),
        harvest_date=payload.harvest_date,
        village=payload.village or "Natrampalli",
        pickup_preference=payload.pickup_preference or "Farm Gate Pickup",
        image_url=payload.image_url,
        status="active"
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return serialize_crop(listing)

@router.get("/my")
def get_my_crops(
    current_user: User = Depends(require_role(["farmer", "admin"])),
    db: Session = Depends(get_db)
):
    crops = db.query(CropListing).filter(
        CropListing.farmer_id == current_user.id
    ).order_by(CropListing.created_at.desc()).all()
    return [serialize_crop(c) for c in crops]

@router.post("/{listing_id}/offers")
def make_buyer_offer(
    listing_id: int,
    payload: BuyerOfferCreate,
    current_user: User = Depends(require_role(["buyer", "admin"])),
    db: Session = Depends(get_db)
):
    listing = db.query(CropListing).filter(CropListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Crop listing not found")

    unit_price = Decimal(str(payload.offered_price_per_unit))
    total_amount = unit_price * listing.available_quantity

    offer = BuyerOffer(
        listing_id=listing.id,
        buyer_id=current_user.id,
        offered_price_per_unit=unit_price,
        total_offered_amount=total_amount,
        message=payload.message,
        status="pending"
    )
    db.add(offer)

    # Notify farmer
    notif = Notification(
        user_id=listing.farmer_id,
        title="New Purchase Offer Received!",
        message=f"{current_user.name} offered ₹{float(unit_price)}/{listing.unit} for your {listing.crop_name}.",
        link="/farmer/crops"
    )
    db.add(notif)

    db.commit()
    db.refresh(offer)
    return serialize_offer(offer)

@router.get("/offers/my")
def get_my_sent_offers(
    current_user: User = Depends(require_role(["buyer", "admin"])),
    db: Session = Depends(get_db)
):
    offers = db.query(BuyerOffer).filter(
        BuyerOffer.buyer_id == current_user.id
    ).order_by(BuyerOffer.created_at.desc()).all()
    return [serialize_offer(o) for o in offers]

@router.patch("/offers/{offer_id}/status")
def update_offer_status(
    offer_id: int,
    status_value: str = Query(..., pattern="^(accepted|rejected)$"),
    current_user: User = Depends(require_role(["farmer", "admin"])),
    db: Session = Depends(get_db)
):
    offer = db.query(BuyerOffer).filter(BuyerOffer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    if offer.listing.farmer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to respond to this offer")

    offer.status = status_value
    if status_value == "accepted":
        offer.listing.status = "sold"

    # Notify buyer
    notif = Notification(
        user_id=offer.buyer_id,
        title=f"Offer {status_value.capitalize()}!",
        message=f"Farmer {current_user.name} has {status_value} your purchase offer for {offer.listing.crop_name}.",
        link="/buyer/offers"
    )
    db.add(notif)

    db.commit()
    db.refresh(offer)
    return {"message": f"Offer {status_value} successfully", "offer": serialize_offer(offer)}
