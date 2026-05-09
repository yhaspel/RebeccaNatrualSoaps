from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("contact", views.AdminContactViewSet, basename="admin-contact")

urlpatterns = router.urls
