# 14 — Products Page (by category)

## Route
`/products` with query param `?category=<slug>` (optional).

## Layout
- Page header — title, subtitle, short intro copy.
- Category tabs — horizontal, "All" + the four categories. Clicking a tab
  updates the `?category=` query param. Keyboard-accessible; tabs are
  `role="tab"` inside a `role="tablist"`.
- Optional short description for the selected category below the tabs.
- Grid of `ProductCard`s — responsive: 1 col mobile → 2 sm → 3 md → 4 lg.
- Empty state when the category has no active products yet.
- Skeleton loader while `catalogFacade.loading()` is true.

## `ProductCard`
- Square image (`aspect-square object-cover`).
- Name, short description snippet, price formatted via `money` pipe.
- "Add to cart" button — optimistic update via `cartFacade.add(product)`; a
  toast confirms.
- Entire card is a link to `/products/<id>` (except the button, which stops
  propagation).

## Facade behavior
`CatalogFacade.loadProducts(category?: string)` fetches with the right filter.
When `category` param changes in the URL, a `toSignal(queryParamMap)` driven
`effect()` calls the facade again. No manual subscription management.
