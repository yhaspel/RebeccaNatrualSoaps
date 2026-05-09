from django.conf import settings
from rest_framework import serializers

from apps.catalog.models import Product

from .models import Order, OrderItem


class CheckoutLineSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=50)


class CheckoutSerializer(serializers.Serializer):
    """Incoming checkout payload. Never trust its totals — we recompute."""

    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=120)
    phone = serializers.CharField(max_length=30, allow_blank=True, required=False)
    shipping_line1 = serializers.CharField(max_length=200)
    shipping_line2 = serializers.CharField(max_length=200, allow_blank=True, required=False)
    shipping_city = serializers.CharField(max_length=120)
    shipping_postal_code = serializers.CharField(max_length=30)
    shipping_country = serializers.CharField(max_length=2, default="IL")
    language = serializers.ChoiceField(choices=("en", "he"), default="en")
    items = CheckoutLineSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Cart is empty.")
        return value


class OrderItemReadSerializer(serializers.ModelSerializer):
    line_total_cents = serializers.IntegerField(read_only=True)

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "product_sku_snapshot",
            "product_name_en_snapshot",
            "product_name_he_snapshot",
            "product_image_snapshot",
            "unit_price_cents",
            "quantity",
            "line_total_cents",
        )


class OrderReadSerializer(serializers.ModelSerializer):
    items = OrderItemReadSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "email",
            "full_name",
            "phone",
            "shipping_line1",
            "shipping_line2",
            "shipping_city",
            "shipping_postal_code",
            "shipping_country",
            "subtotal_cents",
            "shipping_cents",
            "total_cents",
            "currency",
            "status",
            "grow_process_id",
            "created_at",
            "items",
        )
        read_only_fields = fields


def compute_shipping_cents(subtotal_cents: int) -> int:
    if subtotal_cents >= settings.SHIPPING_FREE_THRESHOLD_CENTS:
        return 0
    return settings.SHIPPING_FLAT_CENTS


def build_order_from_cart(
    data: dict,
    user=None,
) -> Order:
    """Create an Order (+ items) from validated checkout data.

    Totals are recomputed on the server from current DB prices, so a tampered
    client can't reduce what they pay.
    """
    items = data["items"]
    product_ids = [i["product_id"] for i in items]
    products = {
        p.id: p
        for p in Product.objects.filter(id__in=product_ids, is_active=True)
    }

    missing = [pid for pid in product_ids if pid not in products]
    if missing:
        raise serializers.ValidationError(
            {"items": f"Unavailable product(s): {missing}"}
        )

    subtotal = 0
    item_specs = []
    currency = settings.DEFAULT_CURRENCY
    for row in items:
        product = products[row["product_id"]]
        qty = row["quantity"]
        if qty > product.stock:
            raise serializers.ValidationError(
                {"items": f"Not enough stock for {product.sku}"}
            )
        subtotal += product.price_cents * qty
        currency = product.currency
        item_specs.append((product, qty))

    shipping = compute_shipping_cents(subtotal)
    total = subtotal + shipping

    order = Order.objects.create(
        user=user if user and user.is_authenticated else None,
        email=data["email"],
        full_name=data["full_name"],
        phone=data.get("phone", ""),
        shipping_line1=data["shipping_line1"],
        shipping_line2=data.get("shipping_line2", ""),
        shipping_city=data["shipping_city"],
        shipping_postal_code=data["shipping_postal_code"],
        shipping_country=data["shipping_country"],
        subtotal_cents=subtotal,
        shipping_cents=shipping,
        total_cents=total,
        currency=currency,
    )

    OrderItem.objects.bulk_create(
        [
            OrderItem(
                order=order,
                product=product,
                product_sku_snapshot=product.sku,
                product_name_en_snapshot=product.name_en,
                product_name_he_snapshot=product.name_he,
                product_image_snapshot=product.image_url,
                unit_price_cents=product.price_cents,
                quantity=qty,
            )
            for product, qty in item_specs
        ]
    )

    return order
