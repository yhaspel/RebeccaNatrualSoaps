import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { Order, OrderStatus } from '../models/order.model';

interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  body: string;
  language: string;
  created_at: string;
  handled: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin`;

  listProducts(): Observable<Paginated<Product>> {
    const params = new HttpParams().set('page_size', '100');
    return this.http.get<Paginated<Product>>(`${this.base}/products/`, { params });
  }
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/products/${id}/`);
  }
  createProduct(payload: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${this.base}/products/`, payload);
  }
  updateProduct(id: number, payload: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.base}/products/${id}/`, payload);
  }
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/products/${id}/`);
  }

  listCategories(): Observable<Paginated<Category>> {
    return this.http.get<Paginated<Category>>(`${this.base}/categories/`);
  }

  listOrders(): Observable<Paginated<Order>> {
    return this.http.get<Paginated<Order>>(`${this.base}/orders/`);
  }
  setOrderStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/orders/${id}/`, { status });
  }

  listMessages(): Observable<Paginated<ContactMessage>> {
    return this.http.get<Paginated<ContactMessage>>(`${this.base}/contact/`);
  }
  setMessageHandled(id: number, handled: boolean): Observable<ContactMessage> {
    return this.http.patch<ContactMessage>(`${this.base}/contact/${id}/`, { handled });
  }
}
