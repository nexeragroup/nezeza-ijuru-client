import { InjectionToken } from '@angular/core';

export interface AuthHttpConfig {
  apiBaseUrl: string;
  refreshPath: string;
  loginRoute: string;
}

export const AUTH_HTTP_CONFIG = new InjectionToken<AuthHttpConfig>('AUTH_HTTP_CONFIG');
