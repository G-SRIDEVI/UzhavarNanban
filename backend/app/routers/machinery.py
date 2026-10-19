from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, MachineryListing, MachineryBooking, Notification
from app.schemas import MachineryListingCreate, MachineryBookingCreate
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/machinery", tags=["Agricultural Machinery Rental"])

def serialize_booking(b: MachineryBooking) -> dict:
    return {
        "id": b.id,
        "listing_id": b.listing_id,
        "equipment_name": b.machinery.equipment_name if b.machinery else "Machinery",
        "equipment_type": b.machinery.equipment_type if b.machinery else "",
        "owner_name": b.machinery.owner.name if b.machinery and b.machinery.owner else "Owner",
        "owner_mobile": b.machinery.owner.mobile if b.machinery and b.machinery.owner else "",
        "farmer_id": b.farmer_id,
        "farmer_name": b.farmer.name if b.farmer else "Farmer",
        "farmer_mobile": b.farmer.mobile if b.farmer else "",
        "start_date": b.start_date,
        "end_date": b.end_date,
        "duration_units": b.duration_units,
        "rate_type": b.rate_type,
        "total_amount": float(b.total_amount),
        "farm_location": b.farm_location,
        "status": b.status,
        "created_at": b.created_at
    }

def serialize_machinery(m: MachineryListing) -> dict:
    return {
        "id": m.id,
        "owner_id": m.owner_id,
        "owner_name": m.owner.name if m.owner else "Owner",
        "owner_mobile": m.owner.mobile if m.owner else "",
        "equipment_type": m.equipment_type,
        "equipment_name": m.equipment_name,
        "brand_model": m.brand_model,
        "hourly_rate": float(m.hourly_rate) if m.hourly_rate else None,
        "daily_rate": float(m.daily_rate) if m.daily_rate else None,
        "rate_type": m.rate_type,
        "availability_status": m.availability_status,
        "service_area": m.service_area,
        "booking_conditions": m.booking_conditions,
        "image_url": m.image_url,
        "created_at": m.created_at,
        "bookings": [serialize_booking(b) for b in m.bookings if b.status in ["pending", "accepted"]]
    }

@router.get("")
def browse_machinery(
    equipment_type: Optional[str] = Query(None),
    max_rate: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(MachineryListing).filter(MachineryListing.availability_status == True)
    if equipment_type and equipment_type != "All":
        query = query.filter(MachineryListing.equipment_type.ilike(f"%{equipment_type}%"))
    if max_rate:
        query = query.filter(
            (MachineryListing.hourly_rate <= Decimal(str(max_rate))) |
            (MachineryListing.daily_rate <= Decimal(str(max_rate)))
        )

    listings = query.order_by(MachineryListing.created_at.desc()).all()
    return [serialize_machinery(m) for m in listings]

@router.post("")
def create_machinery_listing(
    payload: MachineryListingCreate,
    current_user: User = Depends(require_role(["machinery_owner", "admin"])),
    db: Session = Depends(get_db)
):
    listing = MachineryListing(
        owner_id=current_user.id,
        equipment_type=payload.equipment_type.strip(),
        equipment_name=payload.equipment_name.strip(),
        brand_model=payload.brand_model.strip() if payload.brand_model else None,
        hourly_rate=Decimal(str(payload.hourly_rate)) if payload.hourly_rate else None,
        daily_rate=Decimal(str(payload.daily_rate)) if payload.daily_rate else None,
        rate_type=payload.rate_type,
        availability_status=True,
        service_area=payload.service_area or "Natrampalli Block",
        booking_conditions=payload.booking_conditions,
        image_url=payload.image_url
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return serialize_machinery(listing)

@router.get("/my")
def get_my_machinery(
    current_user: User = Depends(require_role(["machinery_owner", "admin"])),
    db: Session = Depends(get_db)
):
    listings = db.query(MachineryListing).filter(
        MachineryListing.owner_id == current_user.id
    ).all()
    return [serialize_machinery(m) for m in listings]

@router.post("/{listing_id}/bookings")
def book_machinery(
    listing_id: int,
    payload: MachineryBookingCreate,
    current_user: User = Depends(require_role(["farmer", "admin"])),
    db: Session = Depends(get_db)
):
    listing = db.query(MachineryListing).filter(MachineryListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Machinery listing not found")

    # Overlapping booking prevention: check confirmed/accepted bookings for same dates
    overlapping = db.query(MachineryBooking).filter(
        MachineryBooking.listing_id == listing_id,
        MachineryBooking.status == "accepted",
        MachineryBooking.start_date <= payload.end_date,
        MachineryBooking.end_date >= payload.start_date
    ).first()

    if overlapping:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This equipment is already booked from {overlapping.start_date} to {overlapping.end_date}. Please choose different dates."
        )

    # Compute booking cost
    if payload.rate_type == "daily" and listing.daily_rate:
        total_amount = listing.daily_rate * payload.duration_units
    elif listing.hourly_rate:
        total_amount = listing.hourly_rate * payload.duration_units
    else:
        total_amount = Decimal("1500.00")

    booking = MachineryBooking(
        listing_id=listing.id,
        farmer_id=current_user.id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        duration_units=payload.duration_units,
        rate_type=payload.rate_type,
        total_amount=total_amount,
        farm_location=payload.farm_location.strip(),
        status="pending"
    )
    db.add(booking)

    # Notify owner
    notif = Notification(
        user_id=listing.owner_id,
        title="New Machinery Booking Request!",
        message=f"{current_user.name} requested to book {listing.equipment_name} for {payload.start_date} ({payload.duration_units} {payload.rate_type}s).",
        link="/machinery/bookings"
    )
    db.add(notif)

    db.commit()
    db.refresh(booking)
    return serialize_booking(booking)

@router.get("/bookings/my")
def get_farmer_bookings(
    current_user: User = Depends(require_role(["farmer", "admin"])),
    db: Session = Depends(get_db)
):
    bookings = db.query(MachineryBooking).filter(
        MachineryBooking.farmer_id == current_user.id
    ).order_by(MachineryBooking.created_at.desc()).all()
    return [serialize_booking(b) for b in bookings]

@router.get("/owner-bookings")
def get_owner_incoming_bookings(
    current_user: User = Depends(require_role(["machinery_owner", "admin"])),
    db: Session = Depends(get_db)
):
    owner_listings = db.query(MachineryListing.id).filter(
        MachineryListing.owner_id == current_user.id
    ).subquery()

    bookings = db.query(MachineryBooking).filter(
        MachineryBooking.listing_id.in_(owner_listings)
    ).order_by(MachineryBooking.created_at.desc()).all()

    return [serialize_booking(b) for b in bookings]

@router.patch("/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    status_value: str = Query(..., pattern="^(accepted|rejected|completed|cancelled)$"),
    current_user: User = Depends(require_role(["machinery_owner", "admin"])),
    db: Session = Depends(get_db)
):
    booking = db.query(MachineryBooking).filter(MachineryBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking.machinery.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to manage this booking")

    booking.status = status_value

    # Notify farmer
    notif = Notification(
        user_id=booking.farmer_id,
        title=f"Machinery Booking {status_value.capitalize()}!",
        message=f"Your booking for {booking.machinery.equipment_name} has been {status_value} by {current_user.name}.",
        link="/farmer/machinery"
    )
    db.add(notif)

    db.commit()
    db.refresh(booking)
    return {"message": f"Booking marked as {status_value}", "booking": serialize_booking(booking)}
