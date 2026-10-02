import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStore } from '../stores/auth.store';
import { AUTH_HTTP_CONFIG } from '../../config/auth-http.config';

@Injectable({
  providedIn: 'root',
})
export class AuthSessionExpiryService {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly config = inject(AUTH_HTTP_CONFIG);

  expire(): void {
    const currentUrl = this.router.url;
    this.auth.clear();

    /**
     * Let SSR guards handle redirects.
     */
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    /**
     * Avoid:
     *
     * /login
     *   ↓
     * /login
     *   ↓
     * /login
     */
    if (
      currentUrl === this.config.loginRoute ||
      currentUrl.startsWith(`${this.config.loginRoute}?`)
    ) {
      return;
    }

    const returnUrl = this.isSafeInternalUrl(currentUrl) ? currentUrl : '/';

    void this.router.navigate([this.config.loginRoute], {
      queryParams: {
        returnUrl,
      },
    });
  }

  private isSafeInternalUrl(url: string): boolean {
    return url.startsWith('/') && !url.startsWith('//');
  }
}
