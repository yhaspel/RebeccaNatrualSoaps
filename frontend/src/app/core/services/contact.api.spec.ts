import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ContactApi } from './contact.api';
import { environment } from '../../../environments/environment';

describe('ContactApi', () => {
  let service: ContactApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ContactApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('send() POSTs to /api/contact/', () => {
    const payload = { name: 'A', email: 'a@b.com', body: 'hi', language: 'en' as const };
    service.send(payload).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/contact/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });
});
