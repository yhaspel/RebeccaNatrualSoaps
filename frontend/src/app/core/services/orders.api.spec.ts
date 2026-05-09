import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { OrdersApi } from './orders.api';
import { environment } from '../../../environments/environment';

describe('OrdersApi', () => {
  let service: OrdersApi;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/orders`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrdersApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('checkout() POSTs to /api/orders/checkout/', () => {
    const payload = {
      email: 'a@b.com', full_name: 'A', shipping_line1: 'x',
      shipping_city: 'y', shipping_postal_code: '1', language: 'en' as const, items: [],
    };
    service.checkout(payload).subscribe();
    const req = httpMock.expectOne(`${base}/checkout/`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('confirm() POSTs to /api/orders/confirm/', () => {
    service.confirm(1).subscribe();
    const req = httpMock.expectOne(`${base}/confirm/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ order_id: 1 });
    req.flush({});
  });

  it('myOrders() GETs /api/orders/mine/', () => {
    service.myOrders().subscribe();
    const req = httpMock.expectOne(`${base}/mine/`);
    expect(req.request.method).toBe('GET');
    req.flush({ results: [] });
  });

  it('getOrder(1) GETs /api/orders/1/', () => {
    service.getOrder(1).subscribe();
    const req = httpMock.expectOne(`${base}/1/`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
