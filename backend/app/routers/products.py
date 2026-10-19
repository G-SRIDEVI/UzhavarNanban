from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Product, DealerProfile
from app.schemas import ProductCreate, ProductOut
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/products", tags=["Agrochemical Products Catalog"])

@router.get("", response_model=List[ProductOut])
def get_products(
    category: Optional[str] = Query(None),
    dealer_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.is_active == True)
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    if dealer_id:
        query = query.filter(Product.dealer_id == dealer_id)
    if search:
        query = query.filter(
            (Product.name.ilike(f"%{search}%")) |
            (Product.brand.ilike(f"%{search}%")) |
            (Product.active_ingredient.ilike(f"%{search}%"))
        )
    return query.all()

@router.get("/my", response_model=List[ProductOut])
def get_dealer_products(
    current_user: User = Depends(require_role(["dealer", "admin"])),
    db: Session = Depends(get_db)
):
    dealer_profile = current_user.dealer_profile
    if not dealer_profile:
        raise HTTPException(status_code=400, detail="Dealer profile required")
    return db.query(Product).filter(Product.dealer_id == dealer_profile.id).all()

@router.post("", response_model=ProductOut)
def create_product(
    payload: ProductCreate,
    current_user: User = Depends(require_role(["dealer", "admin"])),
    db: Session = Depends(get_db)
):
    dealer_profile = current_user.dealer_profile
    if not dealer_profile:
        raise HTTPException(status_code=400, detail="Dealer profile required")

    # If product is regulated, ensure dealer is verified
    if payload.is_regulated and not dealer_profile.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Regulated chemical products can only be listed by verified dealers with valid licence verification."
        )

    product = Product(
        dealer_id=dealer_profile.id,
        name=payload.name.strip(),
        brand=payload.brand.strip(),
        category=payload.category.strip(),
        active_ingredient=payload.active_ingredient.strip() if payload.active_ingredient else None,
        description=payload.description,
        unit=payload.unit,
        unit_price=Decimal(str(payload.unit_price)),
        stock_quantity=payload.stock_quantity,
        is_regulated=payload.is_regulated,
        image_url=payload.image_url
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.patch("/{product_id}")
def update_product(
    product_id: int,
    stock_quantity: Optional[int] = None,
    unit_price: Optional[Decimal] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(require_role(["dealer", "admin"])),
    db: Session = Depends(get_db)
):
    dealer_profile = current_user.dealer_profile
    prod = db.query(Product).filter(
        Product.id == product_id,
        Product.dealer_id == dealer_profile.id
    ).first()

    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    if stock_quantity is not None:
        prod.stock_quantity = stock_quantity
    if unit_price is not None:
        prod.unit_price = Decimal(str(unit_price))
    if is_active is not None:
        prod.is_active = is_active

    db.commit()
    db.refresh(prod)
    return {"message": "Product updated successfully", "product_id": prod.id}
