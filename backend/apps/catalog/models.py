from django.db import models


class Category(models.Model):
    slug = models.SlugField(unique=True, max_length=50)
    name_en = models.CharField(max_length=80)
    name_he = models.CharField(max_length=80)
    description_en = models.TextField(blank=True)
    description_he = models.TextField(blank=True)
    display_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("display_order", "slug")
        verbose_name_plural = "categories"

    def __str__(self) -> str:  # pragma: no cover - trivial
        return f"{self.name_en} ({self.slug})"


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        related_name="products",
        on_delete=models.PROTECT,
    )
    sku = models.CharField(max_length=40, unique=True)
    name_en = models.CharField(max_length=120)
    name_he = models.CharField(max_length=120)
    description_en = models.TextField()
    description_he = models.TextField()
    ingredients_en = models.TextField(blank=True)
    ingredients_he = models.TextField(blank=True)
    price_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default="ILS")
    stock = models.PositiveIntegerField(default=0)
    # `image` is the canonical, admin-uploaded image. `image_url` is kept for
    # backwards compatibility with seed data that references frontend assets
    # or external URLs; the serializer prefers `image` and falls back to
    # `image_url` so existing rows continue to render.
    image = models.ImageField(upload_to="products/", blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-is_featured", "-created_at")

    def __str__(self) -> str:  # pragma: no cover - trivial
        return f"{self.sku} · {self.name_en}"
