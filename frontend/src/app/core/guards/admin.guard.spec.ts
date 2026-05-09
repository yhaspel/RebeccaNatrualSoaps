import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthFacade } from '../../abstraction/auth.facade';
import { signal } from '@angular/core';

describe('adminGuard', () => {
  let mockRouter: jasmine.SpyObj<Router>;
  let isLoggedIn: ReturnType<typeof signal<boolean>>;
  let isStoreAdmin: ReturnType<typeof signal<boolean>>;
  const mockRoute = {} as ActivatedRouteSnapshot;
  const mockState = {} as RouterStateSnapshot;

  beforeEach(() => {
    isLoggedIn = signal(false);
    isStoreAdmin = signal(false);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthFacade, useValue: { isLoggedIn, isStoreAdmin } },
      ],
    });
  });

  it('returns true when logged in AND is store admin', () => {
    isLoggedIn.set(true);
    isStoreAdmin.set(true);
    const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));
    expect(result).toBe(true);
  });

  it('redirects to /admin/login when not logged in', () => {
    const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));
    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/login']);
  });

  it('redirects to /admin/login when logged in but not admin', () => {
    isLoggedIn.set(true);
    isStoreAdmin.set(false);
    const result = TestBed.runInInjectionContext(() => adminGuard(mockRoute, mockState));
    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin/login']);
  });
});
