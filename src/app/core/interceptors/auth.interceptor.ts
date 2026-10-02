import { isApiRequest } from '../utils/api-url.util';
import { inject } from '@angular/core';

import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthStore } from '../stores/auth.store';
import { AuthRefreshService } from '../services/auth-refresh.service';
import { AUTH_HTTP_CONFIG } from '../../config/auth-http.config';
import { SKIP_AUTH, SKIP_AUTH_REFRESH } from '../context/auth-http.context';
import { AuthSessionExpiryService } from '../services/auth-session-expiry.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthStore);
  const refreshService = inject(AuthRefreshService);
  const sessionExpiry = inject(AuthSessionExpiryService);
  const config = inject(AUTH_HTTP_CONFIG);

  // ---------------------------------------------------------------------------
  // Ignore requests outside our API
  // ---------------------------------------------------------------------------
  if (!isApiRequest(request.url, config.apiBaseUrl)) {
    return next(request);
  }

  // ---------------------------------------------------------------------------
  // Explicit authentication bypass
  // ---------------------------------------------------------------------------
  if (request.context.get(SKIP_AUTH)) {
    return next(request);
  }

  // ---------------------------------------------------------------------------
  // Attach access token
  // ---------------------------------------------------------------------------
  const accessToken = auth.accessToken();
  const authenticatedRequest = accessToken ? attachBearerToken(request, accessToken) : request;
  return next(authenticatedRequest).pipe(
    catchError((error: unknown) => {
      // -----------------------------------------------------------------------
      // Only authentication failures are handled here
      // -----------------------------------------------------------------------
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }

      // -----------------------------------------------------------------------
      // Request explicitly forbids refresh
      // -----------------------------------------------------------------------
      if (request.context.get(SKIP_AUTH_REFRESH)) {
        return throwError(() => error);
      }

      // -----------------------------------------------------------------------
      // Anonymous users should never refresh
      // -----------------------------------------------------------------------
      if (!auth.authenticated()) {
        return throwError(() => error);
      }

      // -----------------------------------------------------------------------
      // Refresh token
      // -----------------------------------------------------------------------
      return refreshService.refreshAccessToken().pipe(
        /**
         * This catch handles REFRESH failures only.
         */
        catchError((refreshError) => {
          if (isTerminalAuthenticationFailure(refreshError)) {
            sessionExpiry.expire();
          }

          return throwError(() => refreshError);
        }),

        // -------------------------------------------------------------------
        // Retry original request exactly once
        // -------------------------------------------------------------------
        switchMap((newAccessToken) => {
          const retryRequest = attachBearerToken(request, newAccessToken);
          return next(retryRequest).pipe(
            catchError((retryError) => {
              /**
               * Refresh succeeded but the API still
               * rejects the new token.
               *
               * The session can no longer be trusted.
               */
              if (retryError instanceof HttpErrorResponse && retryError.status === 401) {
                sessionExpiry.expire();
              }
              return throwError(() => retryError);
            }),
          );
        }),
      );
    }),
  );
};

// =============================================================================
// Helpers
// =============================================================================
function attachBearerToken<T>(request: HttpRequest<T>, token: string): HttpRequest<T> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function isTerminalAuthenticationFailure(error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse)) {
    return false;
  }

  return error.status === 400 || error.status === 401 || error.status === 403;
}
