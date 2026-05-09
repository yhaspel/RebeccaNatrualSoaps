import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AdminApi } from './admin.api';
import { environment } from '../../../environments/environment';

describe('AdminApi', () => {
  let service: AdminApi;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/admin`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('listProducts() GETs with page_size=100', () => {
    service.listProducts().subscribe();
    const req = httpMock.expectOne((r) => r.url === `${base}/products/`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page_size')).toBe('100');
    req.flush({ count: 0, results: [] });
  });

  it('getProduct(1) GETs /admin/products/1/', () => {
    service.getProduct(1).subscribe();
    const req = httpMock.expectOne(`${base}/products/1/`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('createProduct() POSTs to /admin/products/', () => {
    service.createProduct({ name_en: 'Soap' }).subscribe();
    const req = httpMock.expectOne(`${base}/products/`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('updateProduct() PATCHes /admin/products/1/', () => {
    service.updateProduct(1, { name_en: 'Updated' }).subscribe();
    const req = httpMock.expectOne(`${base}/products/1/`);
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });

  it('deleteProduct() DELETEs /admin/products/1/', () => {
    service.deleteProduct(1).subscribe();
    const req = httpMock.expectOne(`${base}/products/1/`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('listCategories() GETs /admin/categories/', () => {
    service.listCategories().subscribe();
    const req = httpMock.expectOne(`${base}/categories/`);
    expect(req.request.method).toBe('GET');
    req.flush({ count: 0, results: [] });
  });

  it('listOrders() GETs /admin/orders/', () => {
    service.listOrders().subscribe();
    const req = httpMock.expectOne(`${base}/orders/`);
    expect(req.request.method).toBe('GET');
    req.flush({ count: 0, results: [] });
  });

  it('setOrderStatus() PATCHes /admin/orders/1/', () => {
    service.setOrderStatus(1, 'paid').subscribe();
    const req = httpMock.expectOne(`${base}/orders/1/`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'paid' });
    req.flush({});
  });

  it('listMessages() GETs /admin/contact/', () => {
    service.listMessages().subscribe();
    const req = httpMock.expectOne(`${base}/contact/`);
    expect(req.request.method).toBe('GET');
    req.flush({ count: 0, results: [] });
  });

  it('setMessageHandled() PATCHes /admin/contact/1/', () => {
    service.setMessageHandled(1, true).subscribe();
    const req = httpMock.expectOne(`${base}/contact/1/`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ handled: true });
    req.flush({});
  });
});
