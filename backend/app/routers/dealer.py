from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, DealerProfile, DiseaseRequest, Quotation, QuotationItem, DealerAssessment, Order
from app.schemas import QuotationCreate, DealerAssessmentCreate, OrderStatusUpdate
from app.auth import get_current_user, require_role
from app.routers.disease import serialize_request, serialize_quotation

router = APIRouter(prefix="/api/dealer", tags=["Dealer Operations"])

@router.get("/disease-requests")
def get_incoming_disease_requests(
    current_user: User = Depends(require_role(["dealer", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Returns all disease requests submitted by farmers in the Natrampalli service area
    so this dealer can inspect them, review AI findings, and submit quotes.
    """
    requests = db.query(DiseaseRequest).order_by(DiseaseRequest.created_at.desc()).all()
    
    # Check if this dealer has already submitted an assessment or quotation for each
    dealer_profile = current_user.dealer_profile
    dealer_id = dealer_profile.id if dealer_profile else 0
    
    result = []
    for req in requests:
        req_data = serialize_request(req)
        has_quoted = any(q["dealer_id"] == dealer_id for q in req_data["quotations"])
        req_data["dealer_has_quoted"] = has_quoted
        result.append(req_data)
        
    return result

@router.post("/disease-requests/{request_id}/assessments")
def submit_dealer_assessment(
    request_id: int,
    payload: DealerAssessmentCreate,
    current_user: User = Depends(require_role(["dealer", "admin"])),
    db: Session = Depends(get_db)
):
    dealer_profile = current_user.dealer_profile
    if not dealer_profile:
        raise HTTPException(status_code=400, detail="Dealer profile required")

    req = db.query(DiseaseRequest).filter(DiseaseRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Disease request not found")

    assessment = DealerAssessment(
        request_id=request_id,
        dealer_id=dealer_profile.id,
        possible_disease=payload.possible_disease,
        assessment_notes=payload.assessment_notes,
        safety_precautions=payload.safety_precautions,
        application_instructions=payload.application_instructions
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return {
        "message": "Independent assessment submitted successfully",
        "assessment_id": assessment.id
    }

@router.post("/disease-requests/{request_id}/quotations")
def submit_dealer_quotation(
    request_id: int,
    payload: QuotationCreate,
    current_user: User = Depends(require_role(["dealer", "admin"])),
    db: Session = Depends(get_db)
):
    dealer_profile = current_user.dealer_profile
    if not dealer_profile:
        raise HTTPException(status_code=400, detail="Dealer profile required")

    req = db.query(DiseaseRequest).filter(DiseaseRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Disease request not found")

    if not payload.items:
        raise HTTPException(status_code=400, detail="Quotation must contain at least one recommended product")

    # Calculate totals
    total_prod = Decimal("0.00")
    for item in payload.items:
        total_prod += Decimal(str(item.unit_price)) * item.quantity

    delivery_fee = Decimal(str(payload.delivery_fee))
    total_amount = total_prod + delivery_fee

    quotation = Quotation(
        request_id=request_id,
        dealer_id=dealer_profile.id,
        status=payload.status,  # 'draft' or 'submitted'
        total_product_cost=total_prod,
        delivery_fee=delivery_fee,
        total_amount=total_amount,
        estimated_delivery_hours=payload.estimated_delivery_hours,
        validity_days=payload.validity_days,
        notes=payload.notes,
        is_demo=False
    )
    db.add(quotation)
    db.flush()

    for it in payload.items:
        q_item = QuotationItem(
            quotation_id=quotation.id,
            product_id=it.product_id,
            product_name=it.product_name,
            brand=it.brand,
            category=it.category,
            quantity=it.quantity,
            unit_price=Decimal(str(it.unit_price)),
            total_price=Decimal(str(it.unit_price)) * it.quantity
        )
        db.add(q_item)

    # Also record assessment notes if provided
    if payload.assessment_notes:
        assessment = DealerAssessment(
            request_id=request_id,
            dealer_id=dealer_profile.id,
            possible_disease=req.crop_name + " Treatment",
            assessment_notes=payload.assessment_notes,
            safety_precautions=payload.safety_precautions,
            application_instructions=payload.application_instructions
        )
        db.add(assessment)

    if payload.status == "submitted" and req.status == "submitted":
        req.status = "quotations_received"

    db.commit()
    db.refresh(quotation)

    return {
        "message": f"Quotation {'saved as draft' if payload.status == 'draft' else 'submitted to farmer'} successfully",
        "quotation": serialize_quotation(quotation)
    }

@router.get("/orders")
def get_dealer_orders(
    current_user: User = Depends(require_role(["dealer", "admin"])),
    db: Session = Depends(get_db)
):
    dealer_profile = current_user.dealer_profile
    if not dealer_profile:
        raise HTTPException(status_code=400, detail="Dealer profile required")

    orders = db.query(Order).filter(
        Order.dealer_id == dealer_profile.id
    ).order_by(Order.created_at.desc()).all()

    return [
        {
            "id": o.id,
            "order_number": o.order_number,
            "farmer_name": o.farmer.name if o.farmer else "Farmer",
            "contact_mobile": o.contact_mobile,
            "delivery_address": o.delivery_address,
            "subtotal": float(o.subtotal),
            "delivery_fee": float(o.delivery_fee),
            "total_amount": float(o.total_amount),
            "status": o.status,
            "estimated_delivery_time": o.estimated_delivery_time,
            "delivery_notes": o.delivery_notes,
            "created_at": o.created_at,
            "items": [
                {
                    "product_name": it.product_name,
                    "brand": it.brand,
                    "quantity": it.quantity,
                    "unit_price": float(it.unit_price),
                    "total_price": float(it.total_price)
                } for it in o.items
            ]
        } for o in orders
    ]

@router.patch("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    current_user: User = Depends(require_role(["dealer", "admin"])),
    db: Session = Depends(get_db)
):
    dealer_profile = current_user.dealer_profile
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.dealer_id == dealer_profile.id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found or not assigned to this dealer")

    valid_statuses = [
        "order_accepted",
        "preparing",
        "ready_for_dispatch",
        "out_for_delivery",
        "delivered",
        "cancelled"
    ]
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Choose from: {valid_statuses}")

    order.status = payload.status
    if payload.delivery_notes:
        order.delivery_notes = payload.delivery_notes
    if payload.estimated_delivery_time:
        order.estimated_delivery_time = payload.estimated_delivery_time

    db.commit()
    db.refresh(order)

    return {
        "message": f"Order status updated to {order.status}",
        "order_id": order.id,
        "new_status": order.status,
        "estimated_delivery_time": order.estimated_delivery_time,
        "delivery_notes": order.delivery_notes
    }
