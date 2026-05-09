import { inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs/operators';

import { AuthFacade } from '../../abstraction/auth.facade';

/**
 * Wait for `auth.hydrate()` to complete before deciding. Otherwise, on a
 * hard reload the guard reads `_user === null` while the /me request is
 * still in flight and bounces the user to login even though their token
 * is valid.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthFacade);
  const router = inject(Router);
  return toObservable(auth.hydrated).pipe(
    filter((h) => h),
    take(1),
    map(() => {
      if (auth.isLoggedIn()) return true;
      return router.createUrlTree(['/auth/login'], { queryParams: { next: state.url } });
    }),
  );
};
