import pytest
from django.contrib.auth import get_user_model
from rest_framework import serializers as drf_serializers

from apps.catalog.models import Product
from apps.orders.models import Order, OrderItem
from apps.orders.serializers import (
    CheckoutSerializer,
    build_order_from_cart,
    compute_shipping_cents,
)
from apps.orders import payments

User = get_user_model()


def _checkout_data(product, quantity=1, **overrides):
    base = {
        "email": "buyer@example.com",
        "full_name": "Test Buyer",
        "phone": "0501234567",
        "shipping_line1": "123 Main St",
        "shipping_city": "Tel Aviv",
        "shipping_postal_code": "12345",
        "shipping_country": "IL",
        "items": [{"product_id": product.pk, "quantity": quantity}],
    }
    base.update(overrides)
    return base


# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestOrderModel:
    def test_create(self, product):
        order = Order.objects.create(
            email="a@b.com", full_name="A",
            shipping_line1="x", shipping_city="y",
            shipping_postal_code="z", shipping_country="IL",
            subtotal_cents=5000, total_cents=8000,
        )
        assert order.status == Order.Status.PENDING_PAYMENT
        assert order.currency == "ILS"

    def test_status_choices(self):
        valid = {c[0] for c in Order.Status.choices}
        assert "paid" in valid
        assert "fulfilled" in valid
        assert "canceled" in valid


@pytest.mark.django_db
class TestOrderItemModel:
    def test_line_total_cents(self):
        item = OrderItem(unit_price_cents=1000, quantity=3)
        assert item.line_total_cents == 3000


# ---------------------------------------------------------------------------
# CheckoutSerializer
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestCheckoutSerializer:
    def test_valid(self, product):
        ser = CheckoutSerializer(data=_checkout_data(product))
        assert ser.is_valid(), ser.errors

    def test_empty_items(self, product):
        data = _checkout_data(product)
        data["items"] = []
        ser = CheckoutSerializer(data=data)
        assert not ser.is_valid()

    def test_invalid_quantity(self, product):
        data = _checkout_data(product)
        data["items"] = [{"product_id": product.pk, "quantity": 0}]
        ser = CheckoutSerializer(data=data)
        assert not ser.is_valid()


# ---------------------------------------------------------------------------
# build_order_from_cart
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestBuildOrderFromCart:
    def test_creates_order_and_items(self, product):
        data = _checkout_data(product, quantity=2)
        ser = CheckoutSerializer(data=data)
        ser.is_valid(raise_exception=True)
        order = build_order_from_cart(ser.validated_data)
        assert order.subtotal_cents == 10000
        assert order.items.count() == 1

    def test_recomputes_prices_from_db(self, product):
        data = _checkout_data(product, quantity=1)
        ser = CheckoutSerializer(data=data)
        ser.is_valid(raise_exception=True)
        order = build_order_from_cart(ser.validated_data)
        assert order.subtotal_cents == product.price_cents

    def test_free_shipping_over_threshold(self, product):
        # product.price_cents=5000, need >=20000 subtotal => qty=4
        data = _checkout_data(product, quantity=4)
        ser = CheckoutSerializer(data=data)
        ser.is_valid(raise_exception=True)
        order = build_order_from_cart(ser.validated_data)
        assert order.shipping_cents == 0
        assert order.total_cents == 20000

    def test_flat_shipping_under_threshold(self, product):
        data = _checkout_data(product, quantity=1)
        ser = CheckoutSerializer(data=data)
        ser.is_valid(raise_exception=True)
        order = build_order_from_cart(ser.validated_data)
        assert order.shipping_cents == 3000
        assert order.total_cents == 5000 + 3000

    def test_unavailable_product_raises(self, product):
        product.is_active = False
        product.save()
        data = _checkout_data(product)
        ser = CheckoutSerializer(data=data)
        ser.is_valid(raise_exception=True)
        with pytest.raises(drf_serializers.ValidationError, match="Unavailable"):
            build_order_from_cart(ser.validated_data)

    def test_insufficient_stock_raises(self, product):
        # product has stock=10, request 20 but max_value on serializer is 50
        data = _checkout_data(product, quantity=20)
        ser = CheckoutSerializer(data=data)
        ser.is_valid(raise_exception=True)
        with pytest.raises(drf_serializers.ValidationError, match="stock"):
            build_order_from_cart(ser.validated_data)


# ---------------------------------------------------------------------------
# compute_shipping_cents
# ---------------------------------------------------------------------------


class TestComputeShipping:
    def test_free_over_threshold(self):
        assert compute_shipping_cents(20000) == 0

    def test_flat_under_threshold(self):
        assert compute_shipping_cents(19999) == 3000


# ---------------------------------------------------------------------------
# CheckoutView
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestCheckoutView:
    url = "/api/orders/checkout/"

    def test_creates_order(self, api_client, product):
        resp = api_client.post(self.url, _checkout_data(product), format="json")
        assert resp.status_code == 201
        assert "order_id" in resp.data
        assert "payment_page_link" in resp.data
        assert resp.data["is_mock"] is True


