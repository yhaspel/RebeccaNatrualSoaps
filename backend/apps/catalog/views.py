from rest_framework import generics, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from apps.users.permissions import IsStoreAdmin

from .models import Category, Product
from .serializers import AdminProductSerializer, CategorySerializer, ProductSerializer


# --- Public views ---------------------------------------------------------

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = None


class ProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = (permissions.AllowAny,)
    filterset_fields = ("category__slug", "is_featured")
    search_fields = ("name_en", "name_he", "description_en", "description_he")
    ordering_fields = ("price_cents", "created_at")

    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related("category")


class ProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductSerializer
    permission_classes = (permissions.AllowAny,)
    queryset = Product.objects.filter(is_active=True).select_related("category")


# --- Admin ViewSet --------------------------------------------------------

class AdminProductViewSet(viewsets.ModelViewSet):
    serializer_class = AdminProductSerializer
    permission_classes = (IsStoreAdmin,)
    # Accept JSON for fields-only updates and multipart when an image file
    # is included. FormParser is added so the admin can submit either way.
    parser_classes = (JSONParser, MultiPartParser, FormParser)
    queryset = Product.objects.select_related("category").all()
    filterset_fields = ("category__slug", "is_active", "is_featured")
    search_fields = ("name_en", "name_he", "sku")
    ordering_fields = ("created_at", "price_cents", "stock")

    def destroy(self, request, *args, **kwargs):
        """Soft delete — keep product rows so past orders still resolve."""
        product = self.get_object()
        product.is_active = False
        product.save(update_fields=["is_active", "updated_at"])
        return Response(status=204)


class AdminCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = (IsStoreAdmin,)
    queryset = Category.objects.all()
