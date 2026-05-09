from rest_framework import generics, permissions, viewsets
from rest_framework.throttling import ScopedRateThrottle

from apps.users.permissions import IsStoreAdmin

from .models import ContactMessage
from .serializers import ContactMessageSerializer


class ContactCreateView(generics.CreateAPIView):
    serializer_class = ContactMessageSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (ScopedRateThrottle,)
    throttle_scope = "contact"


class AdminContactViewSet(viewsets.ModelViewSet):
    serializer_class = ContactMessageSerializer
    permission_classes = (IsStoreAdmin,)
    queryset = ContactMessage.objects.all()
    filterset_fields = ("handled",)
