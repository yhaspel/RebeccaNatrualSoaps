import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { OrdersFacade } from './orders.facade';
import { OrdersApi, CheckoutPayload } from '../core/services/orders.api';
import { Order, CheckoutResponse } from '../core/models/order.model';

const checkoutPayload: CheckoutPayload = {
  email: 'a@b.com', full_name: 'A', shipping_line1: 'x',
  shipping_city: 'y', shipping_postal_code: '1', language: 'en', items: [],
};

const checkoutResponse: CheckoutResponse = {
  order_id: 1, payment_page_link: 'https://pay.test', is_mock: true,
  total_cents: 5000, currency: 'ILS',
};

const mockOrder: Order = {
  id: 1, email: 'a@b.com', full_name: 'A', phone: '', shipping_line1: '',
  shipping_line2: '', shipping_city: '', shipping_postal_code: '', shipping_country: '',
  subtotal_cents: 5000, shipping_cents: 0, total_cents: 5000, currency: 'ILS',
  status: 'paid', grow_process_id: '', created_at: '', items: [],
};

describe('OrdersFacade', () => {
  let facade: OrdersFacade;
  let mockApi: jasmine.SpyObj<OrdersApi>;

  beforeEach(() => {
    mockApi = jasmine.createSpyObj('OrdersApi', ['checkout', 'confirm', 'myOrders', 'getOrder']);
    TestBed.configureTestingModule({
      providers: [{ provide: OrdersApi, useValue: mockApi }],
    });
    facade = TestBed.inject(OrdersFacade);
  });

  it('createCheckout() sets submitting and returns response', (done) => {
    mockApi.checkout.and.returnValue(of(checkoutResponse));
    facade.createCheckout(checkoutPayload).subscribe((res) => {
      expect(res.order_id).toBe(1);
      done();
    });
  });

  it('createCheckout() on error sets error', (done) => {
    mockApi.checkout.and.returnValue(throwError(() => ({ error: { detail: 'fail' } })));
    facade.createCheckout(checkoutPayload).subscribe({
      error: () => {
        expect(facade.error()).toBe('fail');
        expect(facade.submitting()).toBe(false);
        done();
      },
    });
  });

  it('confirm() returns order and resets submitting', (done) => {
    mockApi.confirm.and.returnValue(of(mockOrder));
    facade.confirm(1).subscribe((order) => {
      expect(order.id).toBe(1);
      expect(facade.submitting()).toBe(false);
      done();
    });
  });

  it('loadMyOrders() sets orders', () => {
    mockApi.myOrders.and.returnValue(of({ results: [mockOrder] }));
    facade.loadMyOrders();
    expect(facade.myOrders().length).toBe(1);
  });

  it('loadMyOrders() on error sets empty array', () => {
    mockApi.myOrders.and.returnValue(throwError(() => new Error('fail')));
    facade.loadMyOrders();
    expect(facade.myOrders()).toEqual([]);
  });
});
