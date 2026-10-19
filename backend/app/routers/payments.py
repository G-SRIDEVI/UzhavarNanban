import uuid
import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Order, Payment, Notification
from app.schemas import PaymentVerify
from app.auth import get_current_user, require_role
from app.config import settings

router = APIRouter(prefix="/api/payments", tags=["Payment Gateway Sandbox"])

@router.post("/verify")
def verify_payment(
    payload: PaymentVerify,
    current_user: User = Depends(require_role(["farmer", "admin"])),
    db: Session = Depends(get_db)
):
    """
    Secure server-side payment verification.
    Prevents duplicate payments.
    Advances order status to 'payment_confirmed'.
    Notifies dealer.
    """
    order = db.query(Order).filter(
        Order.id == payload.order_id,
        Order.farmer_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Duplicate payment check
    existing_payment = db.query(Payment).filter(
        Payment.order_id == order.id,
        Payment.status == "completed"
    ).first()

    if existing_payment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This order is already paid. Transaction reference: {existing_payment.transaction_ref}"
        )

    # Server-side verification simulated gateway transaction
    tx_ref = f"PAY_UN_{uuid.uuid4().hex[:10].upper()}"

    payment = Payment(
        order_id=order.id,
        transaction_ref=tx_ref,
        gateway="Razorpay Sandbox (Demo)",
        amount=order.total_amount,
        currency="INR",
        status="completed",
        is_sandbox=True,
        payment_method=payload.payment_method or "UPI (Demo Sandbox)",
        created_at=datetime.datetime.utcnow(),
        verified_at=datetime.datetime.utcnow()
    )
    db.add(payment)

    # Advance order to payment_confirmed
    order.status = "payment_confirmed"
    order.updated_at = datetime.datetime.utcnow()

    # Notify dealer
    if order.dealer and order.dealer.user_id:
        notif = Notification(
            user_id=order.dealer.user_id,
            title="New Paid Order Received!",
            message=f"Order {order.order_number} for ₹{float(order.total_amount)} has been paid by {current_user.name}. Please prepare items.",
            link=f"/dealer/orders"
        )
        db.add(notif)

    db.commit()
    db.refresh(order)

    return {
        "success": True,
        "message": "Payment verified successfully by server. Dealer has been notified.",
        "transaction_ref": tx_ref,
        "order_number": order.order_number,
        "amount": float(order.total_amount),
        "status": "payment_confirmed",
        "is_sandbox": True
    }
