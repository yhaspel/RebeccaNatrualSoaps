from rest_framework import serializers

from .models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    body = serializers.CharField(min_length=10, max_length=2000)

    class Meta:
        model = ContactMessage
        fields = ("id", "name", "email", "subject", "body", "language", "created_at", "handled")
        read_only_fields = ("id", "created_at", "handled")
