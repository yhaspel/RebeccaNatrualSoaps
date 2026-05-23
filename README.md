# Rebecca's Natural Soaps

A bilingual (English / Hebrew, LTR / RTL) e-commerce MVP for a small-batch soap maker in Israel. Built as a Django REST backend + Angular 19 frontend monorepo.

## Stack

Backend: Django 5, Django REST Framework, SimpleJWT, django-filter, Grow/Meshulam (with mock fallback), SQLite (dev) / Postgres (prod).

Frontend: Angular 19 (standalone components, signals, lazy routes), Transloco for runtime i18n, Tailwind CSS for styling.

## Project layout

```
backend/                Django project (apps: users, catalog, orders, contact)
frontend/               Angular 19 SPA (core / abstraction / features layers)
project-plan/           Numbered plan steps + PROGRESS.md tracker
```

## Local setup

### Quickstart with Docker

From the repo root:

```bash
docker compose up --build
```

This starts both services with live reload (source mounted in):

- Frontend: http://localhost:4333
- Backend:  http://localhost:8777

The backend auto-runs `migrate` and `seed_catalog` on boot. To reset state, stop the stack and delete `backend/db.sqlite3`.

### 1. Backend (without Docker)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate           # Windows: .venv\Scripts\activate
pip install -r requirements/dev.txt

python manage.py makemigrations users catalog orders contact
python manage.py migrate
python manage.py seed_catalog       # 4 categories, 12 soaps, admin user
python manage.py runserver 0.0.0.0:8777
```

The seed creates a store admin:

- Username: `rebecca`
- Password: `ChangeMe123!`
- `is_store_admin = True`

Environment (optional, via `.env` next to `manage.py`):

```
DJANGO_SECRET_KEY=dev-secret
GROW_API_KEY=                    # leave empty for mock payments
GROW_PAGE_CODE=
GROW_USER_ID=
GROW_USE_SANDBOX=true
GROW_REDIRECT_BASE=http://localhost:4333
GROW_CALLBACK_BASE=http://localhost:8777
```

With `GROW_API_KEY` empty, checkout uses a local mock provider that skips the payment page redirect. Good enough to exercise the full flow without a Grow account.

### 2. Frontend (without Docker)

```bash
cd frontend
npm install
npm start                            # http://localhost:4333
```

API base URL lives in `src/environments/environment.ts` and defaults to `http://localhost:8777/api`.

## Key flows

- Public shop: `/`, `/products`, `/products/:id`, `/cart`, `/checkout`
- Customer auth: `/auth/login`, `/auth/register`, `/account`
- About + contact: `/about`, `/contact`
- Store admin: `/admin/login` → `/admin/products`, `/admin/orders`, `/admin/messages` (guarded by `is_store_admin`)
- Django's built-in admin lives at `/admin-django/` so the `/admin` route is free for our custom UI.

## Internationalisation

Both English and Hebrew live in `frontend/src/assets/i18n/{en,he}.json`. The `I18nFacade` writes `<html lang>` and `<html dir>` in response to the language signal, and Tailwind's `rtl:` variants plus CSS logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) handle RTL spacing. No UI string is hard-coded.

Bilingual product data is stored as twin columns (`name_en` / `name_he`, etc.) rather than via a translation plugin, which keeps API surface and admin forms straightforward. The `trField` pipe and the `I18nFacade.tr()` helper read the appropriate field based on the active language.

## Payments

`orders.payments.create_payment_process` creates a Grow (Meshulam) hosted payment page link when keys are configured, otherwise returns a mock redirect. The Grow server-to-server callback at `/api/orders/grow-callback/` approves the transaction and marks orders as paid. `OrdersApi.checkout` never trusts client totals: the server recomputes subtotal + shipping from current DB prices inside `build_order_from_cart`.

Grow supports עוסק פטור (exempt dealer) business type natively — no VAT invoicing required.

## Accessibility + Design

See `project-plan/22-accessibility-review.md` and `project-plan/23-design-critique.md` for findings and follow-ups.
