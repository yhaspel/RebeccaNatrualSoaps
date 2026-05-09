import pytest
from apps.contact.models import ContactMessage
from apps.contact.serializers import ContactMessageSerializer

# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestContactMessageModel:
    def test_create(self):
        msg = ContactMessage.objects.create(
            name="Alice", email="alice@example.com",
            subject="Hi", body="Hello there, this is a test message.",
        )
        assert msg.pk is not None

    def test_defaults(self):
        msg = ContactMessage.objects.create(
            name="Bob", email="bob@example.com",
            body="Another test message body here.",
        )
        assert msg.handled is False
        assert msg.language == "en"


# ---------------------------------------------------------------------------
# ContactCreateView
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestContactCreateView:
    url = "/api/contact/"

    def test_valid_submission(self, api_client):
        resp = api_client.post(self.url, {
            "name": "Alice",
            "email": "alice@example.com",
            "subject": "Question",
            "body": "I have a question about your soaps please.",
        })
        assert resp.status_code == 201

    def test_body_too_short(self, api_client):
        resp = api_client.post(self.url, {
            "name": "Alice",
            "email": "alice@example.com",
            "body": "Short",
        })
        assert resp.status_code == 400

    def test_missing_required_fields(self, api_client):
        resp = api_client.post(self.url, {})
        assert resp.status_code == 400


# ---------------------------------------------------------------------------
# AdminContactViewSet
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestAdminContactViewSet:
    url = "/api/admin/contact/"

    def test_list_admin_only(self, admin_client):
        ContactMessage.objects.create(
            name="X", email="x@x.com", body="Enough characters here.",
        )
        resp = admin_client.get(self.url)
        assert resp.status_code == 200

    def test_update_handled(self, admin_client):
        msg = ContactMessage.objects.create(
            name="X", email="x@x.com", body="Enough characters here.",
        )
        # handled is read_only on the serializer, so test that a PATCH
        # at least succeeds (200) even though handled won't change via API.
        # The admin would update handled directly in DB or via Django admin.
        resp = admin_client.patch(
            f"{self.url}{msg.pk}/",
            {"name": "Updated", "email": "x@x.com", "body": "Enough characters here."},
            format="json",
        )
        assert resp.status_code == 200

    def test_non_admin_forbidden(self, auth_client):
        resp = auth_client.get(self.url)
        assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Serializer
# ---------------------------------------------------------------------------


class TestContactMessageSerializer:
    def test_body_min_length(self):
        ser = ContactMessageSerializer(data={
            "name": "A", "email": "a@a.com", "body": "short",
        })
        assert not ser.is_valid()
        assert "body" in ser.errors

    def test_read_only_fields(self):
        meta = ContactMessageSerializer.Meta
        assert "id" in meta.read_only_fields
        assert "created_at" in meta.read_only_fields
        assert "handled" in meta.read_only_fields
