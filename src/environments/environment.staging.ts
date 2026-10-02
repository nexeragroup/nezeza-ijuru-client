import type { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  name: 'staging',

  production: false,

  siteUrl: 'https://staging.nezezaijuru.org',

  indexable: false,

  apiBaseUrl: 'https://staging-api.nezezaijuru.org/api/v1',
} as const satisfies AppEnvironment;
