from rest_framework.permissions import BasePermission


class IsStoreAdmin(BasePermission):
    """Allow only users with `is_store_admin=True`."""

    message = "Store admin access required."

    def has_permission(self, request, view) -> bool:
        user = getattr(request, "user", None)
        return bool(user and user.is_authenticated and user.is_store_admin)
