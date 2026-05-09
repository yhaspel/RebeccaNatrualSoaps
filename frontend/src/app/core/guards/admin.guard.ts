import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthFacade } from '../../abstraction/auth.facade';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthFacade);
  const router = inject(Router);
  if (auth.isLoggedIn() && auth.isStoreAdmin()) return true;
  router.navigate(['/admin/login']);
  return false;
};
