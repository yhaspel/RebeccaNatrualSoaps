import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { CatalogFacade } from './catalog.facade';
import { CatalogApi } from '../core/services/catalog.api';
import { Category } from '../core/models/category.model';
import { Product } from '../core/models/product.model';

const makeCategory = (id: number, order: number): Category => ({
  id, slug: `cat-${id}`, name_en: '', name_he: '', description_en: '', description_he: '', display_order: order,
});

const makeProduct = (id: number, featured = false): Product => ({
  id, sku: '', category: 1, category_slug: '', name_en: '', name_he: '',
  description_en: '', description_he: '', ingredients_en: '', ingredients_he: '',
  price_cents: 1000, currency: 'ILS', stock: 10, image_url: '', is_featured: featured, is_active: true,
});

describe('CatalogFacade', () => {
  let facade: CatalogFacade;
  let mockApi: jasmine.SpyObj<CatalogApi>;

  beforeEach(() => {
    mockApi = jasmine.createSpyObj('CatalogApi', ['listCategories', 'listProducts', 'getProduct']);
    TestBed.configureTestingModule({
      providers: [{ provide: CatalogApi, useValue: mockApi }],
    });
    facade = TestBed.inject(CatalogFacade);
  });

  it('loadCategories() fetches and sorts by display_order', () => {
    mockApi.listCategories.and.returnValue(of([makeCategory(1, 3), makeCategory(2, 1)]));
    facade.loadCategories();
    expect(facade.categories()[0].id).toBe(2);
    expect(facade.categories()[1].id).toBe(1);
  });

  it('loadCategories() skips if already loaded', () => {
    mockApi.listCategories.and.returnValue(of([makeCategory(1, 1)]));
    facade.loadCategories();
    facade.loadCategories();
    expect(mockApi.listCategories).toHaveBeenCalledTimes(1);
  });

  it('loadProducts() sets loading then products', () => {
    mockApi.listProducts.and.returnValue(of({ count: 1, next: null, previous: null, results: [makeProduct(1)] }));
    facade.loadProducts();
    expect(facade.loading()).toBe(false);
    expect(facade.products().length).toBe(1);
  });

  it('loadProducts(category) passes category', () => {
    mockApi.listProducts.and.returnValue(of({ count: 0, next: null, previous: null, results: [] }));
    facade.loadProducts('soap');
    expect(mockApi.listProducts).toHaveBeenCalledWith({ category: 'soap' });
  });

  it('findProduct() returns product or null', () => {
    mockApi.listProducts.and.returnValue(of({ count: 1, next: null, previous: null, results: [makeProduct(5)] }));
    facade.loadProducts();
    expect(facade.findProduct(5)?.id).toBe(5);
    expect(facade.findProduct(99)).toBeNull();
  });

  it('featured computed signal filters featured products', () => {
    mockApi.listProducts.and.returnValue(of({
      count: 2, next: null, previous: null,
      results: [makeProduct(1, false), makeProduct(2, true)],
    }));
    facade.loadProducts();
    expect(facade.featured().length).toBe(1);
    expect(facade.featured()[0].id).toBe(2);
  });
});
