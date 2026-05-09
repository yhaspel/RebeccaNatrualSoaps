# 07 — Payments (Grow / Meshulam)

## Why Grow (Meshulam)
- PCI-compliant via Grow hosted payment page — the shopper enters card details
  on Grow's page, never on our site.
- Native Hebrew / RTL support on the hosted payment page.
- Test mode available; no live merchant credentials needed to demo.

## Backend pieces
- `requests` for Grow API calls.
- `GROW_API_KEY`, `GROW_PAGE_CODE` read via `python-decouple` → environment
  variables. Missing keys fall through to a **mock provider** so the demo still
  runs end-to-end without a Grow account.

## Checkout flow
```
 client                 server                Grow (Meshulam)
   │  POST /orders/checkout/  (cart, shipping) │
   │ ─────────────────────▶  │                 │
   │                         │ create Order(PENDING_PAYMENT)
   │                         │ compute server total
   │                         │ Grow API → generate payment page link
   │                         │  ◀── payment_page_link + process_id ──
   │  ◀── { order_id, payment_page_link } ──  │
   │                                           │
   │  redirect to Grow hosted payment page     │
   │ ─────────────────────────────────────▶  Grow
   │  ◀──────── redirect back (success) ─────  │
   │  POST /orders/confirm/  (order_id)        │
   │ ─────────────────────▶  │                 │
   │                         │ verify with Grow API, set Order.status=PAID
```

## Mock provider (demo mode)
When `GROW_API_KEY` is unset, `/orders/checkout/` returns
`payment_page_link = "mock"` and `/orders/confirm/` simply flips the order to
PAID. The frontend detects the mock link and shows a fake card form that "always
succeeds" — enough to demonstrate the full checkout without a Grow account.
