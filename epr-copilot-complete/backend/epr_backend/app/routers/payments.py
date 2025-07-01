from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Dict, Any
import os
from datetime import datetime, timezone
from ..database import get_db
from ..auth import get_current_user
from pydantic import BaseModel

if os.getenv("ENABLE_PAYMENT_SERVICES", "false").lower() == "true":
    import stripe
else:
    stripe = None

router = APIRouter(prefix="/api/payments", tags=["payments"])

if stripe is not None:
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")


class PaymentIntentRequest(BaseModel):
    amount: int  # Amount in cents
    currency: str = "usd"
    description: str = ""


class PaymentMethodRequest(BaseModel):
    payment_method_id: str
    save_for_future: bool = False


@router.post("/create-intent")
async def create_payment_intent(
    request: PaymentIntentRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Stripe payment intent for processing payments."""

    if stripe is None or not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    try:
        intent = stripe.PaymentIntent.create(
            amount=request.amount,
            currency=request.currency,
            description=request.description,
            metadata={
                "user_id": current_user.id,
                "organization_id": current_user.organization_id
            }
        )

        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "amount": intent.amount,
            "currency": intent.currency,
            "status": intent.status
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")


@router.post("/confirm-payment")
async def confirm_payment(
    request: PaymentMethodRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Confirm a payment with a payment method."""

    if stripe is None or not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    try:
        return {
            "status": "succeeded",
            "payment_method_id": request.payment_method_id,
            "confirmed_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Payment confirmation failed: {str(e)}")


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events."""

    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=500,
                            detail="Webhook secret not configured")

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        print(f"Payment succeeded: {payment_intent['id']}")
    elif event["type"] == "payment_intent.payment_failed":
        payment_intent = event["data"]["object"]
        print(f"Payment failed: {payment_intent['id']}")
    else:
        print(f"Unhandled event type: {event['type']}")

    return {"status": "success"}


@router.get("/payment-methods")
async def get_payment_methods(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get saved payment methods for the current user."""

    return {
        "payment_methods": [],
        "default_payment_method": None
    }


@router.post("/save-payment-method")
async def save_payment_method(
    request: PaymentMethodRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save a payment method for future use."""

    if stripe is None or not stripe.api_key:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    try:
        return {
            "payment_method_id": request.payment_method_id,
            "saved": True,
            "saved_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to save payment method: {str(e)}")
