import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthFacade } from './auth.facade';
import { AuthApi } from '../core/services/auth.api';
import { TokenStorage } from '../core/services/token-storage';
import { LoginResponse, User } from '../core/models/user.model';

const mockUser: User = {
  id: 1, username: 'test', email: 'a@b.com',
  first_name: 'Test', last_name: 'User',
  is_store_admin: false, preferred_language: 'en',
};

const adminUser: User = { ...mockUser, is_store_admin: true };

const loginResponse: LoginResponse = {
  access: 'a', refresh: 'r', user: mockUser,
};

describe('AuthFacade', () => {
  let facade: AuthFacade;
  let mockApi: jasmine.SpyObj<AuthApi>;
  let mockTokens: jasmine.SpyObj<TokenStorage>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockApi = jasmine.createSpyObj('AuthApi', ['login', 'adminLogin', 'me', 'logout', 'register', 'refresh']);
    mockTokens = jasmine.createSpyObj('TokenStorage', ['read', 'write', 'writeAccess', 'clear']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    mockTokens.read.and.returnValue({ access: null, refresh: null });

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthApi, useValue: mockApi },
        { provide: TokenStorage, useValue: mockTokens },
        { provide: Router, useValue: mockRouter },
      ],
    });
    facade = TestBed.inject(AuthFacade);
  });

  it('hydrate() without token sets hydrated', () => {
    facade.hydrate();
    expect(facade.hydrated()).toBe(true);
    expect(facade.user()).toBeNull();
  });

  it('hydrate() with token loads user', () => {
    mockTokens.read.and.returnValue({ access: 'a', refresh: 'r' });
    mockApi.me.and.returnValue(of(mockUser));
    facade.hydrate();
    expect(facade.user()).toEqual(mockUser);
    expect(facade.hydrated()).toBe(true);
  });

  it('hydrate() on error clears tokens', () => {
    mockTokens.read.and.returnValue({ access: 'a', refresh: 'r' });
    mockApi.me.and.returnValue(throwError(() => new Error('fail')));
    facade.hydrate();
    expect(mockTokens.clear).toHaveBeenCalled();
    expect(facade.user()).toBeNull();
    expect(facade.hydrated()).toBe(true);
  });

  it('login() success sets user and navigates', () => {
    mockApi.login.and.returnValue(of(loginResponse));
    facade.login('user', 'pass');
    expect(mockTokens.write).toHaveBeenCalledWith('a', 'r');
    expect(facade.user()).toEqual(mockUser);
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/account');
  });

  it('login() with next param navigates to next', () => {
    mockApi.login.and.returnValue(of(loginResponse));
    facade.login('user', 'pass', '/cart');
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/cart');
  });

  it('login() error sets error', () => {
    mockApi.login.and.returnValue(throwError(() => ({ error: { detail: 'bad creds' } })));
    facade.login('user', 'pass');
    expect(facade.error()).toBe('bad creds');
    expect(facade.loading()).toBe(false);
  });

  it('adminLogin() success navigates to /admin/products', () => {
    const adminLoginRes: LoginResponse = { access: 'a', refresh: 'r', user: adminUser };
    mockApi.adminLogin.and.returnValue(of(adminLoginRes));
    facade.adminLogin('admin', 'pass');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/products']);
  });

  it('logout() clears state', () => {
    mockTokens.read.and.returnValue({ access: 'a', refresh: 'r' });
    mockApi.logout.and.returnValue(of(undefined as unknown as void));
    facade.logout();
    expect(mockTokens.clear).toHaveBeenCalled();
    expect(facade.user()).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('isLoggedIn computed signal', () => {
    expect(facade.isLoggedIn()).toBe(false);
    mockApi.login.and.returnValue(of(loginResponse));
    facade.login('u', 'p');
    expect(facade.isLoggedIn()).toBe(true);
  });

  it('isStoreAdmin computed signal', () => {
    const adminRes: LoginResponse = { access: 'a', refresh: 'r', user: adminUser };
    mockApi.adminLogin.and.returnValue(of(adminRes));
    facade.adminLogin('admin', 'pass');
    expect(facade.isStoreAdmin()).toBe(true);
  });

  it('displayName computed signal', () => {
    mockApi.login.and.returnValue(of(loginResponse));
    facade.login('u', 'p');
    expect(facade.displayName()).toBe('Test');
  });
});
