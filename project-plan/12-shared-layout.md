# 12 — Shared Layout

Three shared layout parts wrap the routed page:

## Header
- Left (or start, in RTL): word-mark **Rebecca's Natural Soaps** linking to `/`.
- Middle: primary nav — Home · Shop · About · Contact.
- End: language toggle (EN / HE), account icon, cart icon with badge.
- Mobile: hamburger → slide-in drawer; drawer respects dir.

## Footer
- Mini-tagline + copyright (translated).
- Secondary nav: About, Contact, Shipping (placeholder), Privacy (placeholder).
- Language toggle repeated for reach.

## Nav behavior
- The header collapses to a translucent background on scroll.
- Active route has a subtle underline (uses `routerLinkActive`).

## Cart badge
Binds to `cartFacade.itemCount()` (a `computed`) so the badge updates whenever
the cart changes without any imperative wiring.

## Admin layout (separate)
`features/admin/admin.layout.ts` — its own chrome (side nav with "Products",
"Orders", "Messages", "Sign out"). Hidden from the public header entirely.
