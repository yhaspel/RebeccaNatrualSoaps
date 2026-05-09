import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthFacade } from '../../abstraction/auth.facade';
import { signal } from '@angular/core';

describe('authGuard', () => {
  let mockRouter: jasmine.SpyObj<Router>;
  let isLoggedIn: ReturnType<typeof signal<boolean>>;
  const mockRoute = {} as ActivatedRouteSnapshot;

  beforeEach(() => {
    isLoggedIn = signal(false);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthFacade, useValue: { isLoggedIn } },
      ],
    });
  });

  it('returns true when logged in', () => {
    isLoggedIn.set(true);
    const result = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, { url: '/account' } as RouterStateSnapshot),
    );
    expect(result).toBe(true);
  });

  it('redirects to /auth/login when not logged in', () => {
    isLoggedIn.set(false);
    const result = TestBed.runInInjectionContext(() =>
      authGuard(mockRoute, { url: '/account' } as RouterStateSnapshot),
    );
    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/auth/login'],
      { queryParams: { next: '/account' } },
    );
  });
});
