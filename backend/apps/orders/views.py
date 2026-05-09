from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.permissions import IsStoreAdmin

from .models import Order
from . import payments
from .serializers import (
    CheckoutSerializer,
    OrderReadSerializer,
    build_order_from_cart,
)


def _mark_paid(order):
    """Set order to PAID and decrement stock."""
    order.status = Order.Status.PAID
    order.save(update_fields=["status", "updated_at"])
    for item in order.items.select_related("product"):
        if item.product:
            item.product.stock = max(0, item.product.stock - item.quantity)
            item.product.save(update_fields=["stock", "updated_at"])


class CheckoutView(APIView):
    """Create a pending order + Grow payment page and return the link."""

    permission_classes = (permissions.AllowAny,)

    @transaction.atomic
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = build_order_from_cart(serializer.validated_data, user=request.user)
        result = payments.create_payment_process(
            amount=order.total_cents / 100,
            currency=order.currency,
            order_id=order.id,
            customer_name=order.full_name,
            customer_email=order.email,
            customer_phone=order.phone,
            description=f"Rebecca's Natural Soaps — Order #{order.id}",
        )
        order.grow_process_id = result.process_id
        order.grow_process_token = result.process_token
        order.save(update_fields=["grow_process_id", "grow_process_token", "updated_at"])

        return Response(
            {
                "order_id": order.id,
                "payment_page_link": result.payment_page_link,
                "is_mock": result.is_mock,
                "total_cents": order.total_cents,
                "currency": order.currency,
            },
            status=status.HTTP_201_CREATED,
        )


class GrowCallbackView(APIView):
    """Server-to-server callback from Grow — approve and mark order paid."""

    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        data = request.data
        order_id = data.get("customFields", {}).get("cField1", "") if isinstance(data.get("customFields"), dict) else data.get("cField1", "")
        transaction_id = str(data.get("transactionId", ""))
        transaction_token = data.get("transactionToken", "")
        payment_sum = data.get("sum", 0)

        if not order_id:
            return Response({"detail": "missing order identifier"}, status=400)

        order = get_object_or_404(Order, pk=order_id)

        if order.status == Order.Status.PAID:
            return Response({"detail": "already paid"})

        # Approve the transaction with Grow
        payments.approve_transaction(
            page_code="",  # uses settings default
            transaction_id=transaction_id,
            transaction_token=transaction_token,
            sum_amount=float(payment_sum),
        )

        order.grow_transaction_id = transaction_id
        order.status = Order.Status.PAID
        order.save(update_fields=["status", "grow_transaction_id", "updated_at"])

        for item in order.items.select_related("product"):
            if item.product:
                item.product.stock = max(0, item.product.stock - item.quantity)
                item.product.save(update_fields=["stock", "updated_at"])

        return Response({"detail": "ok"})


class ConfirmView(APIView):
    """Check order status — used by frontend after redirect back from Grow."""

    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        order_id = request.data.get("order_id")
        if not order_id:
            return Response({"detail": "order_id required"}, status=400)

        order = get_object_or_404(Order, pk=order_id)

        if order.status == Order.Status.PAID:
            return Response(OrderReadSerializer(order).data)

        # In mock mode, auto-approve
        if payments.is_mock() or order.grow_process_id.startswith("mock_grow_"):
            _mark_paid(order)
            return Response(OrderReadSerializer(order).data)

        # In live mode the IPN callback should have already marked it paid.
        # Double-check with Grow if needed.
        info = payments.get_payment_process_info(
            order.grow_process_id, order.grow_process_token,
        )
        tx_status = info.get("data", {}).get("transactionStatus", "")
        if tx_status == "approved":
            _mark_paid(order)
            return Response(OrderReadSerializer(order).data)

        return Response(
            {"detail": f"Payment not confirmed (status={tx_status})."},
            status=status.HTTP_402_PAYMENT_REQUIRED,
        )


class MyOrdersView(generics.ListAPIView):
    serializer_class = OrderReadSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .prefetch_related("items")
            .order_by("-created_at")
        )


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderReadSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        qs = Order.objects.prefetch_related("items")
        if self.request.user.is_store_admin:
            return qs
        return qs.filter(user=self.request.user)


# --- Admin -----------------------------------------------------------------

class AdminOrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderReadSerializer
    permission_classes = (IsStoreAdmin,)
    queryset = Order.objects.prefetch_related("items").all()
    filterset_fields = ("status",)
    ordering_fields = ("created_at", "total_cents")

    def update(self, request, *args, **kwargs):
        order = self.get_object()
        new_status = request.data.get("status")
        if new_status and new_status in dict(Order.Status.choices):
            order.status = new_status
            order.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(order).data)

    partial_update = update
