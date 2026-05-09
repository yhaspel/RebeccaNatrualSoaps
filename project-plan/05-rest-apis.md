# 05 — Public + Auth REST APIs

All endpoints under `/api/`. JSON in, JSON out. Prices returned in cents; the client
divides by 100 only for display.

## Public (no auth required)
| Method | Path                               | Purpose |
|--------|------------------------------------|---------|
| GET    | `/api/catalog/categories/`         | List active categories with ordering |
| GET    | `/api/catalog/products/`           | List active products, filterable by `?category=<slug>`, `?featured=1`, `?search=` |
| GET    | `/api/catalog/products/<id>/`      | Product detail |
| POST   | `/api/contact/`                    | Submit contact form (validates, rate-limits by IP) |
| POST   | `/api/orders/checkout/`            | Create pending order + Grow payment page, returns `payment_page_link` |
| POST   | `/api/orders/confirm/`             | Mark a paid order after Grow callback (and set status=paid) |

## Authenticated
| Method | Path                             | Purpose |
|--------|----------------------------------|---------|
| GET    | `/api/orders/`                   | Current user's orders |
| GET    | `/api/orders/<id>/`              | Order detail (only owner or admin) |

## Auth
| Method | Path                          | Purpose |
|--------|-------------------------------|---------|
| POST   | `/api/auth/register/`         | Create account |
| POST   | `/api/auth/login/`            | Token pair |
| POST   | `/api/auth/refresh/`          | Refresh token |
| POST   | `/api/auth/logout/`           | Blacklist refresh token |
| GET    | `/api/auth/me/`               | Current user |
| POST   | `/api/auth/admin-login/`      | Login that requires `is_store_admin=True` |

## Response shape conventions
- Field names are `snake_case` server-side; the Angular core layer keeps them as-is
  inside models but the facade maps to camelCase for presentation.
- Errors use DRF standard (`{ "detail": "…" }` or field-keyed validation errors).

## Rate limiting
DRF's `UserRateThrottle` + `AnonRateThrottle` on auth and contact endpoints
(anon 10/min, user 60/min by default).
