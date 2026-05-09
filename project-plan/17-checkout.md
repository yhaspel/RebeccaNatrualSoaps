# 17 — Checkout (Credit Card)

## Steps (single page, three visual sections with sticky summary)
1. **Contact** — email, full name, phone.
2. **Shipping** — address lines, city, postal code, country (default IL).
3. **Payment** — redirect to Grow (Meshulam) hosted payment page; shows mock card box in demo mode.
4. **Review & Pay** — order summary, total, final button.

## Flow
1. On submit: `ordersFacade.createCheckout(cart, contact, shipping)` →
   `POST /api/orders/checkout/`. Response includes `order_id` and
   `payment_page_link`.
2. If `payment_page_link` is `"mock"`: POST straight to
   `/api/orders/confirm/` and show success.
3. Otherwise redirect the browser to the Grow hosted payment page. On
   successful payment, Grow redirects back to `/checkout/success` and the
   app POSTs to `/api/orders/confirm/`.

## Validation
- All fields required except phone and shipping line 2.
- Email format validated via Angular validator.
- Postal code pattern — permissive, just "non-empty + 3–12 chars".
- Error messages are translation keys under `validation.*`.

## Guest vs. authenticated
Checkout works for both. If logged in, the order is linked to the user; if
not, order.email is the only identity.

## Success
`/checkout/success?order=<id>` — confirmation page with order summary, and a
link to "View order" (if signed in) or "Keep shopping".
