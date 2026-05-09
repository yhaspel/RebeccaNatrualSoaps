import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AdminApi, ContactMessage } from '../core/services/admin.api';
import { Product } from '../core/models/product.model';
import { Order, OrderStatus } from '../core/models/order.model';

@Injectable({ providedIn: 'root' })
export class AdminFacade {
  private api = inject(AdminApi);

  private _products = signal<Product[]>([]);
  private _orders = signal<Order[]>([]);
  private _messages = signal<ContactMessage[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly products = this._products.asReadonly();
  readonly orders = this._orders.asReadonly();
  readonly messages = this._messages.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  loadProducts(): void {
    this._loading.set(true);
    this.api.listProducts().subscribe({
      next: (res) => {
        this._products.set(res.results);
        this._loading.set(false);
      },
      error: (e) => {
        this._loading.set(false);
        this._error.set(e?.message ?? 'errors.generic');
      },
    });
  }

  getProduct(id: number): Observable<Product> {
    return this.api.getProduct(id);
  }

  createProduct(payload: Partial<Product>): Observable<Product> {
    return this.api.createProduct(payload).pipe(tap(() => this.loadProducts()));
  }

  updateProduct(id: number, payload: Partial<Product>): Observable<Product> {
    return this.api.updateProduct(id, payload).pipe(tap(() => this.loadProducts()));
  }

  deleteProduct(id: number): void {
    this.api.deleteProduct(id).subscribe({
      next: () => this.loadProducts(),
    });
  }

  loadOrders(): void {
    this.api.listOrders().subscribe({
      next: (res) => this._orders.set(res.results),
    });
  }

  setOrderStatus(id: number, status: OrderStatus): void {
    this.api.setOrderStatus(id, status).subscribe({
      next: (updated) =>
        this._orders.set(this._orders().map((o) => (o.id === id ? updated : o))),
    });
  }

  loadMessages(): void {
    this.api.listMessages().subscribe({
      next: (res) => this._messages.set(res.results),
    });
  }

  toggleHandled(msg: ContactMessage): void {
    this.api.setMessageHandled(msg.id, !msg.handled).subscribe({
      next: (updated) =>
        this._messages.set(this._messages().map((m) => (m.id === msg.id ? updated : m))),
    });
  }
}
