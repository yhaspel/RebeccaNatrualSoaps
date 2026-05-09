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
    category_slug = serializers.CharField(source="category.slug", read_only=True)

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


class AdminProductSerializer(ProductSerializer):
    """Writable product serializer for admin endpoints."""

    class Meta(ProductSerializer.Meta):
        read_only_fields = ("id",)
