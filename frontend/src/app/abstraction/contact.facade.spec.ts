import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ContactFacade } from './contact.facade';
import { ContactApi, ContactPayload } from '../core/services/contact.api';

describe('ContactFacade', () => {
  let facade: ContactFacade;
  let mockApi: jasmine.SpyObj<ContactApi>;
  const payload: ContactPayload = { name: 'A', email: 'a@b.com', body: 'hi', language: 'en' };

  beforeEach(() => {
    mockApi = jasmine.createSpyObj('ContactApi', ['send']);
    TestBed.configureTestingModule({
      providers: [{ provide: ContactApi, useValue: mockApi }],
    });
    facade = TestBed.inject(ContactFacade);
  });

  it('send() sets submitting then success', () => {
    mockApi.send.and.returnValue(of({}));
    facade.send(payload);
    expect(facade.submitting()).toBe(false);
    expect(facade.success()).toBe(true);
  });

  it('send() on error sets error', () => {
    mockApi.send.and.returnValue(throwError(() => ({ status: 500, error: { detail: 'fail' } })));
    facade.send(payload);
    expect(facade.submitting()).toBe(false);
    expect(facade.error()).toBe('fail');
  });

  it('send() with 429 sets contact.rateLimited', () => {
    mockApi.send.and.returnValue(throwError(() => ({ status: 429 })));
    facade.send(payload);
    expect(facade.error()).toBe('contact.rateLimited');
  });

  it('reset() clears error and success', () => {
    mockApi.send.and.returnValue(of({}));
    facade.send(payload);
    facade.reset();
    expect(facade.error()).toBeNull();
    expect(facade.success()).toBe(false);
  });
});
