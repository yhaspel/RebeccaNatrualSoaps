from rest_framework import serializers

from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            "id",
            "slug",
            "name_en",
            "name_he",
            "description_en",
            "description_he",
            "display_order",
        )


class ProductSerializer(serializers.ModelSerializer):
    """Public-facing serializer.

    `image_url` is computed: if an image was uploaded via the admin UI it
    returns the absolute URL of that file; otherwise it falls back to the
    legacy `image_url` string (used by seed data and external URLs). This
    keeps the response shape stable for the frontend while letting the
    admin form switch to file uploads.
    """

    category_slug = serializers.CharField(source="category.slug", read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "sku",
            "category",
            "category_slug",
            "name_en",
            "name_he",
            "description_en",
            "description_he",
            "ingredients_en",
            "ingredients_he",
            "price_cents",
            "currency",
            "stock",
            "image_url",
            "is_featured",
            "is_active",
        )

    def get_image_url(self, obj: Product) -> str:
        if obj.image:
            request = self.context.get("request")
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        return obj.image_url or ""


class AdminProductSerializer(ProductSerializer):
    """Writable product serializer for admin endpoints.

    Adds an `image` file field so the admin form can upload an image from
    the user's computer. The file is validated by Django's ImageField
    (which uses Pillow) — non-images and corrupt files are rejected.
    """

    image = serializers.ImageField(write_only=True, required=False, allow_null=True)

    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ("image",)
        read_only_fields = ("id",)
