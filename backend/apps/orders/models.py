from django.conf import settings
from django.db import models


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING_PAYMENT = "pending_payment", "Pending payment"
        PAID = "paid", "Paid"
        FULFILLED = "fulfilled", "Fulfilled"
        CANCELED = "canceled", "Canceled"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="orders",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    email = models.EmailField()
    full_name = models.CharField(max_length=120)
    phone = models.CharField(max_length=30, blank=True)

    shipping_line1 = models.CharField(max_length=200)
    shipping_line2 = models.CharField(max_length=200, blank=True)
    shipping_city = models.CharField(max_length=120)
    shipping_postal_code = models.CharField(max_length=30)
    shipping_country = models.CharField(max_length=2, default="IL")

    subtotal_cents = models.PositiveIntegerField()
    shipping_cents = models.PositiveIntegerField(default=0)
    total_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default="ILS")

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING_PAYMENT,
    )
    grow_process_id = models.CharField(max_length=120, blank=True)
    grow_process_token = models.CharField(max_length=200, blank=True)
    grow_transaction_id = models.CharField(max_length=120, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(
        "catalog.Product",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    product_sku_snapshot = models.CharField(max_length=40)
    product_name_en_snapshot = models.CharField(max_length=120)
    product_name_he_snapshot = models.CharField(max_length=120)
    product_image_snapshot = models.URLField(max_length=500, blank=True)
    unit_price_cents = models.PositiveIntegerField()
    quantity = models.PositiveIntegerField()

    @property
    def line_total_cents(self) -> int:
        return self.unit_price_cents * self.quantity
