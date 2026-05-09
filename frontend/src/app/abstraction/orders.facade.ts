import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { OrdersApi, CheckoutPayload } from '../core/services/orders.api';
import { CheckoutResponse, Order } from '../core/models/order.model';

@Injectable({ providedIn: 'root' })
export class OrdersFacade {
  private api = inject(OrdersApi);

  private _submitting = signal(false);
  private _error = signal<string | null>(null);
  private _myOrders = signal<Order[]>([]);

  readonly submitting = this._submitting.asReadonly();
  readonly error = this._error.asReadonly();
  readonly myOrders = this._myOrders.asReadonly();

  createCheckout(payload: CheckoutPayload): Observable<CheckoutResponse> {
    this._submitting.set(true);
    this._error.set(null);
    return new Observable<CheckoutResponse>((subscriber) => {
      this.api.checkout(payload).subscribe({
        next: (res) => {
          subscriber.next(res);
          subscriber.complete();
        },
        error: (e) => {
          this._submitting.set(false);
          this._error.set(this.readError(e));
          subscriber.error(e);
        },
      });
    });
  }

  confirm(orderId: number): Observable<Order> {
    return new Observable<Order>((subscriber) => {
      this.api.confirm(orderId).subscribe({
        next: (order) => {
          this._submitting.set(false);
          subscriber.next(order);
          subscriber.complete();
        },
        error: (e) => {
          this._submitting.set(false);
          this._error.set(this.readError(e));
          subscriber.error(e);
        },
      });
    });
  }

  loadMyOrders(): void {
    this.api.myOrders().subscribe({
      next: (res) => this._myOrders.set(res.results ?? []),
      error: () => this._myOrders.set([]),
    });
  }

  private readError(e: any): string {
    return e?.error?.detail ?? e?.message ?? 'errors.generic';
  }
}
