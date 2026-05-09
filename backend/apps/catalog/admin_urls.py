from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("products", views.AdminProductViewSet, basename="admin-product")
router.register("categories", views.AdminCategoryViewSet, basename="admin-category")

urlpatterns = router.urls
