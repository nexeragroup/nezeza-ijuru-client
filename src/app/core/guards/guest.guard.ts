import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthStore } from '../stores/auth.store';
import { afterAuthInitialized, getSafeReturnUrl } from '../utils/auth-guard.util';

export const guestGuard: CanActivateFn = (route) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  return afterAuthInitialized(auth, () => {
    if (!auth.authenticated()) {
      return true;
    }
    const fallback = '/';
    const returnUrl = getSafeReturnUrl(route.queryParamMap.get('returnUrl'), fallback);
    if (returnUrl === '/login' || returnUrl.startsWith('/login?')) {
      return router.parseUrl(fallback);
    }
    return router.parseUrl(returnUrl);
  });
};
