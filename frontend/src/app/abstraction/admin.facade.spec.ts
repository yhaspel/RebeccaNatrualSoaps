import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AdminFacade } from './admin.facade';
import { AdminApi, ContactMessage } from '../core/services/admin.api';
import { Product } from '../core/models/product.model';
import { Order } from '../core/models/order.model';

const makeProduct = (id: number): Product => ({
  id, sku: '', category: 1, category_slug: '', name_en: '', name_he: '',
  description_en: '', description_he: '', ingredients_en: '', ingredients_he: '',
  price_cents: 1000, currency: 'ILS', stock: 10, image_url: '', is_featured: false, is_active: true,
});

const makeOrder = (id: number): Order => ({
  id, email: '', full_name: '', phone: '', shipping_line1: '', shipping_line2: '',
  shipping_city: '', shipping_postal_code: '', shipping_country: '',
  subtotal_cents: 0, shipping_cents: 0, total_cents: 0, currency: 'ILS',
  status: 'pending_payment', grow_process_id: '', created_at: '', items: [],
});

const makeMessage = (id: number): ContactMessage => ({
  id, name: '', email: '', subject: '', body: '', language: 'en', created_at: '', handled: false,
});

describe('AdminFacade', () => {
  let facade: AdminFacade;
  let mockApi: jasmine.SpyObj<AdminApi>;

  beforeEach(() => {
    mockApi = jasmine.createSpyObj('AdminApi', [
      'listProducts', 'getProduct', 'createProduct', 'updateProduct', 'deleteProduct',
      'listCategories', 'listOrders', 'setOrderStatus', 'listMessages', 'setMessageHandled',
    ]);
    TestBed.configureTestingModule({
      providers: [{ provide: AdminApi, useValue: mockApi }],
    });
    facade = TestBed.inject(AdminFacade);
  });

  it('loadProducts() sets products', () => {
    mockApi.listProducts.and.returnValue(of({ count: 1, next: null, previous: null, results: [makeProduct(1)] }));
    facade.loadProducts();
    expect(facade.products().length).toBe(1);
    expect(facade.loading()).toBe(false);
  });

  it('loadProducts() on error sets error', () => {
    mockApi.listProducts.and.returnValue(throwError(() => ({ message: 'fail' })));
    facade.loadProducts();
    expect(facade.error()).toBe('fail');
    expect(facade.loading()).toBe(false);
  });

  it('getProduct() delegates to api', (done) => {
    const p = makeProduct(1);
    mockApi.getProduct.and.returnValue(of(p));
    facade.getProduct(1).subscribe((res) => {
      expect(res).toEqual(p);
      done();
    });
  });

  it('createProduct() calls api and reloads', (done) => {
    mockApi.createProduct.and.returnValue(of(makeProduct(1)));
    mockApi.listProducts.and.returnValue(of({ count: 1, next: null, previous: null, results: [makeProduct(1)] }));
    facade.createProduct({ name_en: 'New' }).subscribe(() => {
      expect(mockApi.listProducts).toHaveBeenCalled();
      done();
    });
  });

  it('updateProduct() calls api and reloads', (done) => {
    mockApi.updateProduct.and.returnValue(of(makeProduct(1)));
    mockApi.listProducts.and.returnValue(of({ count: 1, next: null, previous: null, results: [makeProduct(1)] }));
    facade.updateProduct(1, { name_en: 'Updated' }).subscribe(() => {
      expect(mockApi.listProducts).toHaveBeenCalled();
      done();
    });
  });

  it('deleteProduct() calls api and reloads', () => {
    mockApi.deleteProduct.and.returnValue(of(undefined as unknown as void));
    mockApi.listProducts.and.returnValue(of({ count: 0, next: null, previous: null, results: [] }));
    facade.deleteProduct(1);
    expect(mockApi.deleteProduct).toHaveBeenCalledWith(1);
  });

  it('loadOrders() sets orders', () => {
    mockApi.listOrders.and.returnValue(of({ count: 1, next: null, previous: null, results: [makeOrder(1)] }));
    facade.loadOrders();
    expect(facade.orders().length).toBe(1);
  });

  it('setOrderStatus() updates order in list', () => {
    mockApi.listOrders.and.returnValue(of({ count: 1, next: null, previous: null, results: [makeOrder(1)] }));
    facade.loadOrders();
    const updated = { ...makeOrder(1), status: 'paid' as const };
    mockApi.setOrderStatus.and.returnValue(of(updated));
    facade.setOrderStatus(1, 'paid');
    expect(facade.orders()[0].status).toBe('paid');
  });

  it('loadMessages() sets messages', () => {
    mockApi.listMessages.and.returnValue(of({ count: 1, next: null, previous: null, results: [makeMessage(1)] }));
    facade.loadMessages();
    expect(facade.messages().length).toBe(1);
  });

  it('toggleHandled() toggles handled flag', () => {
    const msg = makeMessage(1);
    mockApi.listMessages.and.returnValue(of({ count: 1, next: null, previous: null, results: [msg] }));
    facade.loadMessages();
    const updated = { ...msg, handled: true };
    mockApi.setMessageHandled.and.returnValue(of(updated));
    facade.toggleHandled(msg);
    expect(facade.messages()[0].handled).toBe(true);
  });
});
