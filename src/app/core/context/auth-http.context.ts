import { HttpContextToken } from '@angular/common/http';

/**
 * Completely bypass authentication handling.
 *
 * Useful for:
 * - login
 * - forgot password
 * - public endpoints
 * - third-party APIs
 */
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

/**
 * Attach the access token, but don't attempt token refresh.
 *
 * Useful for:
 * - logout
 * - session termination
 * - special authentication endpoints
 */
export const SKIP_AUTH_REFRESH = new HttpContextToken<boolean>(() => false);
