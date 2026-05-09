import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthApi } from './auth.api';
import { environment } from '../../../environments/environment';

describe('AuthApi', () => {
  let service: AuthApi;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('login() POSTs to /api/auth/login/', () => {
    service.login('user', 'pass').subscribe();
    const req = httpMock.expectOne(`${base}/login/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'user', password: 'pass' });
    req.flush({ access: 'a', refresh: 'r', user: {} });
  });

  it('adminLogin() POSTs to /api/auth/admin-login/', () => {
    service.adminLogin('admin', 'pass').subscribe();
    const req = httpMock.expectOne(`${base}/admin-login/`);
    expect(req.request.method).toBe('POST');
    req.flush({ access: 'a', refresh: 'r', user: {} });
  });

  it('register() POSTs to /api/auth/register/', () => {
    const payload = { username: 'u', email: 'e@e.com', password: 'p' };
    service.register(payload).subscribe();
    const req = httpMock.expectOne(`${base}/register/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('me() GETs /api/auth/me/', () => {
    service.me().subscribe();
    const req = httpMock.expectOne(`${base}/me/`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('refresh() POSTs to /api/auth/refresh/', () => {
    service.refresh('r-token').subscribe();
    const req = httpMock.expectOne(`${base}/refresh/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refresh: 'r-token' });
    req.flush({ access: 'a', refresh: 'r' });
  });

  it('logout() POSTs to /api/auth/logout/', () => {
    service.logout('r-token').subscribe();
    const req = httpMock.expectOne(`${base}/logout/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refresh: 'r-token' });
    req.flush(null);
  });
});
