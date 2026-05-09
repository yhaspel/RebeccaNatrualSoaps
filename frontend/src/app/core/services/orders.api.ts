import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CheckoutResponse, Order } from '../models/order.model';

export interface CheckoutLine {
  product_id: number;
  quantity: number;
}

export interface CheckoutPayload {
  email: string;
  full_name: string;
  phone?: string;
  shipping_line1: string;
  shipping_line2?: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country?: string;
  language: 'en' | 'he';
  items: CheckoutLine[];
}

@Injectable({ providedIn: 'root' })
export class OrdersApi {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/orders`;

  checkout(payload: CheckoutPayload): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.base}/checkout/`, payload);
  }

  confirm(orderId: number): Observable<Order> {
    return this.http.post<Order>(`${this.base}/confirm/`, { order_id: orderId });
  }

  myOrders(): Observable<{ results: Order[] }> {
    return this.http.get<{ results: Order[] }>(`${this.base}/mine/`);
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}/`);
  }
}
