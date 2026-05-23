"""Thin wrapper over Grow (Meshulam) with a mock fallback when keys aren't set.

Demo mode: if `GROW_API_KEY` is unset, we pretend Grow succeeded so the
checkout still flows end-to-end. Production-safe because it only triggers
when keys are literally empty strings.
"""
from __future__ import annotations

import uuid
from dataclasses import dataclass

import requests
from django.conf import settings

GROW_SANDBOX_URL = "https://sandbox.meshulam.co.il/api/light/server/1.0/"
GROW_PRODUCTION_URL = "https://secure.meshulam.co.il/api/light/server/1.0/"


def _base_url() -> str:
    if getattr(settings, "GROW_USE_SANDBOX", True):
        return GROW_SANDBOX_URL
    return GROW_PRODUCTION_URL


@dataclass
class PaymentPageResult:
    process_id: str
    process_token: str
    payment_page_link: str
    is_mock: bool = False


def is_mock() -> bool:
    return not bool(settings.GROW_API_KEY)


def create_payment_process(
    amount: float,
    currency: str,
    order_id: int,
    customer_name: str = "",
    customer_email: str = "",
    customer_phone: str = "",
    description: str = "",
) -> PaymentPageResult:
    """Create a Grow hosted payment page, or a mock one for dev."""
    if is_mock():
        uid = f"mock_grow_{uuid.uuid4().hex[:12]}"
        return PaymentPageResult(
            process_id=uid,
            process_token=f"{uid}_token",
            payment_page_link=(
                f"http://localhost:4333/checkout/success"
                f"?id={order_id}&mock=1&response=success"
            ),
            is_mock=True,
        )

    data = {
        "pageCode": settings.GROW_PAGE_CODE,
        "userId": settings.GROW_USER_ID,
        "sum": amount,
        "description": description or f"Order #{order_id}",
        "successUrl": f"{settings.GROW_REDIRECT_BASE}/checkout/success?id={order_id}",
        "cancelUrl": f"{settings.GROW_REDIRECT_BASE}/checkout?canceled=1",
        "notifyUrl": f"{settings.GROW_CALLBACK_BASE}/api/orders/grow-callback/",
        "pageField[fullName]": customer_name,
        "pageField[email]": customer_email,
        "pageField[phone]": customer_phone,
        "cField1": str(order_id),
        "chargeType": 1,
        "paymentNum": 1,
    }

    resp = requests.post(
        f"{_base_url()}createPaymentProcess",
        data=data,
        timeout=15,
    )
    resp.raise_for_status()
    result = resp.json()

    if result.get("status") != 1:
        raise RuntimeError(
            f"Grow createPaymentProcess failed: {result.get('err', {}).get('message', result)}"
        )

    return PaymentPageResult(
        process_id=str(result["data"]["processId"]),
        process_token=result["data"]["processToken"],
        payment_page_link=result["data"]["url"],
        is_mock=False,
    )


def approve_transaction(
    page_code: str,
    transaction_id: str,
    transaction_token: str,
    sum_amount: float,
) -> bool:
    """Approve a transaction after receiving the server callback."""
    if is_mock():
        return True

    data = {
        "pageCode": page_code or settings.GROW_PAGE_CODE,
        "transactionId": transaction_id,
        "transactionToken": transaction_token,
        "sum": sum_amount,
    }

    resp = requests.post(
        f"{_base_url()}approveTransaction",
        data=data,
        timeout=15,
    )
    resp.raise_for_status()
    result = resp.json()
    return result.get("status") == 1


def get_payment_process_info(process_id: str, process_token: str) -> dict:
    """Query Grow for the status of a payment process."""
    if is_mock() or process_id.startswith("mock_grow_"):
        return {"status": 1, "data": {"transactionStatus": "approved"}}

    data = {
        "pageCode": settings.GROW_PAGE_CODE,
        "processId": process_id,
        "processToken": process_token,
    }

    resp = requests.post(
        f"{_base_url()}getPaymentProcessInfo",
        data=data,
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()
