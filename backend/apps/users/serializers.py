from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_store_admin",
            "preferred_language",
        )
        read_only_fields = ("id", "is_store_admin")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
    )

    class Meta:
        model = User
        fields = ("username", "email", "password", "first_name", "last_name")

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class TokenPairSerializer(TokenObtainPairSerializer):
    """Adds user claims + payload to the token response."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["is_store_admin"] = user.is_store_admin
        token["username"] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class AdminTokenPairSerializer(TokenPairSerializer):
    """Login serializer that rejects non-admins before issuing a token."""

    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.is_store_admin:
            raise serializers.ValidationError(
                {"detail": "This account is not a store admin."}
            )
        return data
