import uuid
import datetime
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Quotation, Order, OrderItem, Payment, DealerProfile, DiseaseRequest
from app.schemas import OrderCreate, OrderOut
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/orders", tags=["Orders & Delivery Tracking"])

def serialize_order(o: Order) -> dict:
    return {
        "id": o.id,
        "order_number": o.order_number,
        "farmer_id": o.farmer_id,
        "farmer_name": o.farmer.name if o.farmer else "Farmer",
        "dealer_id": o.dealer_id,
        "dealer_shop_name": o.dealer.shop_name if o.dealer else "Dealer Shop",
        "dealer_mobile": o.dealer.user.mobile if o.dealer and o.dealer.user else "",
        "quotation_id": o.quotation_id,
        "subtotal": float(o.subtotal),
        "delivery_fee": float(o.delivery_fee),
        "taxes": float(o.taxes),
        "total_amount": float(o.total_amount),
        "delivery_address": o.delivery_address,
        "contact_mobile": o.contact_mobile,
        "status": o.status,
        "estimated_delivery_time": o.estimated_delivery_time,
        "delivery_notes": o.delivery_notes,
        "created_at": o.created_at,
        "updated_at": o.updated_at,
        "items": [
            {
                "id": it.id,
                "product_id": it.product_id,
                "product_name": it.product_name,
                "brand": it.brand,
                "quantity": it.quantity,
                "unit_price": float(it.unit_price),
                "total_price": float(it.total_price)
            } for it in o.items
        ],
        "payment": {
            "transaction_ref": o.payment.transaction_ref,
            "gateway": o.payment.gateway,
            "status": o.payment.status,
            "amount": float(o.payment.amount),
            "currency": o.payment.currency,
            "is_sandbox": o.payment.is_sandbox,
            "verified_at": o.payment.verified_at
        } if o.payment else None
    }

@router.post("")
def create_order_from_quotation(
    payload: OrderCreate,
    current_user: User = Depends(require_role(["farmer", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Farmer selects a dealer quotation and places an order.
    The order is created with status 'payment_pending'.
    """
    quote = db.query(Quotation).filter(Quotation.id == payload.quotation_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quotation not found")

    order_num = f"UN-{datetime.datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    new_order = Order(
        order_number=order_num,
        farmer_id=current_user.id,
        dealer_id=quote.dealer_id,
        quotation_id=quote.id,
        subtotal=quote.total_product_cost,
        delivery_fee=quote.delivery_fee,
        taxes=Decimal("0.00"),
        total_amount=quote.total_amount,
        delivery_address=payload.delivery_address.strip(),
        contact_mobile=payload.contact_mobile.strip(),
        status="payment_pending",
        estimated_delivery_time=f"Within {quote.estimated_delivery_hours} hours (Natrampalli Local Express)",
        delivery_notes=payload.delivery_notes
    )
    db.add(new_order)
    db.flush()

    for item in quote.items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=item.product_id,
            product_name=item.product_name,
            brand=item.brand,
            quantity=item.quantity,
            unit_price=item.unit_price,
            total_price=item.total_price
        )
        db.add(order_item)

    # Mark quotation as accepted
    quote.status = "accepted"

    # Update associated disease request status
    req = db.query(DiseaseRequest).filter(DiseaseRequest.id == quote.request_id).first()
    if req:
        req.status = "order_placed"

    db.commit()
    db.refresh(new_order)

    return serialize_order(new_order)

@router.get("/my")
def get_my_orders(
    current_user: User = Depends(require_role(["farmer", "admin"])),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).filter(
        Order.farmer_id == current_user.id
    ).order_by(Order.created_at.desc()).all()

    return [serialize_order(o) for o in orders]

@router.get("/{order_id}")
def get_order_by_id(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Access control: Farmer of order, or Dealer of order, or admin
    is_owner = (order.farmer_id == current_user.id)
    is_dealer = (current_user.dealer_profile and order.dealer_id == current_user.dealer_profile.id)
    if not (is_owner or is_dealer or current_user.role == "admin"):
        raise HTTPException(status_code=403, detail="Not authorized to view this order")

    return serialize_order(order)

@router.patch("/{order_id}/confirm-delivery")
def confirm_delivery_by_farmer(
    order_id: int,
    current_user: User = Depends(require_role(["farmer", "admin"])),
    db: Session = Depends(get_db)
):
    """Farmer confirms doorstep delivery of fertilizers/pesticides."""
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.farmer_id == current_user.id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = "delivered"
    order.delivery_notes = (order.delivery_notes or "") + " [Confirmed received by farmer at doorstep]"
    order.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(order)

    return {"message": "Delivery confirmed successfully by farmer", "order": serialize_order(order)}
