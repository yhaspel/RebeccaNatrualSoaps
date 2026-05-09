import pytest
from django.contrib.auth import get_user_model

from apps.catalog.models import Category, Product
from apps.catalog.serializers import AdminProductSerializer, ProductSerializer

User = get_user_model()

# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestCategoryModel:
    def test_create(self):
        cat = Category.objects.create(slug="oil", name_en="Oil", name_he="שמן", display_order=2)
        assert cat.slug == "oil"

    def test_ordering(self):
        Category.objects.create(slug="b", name_en="B", name_he="ב", display_order=2)
        Category.objects.create(slug="a", name_en="A", name_he="א", display_order=1)
        slugs = list(Category.objects.values_list("slug", flat=True))
        assert slugs == ["a", "b"]


@pytest.mark.django_db
class TestProductModel:
    def test_create(self, product):
        assert product.sku == "SOAP-001"
        assert product.price_cents == 5000
        assert product.is_active is True

    def test_defaults(self, category):
        p = Product.objects.create(
            category=category, sku="T", name_en="T", name_he="T",
            description_en="d", description_he="d", price_cents=100,
        )
        assert p.stock == 0
        assert p.is_featured is False
        assert p.is_active is True
        assert p.currency == "ILS"

    def test_ordering(self, product, product2):
        # is_featured desc, then created_at desc — product2 is featured
        pks = list(Product.objects.values_list("pk", flat=True))
        assert pks[0] == product2.pk


# ---------------------------------------------------------------------------
# Public views
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestCategoryListView:
    url = "/api/catalog/categories/"

    def test_returns_all(self, api_client, category):
        resp = api_client.get(self.url)
        assert resp.status_code == 200
        assert isinstance(resp.data, list)
        assert len(resp.data) == 1


@pytest.mark.django_db
class TestProductListView:
    url = "/api/catalog/products/"

    def test_returns_active_only(self, api_client, product, product2):
        product2.is_active = False
        product2.save()
        resp = api_client.get(self.url)
        assert resp.status_code == 200
        ids = [p["id"] for p in resp.data["results"]]
        assert product.id in ids
        assert product2.id not in ids

    def test_filter_by_category_slug(self, api_client, product):
        resp = api_client.get(self.url, {"category__slug": "soap"})
        assert resp.status_code == 200
        assert len(resp.data["results"]) == 1

    def test_filter_by_featured(self, api_client, product, product2):
        resp = api_client.get(self.url, {"is_featured": True})
        assert resp.status_code == 200
        assert all(p["is_featured"] for p in resp.data["results"])

    def test_search_by_name(self, api_client, product):
        resp = api_client.get(self.url, {"search": "Lavender"})
        assert resp.status_code == 200
        assert len(resp.data["results"]) >= 1

    def test_pagination(self, api_client, product):
        resp = api_client.get(self.url)
        assert "results" in resp.data
        assert "count" in resp.data


@pytest.mark.django_db
class TestProductDetailView:
    def test_returns_product(self, api_client, product):
        resp = api_client.get(f"/api/catalog/products/{product.pk}/")
        assert resp.status_code == 200
        assert resp.data["sku"] == "SOAP-001"

    def test_inactive_returns_404(self, api_client, product):
        product.is_active = False
        product.save()
        resp = api_client.get(f"/api/catalog/products/{product.pk}/")
        assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Admin views
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestAdminProductViewSet:
    url = "/api/admin/products/"

    def test_list_includes_inactive(self, admin_client, product):
        product.is_active = False
        product.save()
        resp = admin_client.get(self.url)
        assert resp.status_code == 200
        ids = [p["id"] for p in resp.data["results"]]
        assert product.id in ids

    def test_create(self, admin_client, category):
        resp = admin_client.post(self.url, {
            "category": category.pk,
            "sku": "NEW-001",
            "name_en": "New",
            "name_he": "חדש",
            "description_en": "desc",
            "description_he": "תיאור",
            "price_cents": 9900,
        })
        assert resp.status_code == 201

    def test_update(self, admin_client, product):
        resp = admin_client.patch(
            f"{self.url}{product.pk}/",
            {"price_cents": 7777},
        )
        assert resp.status_code == 200
        assert resp.data["price_cents"] == 7777

    def test_soft_delete(self, admin_client, product):
        resp = admin_client.delete(f"{self.url}{product.pk}/")
        assert resp.status_code == 204
        product.refresh_from_db()
        assert product.is_active is False

    def test_non_admin_forbidden(self, auth_client):
        resp = auth_client.get(self.url)
        assert resp.status_code == 403


@pytest.mark.django_db
class TestAdminCategoryViewSet:
    url = "/api/admin/categories/"

    def test_list_requires_admin(self, auth_client):
        resp = auth_client.get(self.url)
        assert resp.status_code == 403

    def test_crud(self, admin_client):
        # create
        resp = admin_client.post(self.url, {
            "slug": "oil", "name_en": "Oil", "name_he": "שמן", "display_order": 5,
        })
        assert resp.status_code == 201
        pk = resp.data["id"]
        # read
        resp = admin_client.get(f"{self.url}{pk}/")
        assert resp.status_code == 200
        # update
        resp = admin_client.patch(f"{self.url}{pk}/", {"name_en": "Oils"})
        assert resp.status_code == 200
        assert resp.data["name_en"] == "Oils"
        # delete
        resp = admin_client.delete(f"{self.url}{pk}/")
        assert resp.status_code == 204


# ---------------------------------------------------------------------------
# Serializers
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestCatalogSerializers:
    def test_product_serializer_has_category_slug(self, product):
        data = ProductSerializer(product).data
        assert data["category_slug"] == "soap"

    def test_admin_product_serializer_writable(self):
        ser = AdminProductSerializer()
        assert "id" in ser.Meta.read_only_fields
        # category should be writable (not in read_only)
        assert "category" not in ser.Meta.read_only_fields