# ---------------------------------------------------------------------------
# ConfirmView
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestConfirmView:
    url = "/api/orders/confirm/"

    def test_mock_auto_approves(self, api_client, product):
        # first create an order
        co_resp = api_client.post(
            "/api/orders/checkout/", _checkout_data(product), format="json"
        )
        order_id = co_resp.data["order_id"]

        resp = api_client.post(self.url, {"order_id": order_id}, format="json")
        assert resp.status_code == 200
        assert resp.data["status"] == "paid"

    def test_missing_order_id(self, api_client):
        resp = api_client.post(self.url, {}, format="json")
        assert resp.status_code == 400


# ---------------------------------------------------------------------------
# GrowCallbackView
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestGrowCallbackView:
    url = "/api/orders/grow-callback/"

    def test_missing_order_identifier(self, api_client):
        resp = api_client.post(self.url, {}, format="json")
        assert resp.status_code == 400
        assert "missing" in resp.data["detail"]

    def test_already_paid(self, api_client, product):
        co_resp = api_client.post(
            "/api/orders/checkout/", _checkout_data(product), format="json"
        )
        order = Order.objects.get(pk=co_resp.data["order_id"])
        order.status = Order.Status.PAID
        order.save()

        resp = api_client.post(self.url, {
            "customFields": {"cField1": str(order.pk)},
            "transactionId": "123",
            "transactionToken": "tok",
            "sum": 50,
        }, format="json")
        assert resp.status_code == 200
        assert "already paid" in resp.data["detail"]


# ---------------------------------------------------------------------------
# MyOrdersView
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestMyOrdersView:
    url = "/api/orders/mine/"

    def test_returns_user_orders(self, auth_client, user, product):
        data = _checkout_data(product)
        ser = CheckoutSerializer(data=data)
        ser.is_valid(raise_exception=True)
        build_order_from_cart(ser.validated_data, user=user)

        resp = auth_client.get(self.url)
        assert resp.status_code == 200
        assert resp.data["count"] >= 1

    def test_requires_auth(self, api_client):
        resp = api_client.get(self.url)
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# OrderDetailView
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestOrderDetailView:
    def _create_order(self, product, user=None):
        data = _checkout_data(product)
        ser = CheckoutSerializer(data=data)
        ser.is_valid(raise_exception=True)
        return build_order_from_cart(ser.validated_data, user=user)

    def test_user_sees_own_order(self, auth_client, user, product):
        order = self._create_order(product, user=user)
        resp = auth_client.get(f"/api/orders/{order.pk}/")
        assert resp.status_code == 200

    def test_admin_sees_any_order(self, admin_client, product):
        order = self._create_order(product)
        resp = admin_client.get(f"/api/orders/{order.pk}/")
        assert resp.status_code == 200

    def test_user_cannot_see_others_order(self, auth_client, product):
        order = self._create_order(product)  # no user
        resp = auth_client.get(f"/api/orders/{order.pk}/")
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# AdminOrderViewSet
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestAdminOrderViewSet:
    url = "/api/admin/orders/"

    def test_list(self, admin_client, product):
        data = _checkout_data(product)
        ser = CheckoutSerializer(data=data)
        ser.is_valid(raise_exception=True)
        build_order_from_cart(ser.validated_data)

        resp = admin_client.get(self.url)
        assert resp.status_code == 200

    def test_update_status(self, admin_client, product):
        data = _checkout_data(product)
        ser = CheckoutSerializer(data=data)
        ser.is_valid(raise_exception=True)
        order = build_order_from_cart(ser.validated_data)

        resp = admin_client.patch(
            f"{self.url}{order.pk}/", {"status": "fulfilled"}, format="json"
        )
        assert resp.status_code == 200
        assert resp.data["status"] == "fulfilled"

    def test_non_admin_forbidden(self, auth_client):
        resp = auth_client.get(self.url)
        assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Payments module
# ---------------------------------------------------------------------------


class TestPaymentsModule:
    def test_is_mock_when_key_empty(self, settings):
        settings.GROW_API_KEY = ""
        assert payments.is_mock() is True

    def test_is_mock_false_when_key_set(self, settings):
        settings.GROW_API_KEY = "real-key"
        assert payments.is_mock() is False

    def test_create_payment_process_mock(self, settings):
        settings.GROW_API_KEY = ""
        result = payments.create_payment_process(
            amount=50, currency="ILS", order_id=1,
        )
        assert result.is_mock is True
        assert result.process_id.startswith("mock_grow_")
        assert "payment_page_link" != ""

    def test_approve_transaction_mock(self, settings):
        settings.GROW_API_KEY = ""
        assert payments.approve_transaction("", "t1", "tok", 50.0) is True

    def test_get_payment_process_info_mock(self, settings):
        settings.GROW_API_KEY = ""
        info = payments.get_payment_process_info("mock_grow_abc", "tok")
        assert info["data"]["transactionStatus"] == "approved"
