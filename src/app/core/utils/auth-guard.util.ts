import { toObservable } from '@angular/core/rxjs-interop';
import { Router, UrlTree } from '@angular/router';
import { filter, map, Observable, take } from 'rxjs';

import { AuthStore } from '../stores/auth.store';

export type GuardResult = true | UrlTree;

/**
 * Runs a guard decision only after authentication initialization
 * has completed.
 *
 * Prevents false redirects while the application is restoring
 * the current session.
 */
export function afterAuthInitialized(
  auth: AuthStore,
  decision: () => GuardResult,
): GuardResult | Observable<GuardResult> {
  if (auth.initialized()) {
    return decision();
  }

  return toObservable(auth.initialized).pipe(
    filter(Boolean),
    take(1),
    map(() => decision()),
  );
}

/**
 * Builds a consistent login redirect while preserving the
 * originally requested application URL.
 */
export function createLoginRedirect(router: Router, returnUrl: string): UrlTree {
  return router.createUrlTree(['/login'], {
    queryParams: {
      returnUrl,
    },
  });
}

/**
 * Only accepts application-internal return URLs.
 *
 * Rejects:
 *   https://evil.example.com
 *   //evil.example.com
 *   javascript:...
 */
export function getSafeReturnUrl(value: string | null | undefined, fallback = '/'): string {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith('/') || value.startsWith('//')) {
    return fallback;
  }

  return value;
}
