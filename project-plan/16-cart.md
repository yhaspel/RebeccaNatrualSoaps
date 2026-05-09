# 16 — Shopping Cart

## Persistence
Cart lives entirely client-side (signals + `localStorage`) until checkout.
Key: `rns_cart_v1` — a list of `{ productId, quantity }`. On boot the cart
facade hydrates from storage, then a subscribing `effect()` persists changes.

## CartFacade
```typescript
// abstraction/cart.facade.ts
readonly items = computed<CartItem[]>(() => /* reconcile storage with latest products */);
readonly itemCount = computed(() => this.items().reduce((a, i) => a + i.quantity, 0));
readonly subtotalCents = computed(() => this.items().reduce((a, i) => a + i.quantity * i.product.priceCents, 0));

add(product: Product, qty = 1): void;
setQuantity(productId: number, qty: number): void;
remove(productId: number): void;
clear(): void;
```

## Cart page (`/cart`)
- Line items table (image, name, price, qty stepper, subtotal, remove).
- Summary card on the side/bottom: subtotal, shipping (free over 200 ILS,
  30 ILS otherwise), total, currency note.
- "Checkout" primary button → `/checkout`.
- Empty state with "Keep shopping" link to `/products`.

Everything keyed under `cart.*`.
