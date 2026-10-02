import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthStore } from '../stores/auth.store';
import { afterAuthInitialized, createLoginRedirect } from '../utils/auth-guard.util';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  return afterAuthInitialized(auth, () => {
    if (!auth.authenticated()) {
      return createLoginRedirect(router, state.url);
    }

    return true;
  });
};
