import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthStore } from '../stores/auth.store';
import { afterAuthInitialized, createLoginRedirect } from '../utils/auth-guard.util';

export type PermissionMode = 'all' | 'any';

export interface PermissionGuardData {
  permissions: readonly string[];
  permissionMode?: PermissionMode;
}

export const permissionGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);

  return afterAuthInitialized(auth, () => {
    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------
    if (!auth.authenticated()) {
      return createLoginRedirect(router, state.url);
    }

    // -------------------------------------------------------------------------
    // Route configuration
    // -------------------------------------------------------------------------
    const permissions = route.data['permissions'] as readonly string[] | undefined;
    const mode = (route.data['permissionMode'] as PermissionMode | undefined) ?? 'all';
    // Fail closed when the route forgot to specify permissions.
    if (!permissions?.length) {
      console.error(
        `[permissionGuard] Route "${state.url}" is protected by ` +
          'permissionGuard but defines no permissions.',
      );
      return router.createUrlTree(['/forbidden']);
    }

    // -------------------------------------------------------------------------
    // Permission evaluation
    // -------------------------------------------------------------------------
    const permitted =
      mode === 'any' ? auth.hasAnyPermission(permissions) : auth.hasAllPermissions(permissions);
    if (!permitted) {
      return router.createUrlTree(['/forbidden']);
    }
    return true;
  });
};
