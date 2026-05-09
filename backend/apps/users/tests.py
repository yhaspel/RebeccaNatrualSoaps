import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory

from apps.users.permissions import IsStoreAdmin
from apps.users.serializers import (
    AdminTokenPairSerializer,
    RegisterSerializer,
    TokenPairSerializer,
    UserSerializer,
)

User = get_user_model()

# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestUserModel:
    def test_create_user_with_fields(self):
        u = User.objects.create_user(
            username="bob",
            email="bob@example.com",
            password="Str0ng!Pass",
            is_store_admin=True,
            preferred_language="he",
        )
        assert u.is_store_admin is True
        assert u.preferred_language == "he"

    def test_default_values(self):
        u = User.objects.create_user(
            username="alice", email="alice@example.com", password="Str0ng!Pass"
        )
        assert u.is_store_admin is False
        assert u.preferred_language == "en"

    def test_email_uniqueness(self):
        User.objects.create_user(
            username="u1", email="dup@example.com", password="Str0ng!Pass"
        )
        with pytest.raises(Exception):
            User.objects.create_user(
                username="u2", email="dup@example.com", password="Str0ng!Pass"
            )


# ---------------------------------------------------------------------------
# RegisterView
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestRegisterView:
    url = "/api/auth/register/"

    def test_success(self, api_client):
        resp = api_client.post(self.url, {
            "username": "newuser",
            "email": "new@example.com",
            "password": "Strong!Pass1",
            "first_name": "New",
            "last_name": "User",
        })
        assert resp.status_code == 201
        assert resp.data["username"] == "newuser"
        assert resp.data["email"] == "new@example.com"
        assert "password" not in resp.data

    def test_duplicate_email(self, api_client, user):
        resp = api_client.post(self.url, {
            "username": "other",
            "email": "test@example.com",
            "password": "Strong!Pass1",
        })
        assert resp.status_code == 400

    def test_weak_password(self, api_client):
        resp = api_client.post(self.url, {
            "username": "weak",
            "email": "weak@example.com",
            "password": "123",
        })
        assert resp.status_code == 400

    def test_missing_fields(self, api_client):
        resp = api_client.post(self.url, {})
        assert resp.status_code == 400


# ---------------------------------------------------------------------------
# LoginView
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestLoginView:
    url = "/api/auth/login/"

    def test_valid_credentials(self, api_client, user):
        resp = api_client.post(self.url, {
            "username": user.username,
            "password": "TestPass123!",
        })
        assert resp.status_code == 200
        assert "access" in resp.data
        assert "refresh" in resp.data
        assert resp.data["user"]["username"] == "testuser"

    def test_invalid_credentials(self, api_client, user):
        resp = api_client.post(self.url, {
            "username": user.username,
            "password": "WrongPass",
        })
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# AdminLoginView
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestAdminLoginView:
    url = "/api/auth/admin-login/"

    def test_admin_can_login(self, api_client, admin_user):
        resp = api_client.post(self.url, {
            "username": admin_user.username,
            "password": "AdminPass123!",
        })
        assert resp.status_code == 200
        assert "access" in resp.data

    def test_non_admin_rejected(self, api_client, user):
        resp = api_client.post(self.url, {
            "username": user.username,
            "password": "TestPass123!",
        })
        assert resp.status_code == 400


# ---------------------------------------------------------------------------
# MeView
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestMeView:
    url = "/api/auth/me/"

    def test_get_current_user(self, auth_client, user):
        resp = auth_client.get(self.url)
        assert resp.status_code == 200
        assert resp.data["username"] == user.username

    def test_patch_first_name(self, auth_client, user):
        resp = auth_client.patch(self.url, {"first_name": "Updated"})
        assert resp.status_code == 200
        assert resp.data["first_name"] == "Updated"

    def test_unauthenticated(self, api_client):
        resp = api_client.get(self.url)
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# IsStoreAdmin permission
# ---------------------------------------------------------------------------


class TestIsStoreAdminPermission:
    def _make_request(self, user=None):
        factory = APIRequestFactory()
        request = factory.get("/")
        request.user = user
        return request

    @pytest.mark.django_db
    def test_admin_allowed(self, admin_user):
        perm = IsStoreAdmin()
        request = self._make_request(admin_user)
        assert perm.has_permission(request, None) is True

    @pytest.mark.django_db
    def test_regular_user_denied(self, user):
        perm = IsStoreAdmin()
        request = self._make_request(user)
        assert perm.has_permission(request, None) is False

    def test_anonymous_denied(self):
        from django.contrib.auth.models import AnonymousUser
        perm = IsStoreAdmin()
        request = self._make_request(AnonymousUser())
        assert perm.has_permission(request, None) is False


# ---------------------------------------------------------------------------
# Serializers
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestSerializers:
    def test_user_serializer_fields(self, user):
        data = UserSerializer(user).data
        assert set(data.keys()) == {
            "id", "username", "email", "first_name", "last_name",
            "is_store_admin", "preferred_language",
        }

    def test_register_serializer_creates_hashed_password(self):
        ser = RegisterSerializer(data={
            "username": "hashtest",
            "email": "hash@example.com",
            "password": "Strong!Pass1",
        })
        assert ser.is_valid(), ser.errors
        u = ser.save()
        assert u.check_password("Strong!Pass1")
        assert u.password != "Strong!Pass1"

    def test_token_pair_serializer_custom_claims(self, user):
        token = TokenPairSerializer.get_token(user)
        assert token["is_store_admin"] == user.is_store_admin
        assert token["username"] == user.username

    def test_admin_token_pair_rejects_non_admin(self, user):
        ser = AdminTokenPairSerializer(data={
            "username": user.username,
            "password": "TestPass123!",
        })
        assert not ser.is_valid()
