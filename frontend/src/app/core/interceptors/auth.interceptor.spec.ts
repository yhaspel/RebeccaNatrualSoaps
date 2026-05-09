import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { authInterceptor } from './auth.interceptor';
import { TokenStorage } from '../services/token-storage';
import { environment } from '../../../environments/environment';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let tokenStorage: jasmine.SpyObj<TokenStorage>;

  beforeEach(() => {
    tokenStorage = jasmine.createSpyObj('TokenStorage', ['read', 'write', 'writeAccess', 'clear']);
    tokenStorage.read.and.returnValue({ access: null, refresh: null });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: TokenStorage, useValue: tokenStorage },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('sends request without token when none exists', () => {
    http.get('/test').subscribe();
    const req = httpMock.expectOne('/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('adds Bearer token when access token exists', () => {
    tokenStorage.read.and.returnValue({ access: 'my-token', refresh: 'r' });
    http.get('/test').subscribe();
    const req = httpMock.expectOne('/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush({});
  });

  it('on 401, tries refresh and retries original request', () => {
    tokenStorage.read.and.returnValue({ access: 'old', refresh: 'r-token' });

    http.get('/test').subscribe();

    // Original request returns 401
    const orig = httpMock.expectOne('/test');
    orig.flush(null, { status: 401, statusText: 'Unauthorized' });

    // Interceptor attempts refresh
    const refreshReq = httpMock.expectOne(`${environment.apiUrl}/auth/refresh/`);
    expect(refreshReq.request.body).toEqual({ refresh: 'r-token' });
    refreshReq.flush({ access: 'new-token' });

    expect(tokenStorage.writeAccess).toHaveBeenCalledWith('new-token');

    // Retry original request
    const retry = httpMock.expectOne('/test');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer new-token');
    retry.flush({});
  });

  it('on 401 refresh failure, clears tokens', () => {
    tokenStorage.read.and.returnValue({ access: 'old', refresh: 'r-token' });

    http.get('/test').subscribe({ error: () => {} });

    const orig = httpMock.expectOne('/test');
    orig.flush(null, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpMock.expectOne(`${environment.apiUrl}/auth/refresh/`);
    refreshReq.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(tokenStorage.clear).toHaveBeenCalled();
  });

  it('does not retry for login endpoint', () => {
    tokenStorage.read.and.returnValue({ access: 'old', refresh: 'r-token' });

    http.post(`${environment.apiUrl}/auth/login/`, {}).subscribe({ error: () => {} });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login/`);
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    // No refresh request should be made
    httpMock.expectNone(`${environment.apiUrl}/auth/refresh/`);
  });

  it('does not retry for refresh endpoint', () => {
    tokenStorage.read.and.returnValue({ access: 'old', refresh: 'r-token' });

    http.post(`${environment.apiUrl}/auth/refresh/`, {}).subscribe({ error: () => {} });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/refresh/`);
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    // Should not attempt another refresh
    httpMock.expectNone(`${environment.apiUrl}/auth/refresh/`);
  });
});
