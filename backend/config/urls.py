"""Root URL configuration."""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health(_request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin-django/", admin.site.urls),  # moved so /admin is available for the Angular admin UI
    path("api/health/", health),
    path("api/auth/", include("apps.users.urls")),
    path("api/catalog/", include("apps.catalog.urls")),
    path("api/orders/", include("apps.orders.urls")),
    path("api/contact/", include("apps.contact.urls")),
    path("api/admin/", include("apps.catalog.admin_urls")),
    path("api/admin/", include("apps.orders.admin_urls")),
    path("api/admin/", include("apps.contact.admin_urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
