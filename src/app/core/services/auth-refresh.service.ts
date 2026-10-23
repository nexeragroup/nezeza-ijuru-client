import { Injectable, inject } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { finalize, map, Observable, shareReplay } from 'rxjs';
import { API_REQUEST_TIMEOUT } from '../tokens/api-request-timeout.token';
import { AuthStore } from '../stores/auth.store';
import { AUTH_HTTP_CONFIG } from '../../config/auth-http.config';

interface RefreshResponse {
  accessToken: string;
  expiresIn?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthRefreshService {
  private readonly backend = inject(HttpBackend);

  /**
   * Raw HttpClient intentionally bypasses interceptors.
   *
   * This prevents the refresh request from recursively
   * entering the auth interceptor.
   */
  private readonly http = new HttpClient(this.backend);
  private readonly auth = inject(AuthStore);
  private readonly config = inject(AUTH_HTTP_CONFIG);
  private readonly timeout = inject(API_REQUEST_TIMEOUT);
  private refreshInFlight$: Observable<string> | null = null;

  refreshAccessToken(): Observable<string> {
    /**
     * If refresh is already running, reuse it.
     *
     * Example:
     *
     * request A → 401
     * request B → 401
     * request C → 401
     *
     *               ↓
     *
     *        ONE refresh request
     */
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }
    const url = this.buildUrl(this.config.apiBaseUrl, this.config.refreshPath);
    const source$ = this.http
      .post<RefreshResponse>(
        url,
        {},
        {
          /**
           * Required when refresh token is stored
           * in an HttpOnly cookie.
           */
          withCredentials: true,
          timeout: this.timeout,
        },
      )
      .pipe(
        map((response) => {
          if (!response.accessToken) {
            throw new Error('Refresh response did not contain an access token.');
          }
          this.auth.setAccessToken(response.accessToken, response.expiresIn);
          return response.accessToken;
        }),
        finalize(() => {
          this.refreshInFlight$ = null;
        }),
      );

    this.refreshInFlight$ = source$.pipe(
      shareReplay({
        bufferSize: 1,
        refCount: false,
      }),
    );

    return this.refreshInFlight$;
  }

  private buildUrl(baseUrl: string, path: string): string {
    return [baseUrl.replace(/\/+$/, ''), path.replace(/^\/+/, '')].join('/');
  }
}
