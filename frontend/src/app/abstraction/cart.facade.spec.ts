import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CartFacade } from './cart.facade';
import { CatalogApi } from '../core/services/catalog.api';
import { Product } from '../core/models/product.model';

const makeProduct = (id: number, priceCents = 1000, currency = 'ILS'): Product => ({
  id, sku: `SKU-${id}`, category: 1, category_slug: 'soap', name_en: `Product ${id}`, name_he: '',
  description_en: '', description_he: '', ingredients_en: '', ingredients_he: '',
  price_cents: priceCents, currency, stock: 10, image_url: '', is_featured: false, is_active: true,
});

describe('CartFacade', () => {
  let facade: CartFacade;
  let mockApi: jasmine.SpyObj<CatalogApi>;

  beforeEach(() => {
    mockApi = jasmine.createSpyObj('CatalogApi', ['listProducts', 'listCategories', 'getProduct']);
    mockApi.listProducts.and.returnValue(of({ count: 0, next: null, previous: null, results: [] }));

    TestBed.configureTestingModule({
      providers: [{ provide: CatalogApi, useValue: mockApi }],
    });
    facade = TestBed.inject(CartFacade);
  });

  afterEach(() => {
    localStorage.removeItem('rns_cart_v1');
  });

  it('add() adds a product', () => {
    facade.add(makeProduct(1));
    expect(facade.itemCount()).toBe(1);
  });

  it('add() increments existing product quantity', () => {
    const p = makeProduct(1);
    facade.add(p);
    facade.add(p);
    expect(facade.itemCount()).toBe(2);
  });

  it('setQuantity() updates quantity', () => {
    facade.add(makeProduct(1));
    facade.setQuantity(1, 5);
    expect(facade.itemCount()).toBe(5);
  });

  it('setQuantity(0) removes the item', () => {
    facade.add(makeProduct(1));
    facade.setQuantity(1, 0);
    expect(facade.itemCount()).toBe(0);
  });

  it('remove() removes item', () => {
    facade.add(makeProduct(1));
    facade.remove(1);
    expect(facade.itemCount()).toBe(0);
  });

  it('clear() empties cart', () => {
    facade.add(makeProduct(1));
    facade.add(makeProduct(2));
    facade.clear();
    expect(facade.itemCount()).toBe(0);
  });

  it('subtotalCents computed', () => {
    facade.add(makeProduct(1, 2000));
    facade.add(makeProduct(2, 3000));
    expect(facade.subtotalCents()).toBe(5000);
  });

  it('shippingCents is 0 when cart is empty', () => {
    expect(facade.shippingCents()).toBe(0);
  });

  it('shippingCents is 3000 under threshold', () => {
    facade.add(makeProduct(1, 5000)); // 50 ILS, under 200 ILS threshold
    expect(facade.shippingCents()).toBe(3000);
  });

  it('shippingCents is 0 over threshold', () => {
    facade.add(makeProduct(1, 20000)); // exactly 200 ILS = threshold
    expect(facade.shippingCents()).toBe(0);
  });

  it('totalCents = subtotal + shipping', () => {
    facade.add(makeProduct(1, 5000));
    expect(facade.totalCents()).toBe(5000 + 3000);
  });

  it('currency defaults to ILS', () => {
    expect(facade.currency()).toBe('ILS');
  });
});
