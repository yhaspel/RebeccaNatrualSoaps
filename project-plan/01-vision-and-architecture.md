# 01 — Vision & Architecture

## Product vision
Rebecca's Natural Soaps is a bilingual (English / Hebrew) e‑commerce site for handcrafted
natural soaps. Shoppers should feel the same warmth as a small-batch artisan brand like
[lilyrosenatural.com](https://lilyrosenatural.com) — calm palette, generous whitespace,
soft photography, copy that sounds like a person rather than a brand.

## Primary user journeys
1. Browse soaps by category (Tallow / Olive Oil / Vegan / Specials) → open a product →
   add to cart → check out with a credit card.
2. Read **About Rebecca's** and feel the artisan story before buying.
3. Contact Rebecca via a form on **Contact Us**.
4. Switch language between English and Hebrew at any time; layout flips to RTL in Hebrew.
5. Rebecca (admin) logs in at **/admin** and adds, edits, or removes soaps with an easy UI.

## Architecture (high level)
```
┌──────────────────────────┐         ┌───────────────────────────┐
│  Angular 19 (SPA)        │  HTTPS  │  Django 5 + DRF           │
│  Standalone components   │ ◀─────▶ │  JWT auth, SimpleJWT      │
│  Signals state           │         │  PostgreSQL (prod)        │
│  Transloco i18n (EN/HE)  │         │  SQLite (dev)             │
│  Tailwind + SCSS         │         │  Grow (Meshulam) API      │
└──────────────────────────┘         └───────────────────────────┘
         │                                        │
         └────────── served by nginx ─────────────┘
```

### Front-end (3-layer architecture)
- **Core** — pure services, models, guards, HTTP interceptors, Grow payment helper.
- **Abstraction (facades)** — all signal state lives here; `AuthFacade`, `CartFacade`,
  `CatalogFacade`, `AdminFacade`, `I18nFacade`.
- **Features (presentation)** — dumb components: `home`, `products`, `product-detail`,
  `cart`, `checkout`, `auth`, `about`, `contact`, `account`, `admin`.

### Back-end (Django apps)
- `apps.users` — custom `User(AbstractUser)` with `is_store_admin`.
- `apps.catalog` — `Category`, `Product`.
- `apps.orders` — `Order`, `OrderItem`, `PaymentIntent` record.
- `apps.contact` — `ContactMessage`.

## Key non-functional requirements
- **No hardcoded UI strings.** Everything routed through translation keys.
- **RTL parity.** Use CSS logical properties + Tailwind's `rtl:` variants; every
  layout primitive must work in both directions.
- **Accessibility.** WCAG 2.1 AA as the bar; keyboard nav, visible focus, proper
  landmarks, alt text, labeled controls.
- **Single source of truth for price.** Server computes totals; client never trusts
  its own cart sum for payment amount.
