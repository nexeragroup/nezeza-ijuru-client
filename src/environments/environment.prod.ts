import type { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  name: 'prod',

  production: true,

  siteUrl: 'https://nezezaijuru.org',

  indexable: true,

  apiBaseUrl: 'https://api.nezezaijuru.org/api/v1',
} as const satisfies AppEnvironment;
