import os
import uuid
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models import User, DiseaseRequest, DiseaseImage, AIReport, DealerAssessment, Quotation, QuotationItem
from app.schemas import DiseaseRequestOut, QuotationOut, QuotationItemOut, AIReportOut, DealerAssessmentOut
from app.auth import get_current_user, require_role
from app.ai_service import analyze_plant_image

router = APIRouter(prefix="/api/disease-requests", tags=["Plant Disease Diagnosis"])

def serialize_quotation(q: Quotation) -> dict:
    return {
        "id": q.id,
        "request_id": q.request_id,
        "dealer_id": q.dealer_id,
        "dealer_name": q.dealer.user.name if q.dealer and q.dealer.user else "Dealer",
        "shop_name": q.dealer.shop_name if q.dealer else "Agro Care",
        "dealer_rating": float(q.dealer.rating) if q.dealer and q.dealer.rating else 4.8,
        "dealer_verified": q.dealer.is_verified if q.dealer else True,
        "service_area": q.dealer.delivery_service_area if q.dealer else "Natrampalli Block",
        "status": q.status,
        "total_product_cost": q.total_product_cost,
        "delivery_fee": q.delivery_fee,
        "total_amount": q.total_amount,
        "estimated_delivery_hours": q.estimated_delivery_hours,
        "validity_days": q.validity_days,
        "notes": q.notes,
        "is_demo": q.is_demo,
        "created_at": q.created_at,
        "items": [
            {
                "id": it.id,
                "product_id": it.product_id,
                "product_name": it.product_name,
                "brand": it.brand,
                "category": it.category,
                "quantity": it.quantity,
                "unit_price": it.unit_price,
                "total_price": it.total_price
            } for it in q.items
        ]
    }

def serialize_request(req: DiseaseRequest) -> dict:
    return {
        "id": req.id,
        "farmer_id": req.farmer_id,
        "farmer_name": req.farmer.name if req.farmer else "Farmer",
        "farmer_mobile": req.farmer.mobile if req.farmer else "",
        "crop_name": req.crop_name,
        "symptoms_description": req.symptoms_description,
        "affected_part": req.affected_part,
        "village": req.village,
        "delivery_address": req.delivery_address,
        "status": req.status,
        "created_at": req.created_at,
        "images": [img.file_path for img in req.images],
        "ai_report": {
            "id": req.ai_report.id,
            "possible_disease": req.ai_report.possible_disease,
            "tamil_name": req.ai_report.tamil_name,
            "confidence": req.ai_report.confidence,
            "problem_type": req.ai_report.problem_type,
            "symptoms_detected": req.ai_report.symptoms_detected,
            "preventive_measures": req.ai_report.preventive_measures,
            "recommended_next_steps": req.ai_report.recommended_next_steps,
            "requires_expert_review": req.ai_report.requires_expert_review,
            "is_simulated": req.ai_report.is_simulated,
            "created_at": req.ai_report.created_at
        } if req.ai_report else None,
        "assessments": [
            {
                "id": a.id,
                "dealer_id": a.dealer_id,
                "dealer_name": a.dealer.user.name if a.dealer and a.dealer.user else "Dealer",
                "shop_name": a.dealer.shop_name if a.dealer else "Shop",
                "possible_disease": a.possible_disease,
                "assessment_notes": a.assessment_notes,
                "safety_precautions": a.safety_precautions,
                "application_instructions": a.application_instructions,
                "created_at": a.created_at
            } for a in req.assessments
        ],
        "quotations": [serialize_quotation(q) for q in req.quotations if q.status != "draft"]
    }

@router.post("")
async def create_disease_request(
    crop_name: str = Form(...),
    symptoms_description: str = Form(...),
    affected_part: str = Form("Leaf"),
    village: Optional[str] = Form("Natrampalli"),
    delivery_address: str = Form(...),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(require_role(["farmer", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Farmer submits plant symptoms and uploads photograph.
    Triggers AI Plant Doctor diagnosis and distributes request to nearby dealers in Natrampalli.
    """
    new_request = DiseaseRequest(
        farmer_id=current_user.id,
        crop_name=crop_name.strip(),
        symptoms_description=symptoms_description.strip(),
        affected_part=affected_part.strip(),
        village=village.strip() if village else "Natrampalli",
        delivery_address=delivery_address.strip(),
        status="submitted"
    )
    db.add(new_request)
    db.flush()

    saved_image_path = None
    if image and image.filename:
        # Validate file extension
        ext = os.path.splitext(image.filename)[1].lower()
        if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only JPEG, PNG, or WebP plant photos are allowed."
            )
        
        filename = f"plant_{new_request.id}_{uuid.uuid4().hex[:8]}{ext}"
        destination = settings.UPLOAD_DIR / filename
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        web_path = f"/uploads/{filename}"
        saved_image_path = str(destination)
        
        img_record = DiseaseImage(
            request_id=new_request.id,
            file_path=web_path
        )
        db.add(img_record)

    # Run AI Plant Doctor analysis
    ai_result = analyze_plant_image(
        image_path=saved_image_path if saved_image_path else "",
        crop_name=crop_name,
        symptoms_desc=symptoms_description
    )

    ai_report = AIReport(
        request_id=new_request.id,
        possible_disease=ai_result["possible_disease"],
        tamil_name=ai_result.get("tamil_name"),
        confidence=ai_result["confidence"],
        problem_type=ai_result["problem_type"],
        symptoms_detected=ai_result["symptoms_detected"],
        preventive_measures=ai_result["preventive_measures"],
        recommended_next_steps=ai_result["recommended_next_steps"],
        requires_expert_review=ai_result["requires_expert_review"],
        is_simulated=ai_result["is_simulated"]
    )
    db.add(ai_report)
    db.commit()
    db.refresh(new_request)

    return serialize_request(new_request)

@router.get("/my")
def get_my_disease_requests(
    current_user: User = Depends(require_role(["farmer", "admin"])),
    db: Session = Depends(get_db)
):
    requests = db.query(DiseaseRequest).filter(
        DiseaseRequest.farmer_id == current_user.id
    ).order_by(DiseaseRequest.created_at.desc()).all()
    
    return [serialize_request(r) for r in requests]

@router.get("/{request_id}")
def get_disease_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(DiseaseRequest).filter(DiseaseRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Disease request not found")
    
    return serialize_request(req)

@router.get("/{request_id}/quotations")
def get_request_quotations(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns all dealer quotations for the farmer to compare."""
    req = db.query(DiseaseRequest).filter(DiseaseRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Disease request not found")

    quotes = db.query(Quotation).filter(
        Quotation.request_id == request_id,
        Quotation.status != "draft"
    ).all()

    return [serialize_quotation(q) for q in quotes]

@router.post("/{request_id}/images")
async def add_disease_image(
    request_id: int,
    image: UploadFile = File(...),
    current_user: User = Depends(require_role(["farmer", "admin"])),
    db: Session = Depends(get_db)
):
    req = db.query(DiseaseRequest).filter(
        DiseaseRequest.id == request_id,
        DiseaseRequest.farmer_id == current_user.id
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found or access denied")

    ext = os.path.splitext(image.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(status_code=400, detail="Invalid image file format")

    filename = f"plant_{req.id}_{uuid.uuid4().hex[:8]}{ext}"
    dest = settings.UPLOAD_DIR / filename
    with open(dest, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    img_record = DiseaseImage(
        request_id=req.id,
        file_path=f"/uploads/{filename}"
    )
    db.add(img_record)
    db.commit()

    return {"message": "Image uploaded successfully", "file_path": f"/uploads/{filename}"}
