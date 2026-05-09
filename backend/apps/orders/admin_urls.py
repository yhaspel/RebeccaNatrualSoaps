from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("orders", views.AdminOrderViewSet, basename="admin-order")

urlpatterns = router.urls
