# 15 — Product Detail

## Route
`/products/:id` with `withComponentInputBinding()` so `id` is a component input.

## Layout
Two columns (stack on mobile):
- **Left / start** — large image.
- **Right / end** — breadcrumb (`Shop / <Category> / <Product>`), product name,
  price, short description, ingredients accordion, quantity stepper,
  "Add to cart" button, stock message.

Below: 4-up related products from the same category.

## States
- Loading — skeleton.
- Not found — 404 card with CTA back to shop.
- Out of stock — button disabled + clear message.

## Add-to-cart
`cartFacade.add(product, quantity)` → push toast → cart badge updates via the
computed signal. Button shows a brief success label animation without blocking.
