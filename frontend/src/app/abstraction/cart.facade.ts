import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { CatalogApi } from '../core/services/catalog.api';
import { CartLine, CartStoredLine } from '../core/models/cart.model';
import { Product } from '../core/models/product.model';

const STORAGE_KEY = 'rns_cart_v1';
const FREE_SHIPPING_THRESHOLD_CENTS = 20000;
const FLAT_SHIPPING_CENTS = 3000;

@Injectable({ providedIn: 'root' })
export class CartFacade {
  private api = inject(CatalogApi);

  private _lines = signal<CartStoredLine[]>([]);
  private _products = signal<Map<number, Product>>(new Map());
  private _loadingProducts = signal(false);

  readonly loadingProducts = this._loadingProducts.asReadonly();

  readonly items = computed<CartLine[]>(() =>
    this._lines()
      .map((line) => {
        const product = this._products().get(line.productId);
        if (!product) return null;
        return {
          product,
          quantity: line.quantity,
          lineTotalCents: product.price_cents * line.quantity,
        } satisfies CartLine;
      })
      .filter((l): l is CartLine => l !== null),
  );

  readonly itemCount = computed(() =>
    this._lines().reduce((sum, l) => sum + l.quantity, 0),
  );

  readonly subtotalCents = computed(() =>
    this.items().reduce((sum, l) => sum + l.lineTotalCents, 0),
  );

  readonly shippingCents = computed(() => {
    const sub = this.subtotalCents();
    if (sub === 0) return 0;
    return sub >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
  });

  readonly totalCents = computed(() => this.subtotalCents() + this.shippingCents());
  readonly currency = computed(() => this.items()[0]?.product.currency ?? 'ILS');

  constructor() {
    // Persist on any change.
    effect(() => {
      const lines = this._lines();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
      } catch {
        /* ignore */
      }
    });
  }

  hydrate(): void {
    let stored: CartStoredLine[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw) as CartStoredLine[];
    } catch {
      stored = [];
    }
    this._lines.set(stored);
    if (stored.length) this.refreshProducts();
  }

  /** Ensure every line has its Product fetched. */
  private refreshProducts(): void {
    const needed = this._lines()
      .map((l) => l.productId)
      .filter((id) => !this._products().has(id));
    if (!needed.length) return;
    this._loadingProducts.set(true);
    this.api.listProducts().subscribe({
      next: (res) => {
        const map = new Map(this._products());
        res.results.forEach((p) => map.set(p.id, p));
        this._products.set(map);
        this._loadingProducts.set(false);
      },
      error: () => this._loadingProducts.set(false),
    });
  }

  add(product: Product, quantity = 1): void {
    const lines = [...this._lines()];
    const existing = lines.find((l) => l.productId === product.id);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, 50);
    } else {
      lines.push({ productId: product.id, quantity: Math.max(1, Math.min(quantity, 50)) });
    }
    this._lines.set(lines);
    const map = new Map(this._products());
    map.set(product.id, product);
    this._products.set(map);
  }

  setQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) return this.remove(productId);
    this._lines.set(
      this._lines().map((l) => (l.productId === productId ? { ...l, quantity } : l)),
    );
  }

  remove(productId: number): void {
    this._lines.set(this._lines().filter((l) => l.productId !== productId));
  }

  clear(): void {
    this._lines.set([]);
  }
}
