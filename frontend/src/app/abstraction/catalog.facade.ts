import { Injectable, computed, inject, signal } from '@angular/core';

import { CatalogApi } from '../core/services/catalog.api';
import { Category } from '../core/models/category.model';
import { Product } from '../core/models/product.model';

@Injectable({ providedIn: 'root' })
export class CatalogFacade {
  private api = inject(CatalogApi);

  private _categories = signal<Category[]>([]);
  private _products = signal<Product[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _currentCategory = signal<string | null>(null);

  readonly categories = this._categories.asReadonly();
  readonly products = this._products.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly currentCategory = this._currentCategory.asReadonly();

  readonly featured = computed(() => this._products().filter((p) => p.is_featured));

  loadCategories(): void {
    if (this._categories().length) return;
    this.api.listCategories().subscribe({
      next: (cats) =>
        this._categories.set([...cats].sort((a, b) => a.display_order - b.display_order)),
      error: (e) => this._error.set(e?.message ?? 'errors.loadCategories'),
    });
  }

  loadProducts(category?: string | null): void {
    this._loading.set(true);
    this._error.set(null);
    this._currentCategory.set(category ?? null);
    this.api
      .listProducts({ category: category ?? undefined })
      .subscribe({
        next: (res) => {
          this._products.set(res.results);
          this._loading.set(false);
        },
        error: (e) => {
          this._loading.set(false);
          this._error.set(e?.message ?? 'errors.loadProducts');
        },
      });
  }

  findProduct(id: number) {
    return this._products().find((p) => p.id === id) ?? null;
  }
}
