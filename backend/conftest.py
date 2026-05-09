import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.catalog.models import Category, Product

User = get_user_model()


@pytest.fixture(autouse=True)
def _disable_throttling(settings):
    settings.REST_FRAMEWORK = {
        **settings.REST_FRAMEWORK,
        "DEFAULT_THROTTLE_CLASSES": [],
        "DEFAULT_THROTTLE_RATES": {
            "anon": "9999/min",
            "user": "9999/min",
            "contact": "9999/min",
            "auth": "9999/min",
        },
    }


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="TestPass123!",
    )


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username="adminuser",
        email="admin@example.com",
        password="AdminPass123!",
        is_store_admin=True,
    )


@pytest.fixture
def auth_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def admin_client(admin_user):
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client


@pytest.fixture
def category(db):
    return Category.objects.create(
        slug="soap",
        name_en="Soap",
        name_he="סבון",
        display_order=1,
    )


@pytest.fixture
def product(category):
    return Product.objects.create(
        category=category,
        sku="SOAP-001",
        name_en="Lavender Soap",
        name_he="סבון לבנדר",
        description_en="A lovely lavender soap",
        description_he="סבון לבנדר נפלא",
        price_cents=5000,
        stock=10,
        is_active=True,
    )


@pytest.fixture
def product2(category):
    return Product.objects.create(
        category=category,
        sku="SOAP-002",
        name_en="Rose Soap",
        name_he="סבון ורדים",
        description_en="A lovely rose soap",
        description_he="סבון ורדים נפלא",
        price_cents=15000,
        stock=5,
        is_featured=True,
        is_active=True,
    )
