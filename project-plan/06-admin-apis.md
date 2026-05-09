# 06 — Admin APIs

All admin endpoints require JWT auth **and** `is_store_admin=True` via `IsStoreAdmin`.

## Products
| Method | Path                              | Purpose |
|--------|-----------------------------------|---------|
| GET    | `/api/admin/products/`            | Paginated list (includes inactive) |
| POST   | `/api/admin/products/`            | Create product |
| GET    | `/api/admin/products/<id>/`       | Retrieve |
| PATCH  | `/api/admin/products/<id>/`       | Partial update |
| DELETE | `/api/admin/products/<id>/`       | Soft delete (sets `is_active=False`) |

Write payload accepts both English and Hebrew fields:
```json
{
  "category": 3,
  "sku": "LAV-OLI-01",
  "name_en": "Lavender Olive Soap",
  "name_he": "סבון זית לבנדר",
  "description_en": "…",
  "description_he": "…",
  "price_cents": 3500,
  "currency": "ILS",
  "stock": 42,
  "image_url": "https://…",
  "is_featured": true
}
```

## Categories
| Method | Path                              | Purpose |
|--------|-----------------------------------|---------|
| GET    | `/api/admin/categories/`          | List |
| POST   | `/api/admin/categories/`          | Create (rare — the four categories ship seeded) |
| PATCH  | `/api/admin/categories/<id>/`     | Rename / reorder |

## Orders
| Method | Path                              | Purpose |
|--------|-----------------------------------|---------|
| GET    | `/api/admin/orders/`              | All orders, filterable by status |
| PATCH  | `/api/admin/orders/<id>/`         | Change status (e.g. paid → fulfilled) |

## Contact messages
| Method | Path                              | Purpose |
|--------|-----------------------------------|---------|
| GET    | `/api/admin/contact/`             | List messages |
| PATCH  | `/api/admin/contact/<id>/`        | Mark handled |
