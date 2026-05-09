import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { CatalogApi } from './catalog.api';
import { environment } from '../../../environments/environment';

describe('CatalogApi', () => {
  let service: CatalogApi;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/catalog`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CatalogApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('listCategories() GETs /api/catalog/categories/', () => {
    service.listCategories().subscribe();
    const req = httpMock.expectOne(`${base}/categories/`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('listProducts() GETs /api/catalog/products/ with page_size', () => {
    service.listProducts().subscribe();
    const req = httpMock.expectOne((r) => r.url === `${base}/products/`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page_size')).toBe('60');
    req.flush({ count: 0, next: null, previous: null, results: [] });
  });

  it('listProducts({category:"soap"}) adds category__slug param', () => {
    service.listProducts({ category: 'soap' }).subscribe();
    const req = httpMock.expectOne((r) => r.url === `${base}/products/`);
    expect(req.request.params.get('category__slug')).toBe('soap');
    req.flush({ count: 0, next: null, previous: null, results: [] });
  });

  it('getProduct(1) GETs /api/catalog/products/1/', () => {
    service.getProduct(1).subscribe();
    const req = httpMock.expectOne(`${base}/products/1/`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
