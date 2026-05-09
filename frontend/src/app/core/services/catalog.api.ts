import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';
import { Product } from '../models/product.model';

interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class CatalogApi {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/catalog`;

  listCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/categories/`);
  }

  listProducts(params: { category?: string; featured?: boolean; search?: string } = {}):
    Observable<Paginated<Product>> {
    let httpParams = new HttpParams();
    if (params.category) httpParams = httpParams.set('category__slug', params.category);
    if (params.featured) httpParams = httpParams.set('is_featured', 'true');
    if (params.search) httpParams = httpParams.set('search', params.search);
    httpParams = httpParams.set('page_size', '60');
    return this.http.get<Paginated<Product>>(`${this.base}/products/`, { params: httpParams });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/products/${id}/`);
  }
}
