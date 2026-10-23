import { ModuleWithProviders, NgModule, inject, provideAppInitializer } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { API_HTTP_CONFIG } from '../config/api-http.config';
import { AUTH_HTTP_CONFIG, type AuthHttpConfig } from '../config/auth-http.config';
import { CONNECTION_CONFIG } from '../config/connection.config';
import { CoreModuleConfig } from '../config/core.config';
import { STORAGE_CONFIG } from '../config/storage.config';
import { apiDefaultsInterceptor } from './interceptors/api.interceptor';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';
import { ConnectionService } from './services/connection.service';
import { API_REQUEST_TIMEOUT } from './tokens/api-request-timeout.token';
import { API_URL } from './tokens/api-url.token';
import { THEME_CONFIG } from '../config/theme.config';
import { ThemeService } from './services/theme.service';
import { SeoService } from './services/seo.service';

@NgModule({})
export class CoreModule {
  constructor() {
    if (inject(CoreModule, { optional: true, skipSelf: true })) {
      throw new Error(
        'CoreModule has already been loaded. Import CoreModule.forRoot() only in AppModule.',
      );
    }
    inject(ConnectionService);
  }

  static forRoot(config: CoreModuleConfig): ModuleWithProviders<CoreModule> {
    const apiBaseUrl = normalizeRequiredBaseUrl(config.apiBaseUrl, 'apiBaseUrl');
    const storageNamespace = config.storage.namespace.trim();
    if (!storageNamespace) {
      throw new Error('[CoreModule] storage.namespace is required.');
    }
    const healthPath = config.connection?.healthPath ?? '/health/live';
    const healthEndpoint = joinUrl(apiBaseUrl, healthPath);

    return {
      ngModule: CoreModule,
      providers: [
        provideHttpClient(
          withInterceptors([
            loadingInterceptor,
            apiDefaultsInterceptor,
            errorInterceptor,
            authInterceptor,
          ]),
        ),

        // =======================================================================
        // API
        // =======================================================================
        {
          provide: API_URL,
          useValue: apiBaseUrl,
        },
        {
          provide: API_HTTP_CONFIG,
          useValue: {
            apiBaseUrl,
          },
        },
        {
          provide: API_REQUEST_TIMEOUT,
          useValue: config.apiRequestTimeoutMs ?? 15_000,
        },

        // =======================================================================
        // Auth
        // =======================================================================
        {
          provide: AUTH_HTTP_CONFIG,
          useValue: {
            apiBaseUrl,
            refreshPath: config.auth?.refreshPath ?? '/auth/refresh',
            loginRoute: config.auth?.loginRoute ?? '/login',
          } satisfies AuthHttpConfig,
        },

        // =======================================================================
        // Connection monitoring
        // =======================================================================
        {
          provide: CONNECTION_CONFIG,
          useValue: {
            healthEndpoint,
            pollIntervalMs: config.connection?.pollIntervalMs ?? 30_000,
            timeoutMs: config.connection?.timeoutMs ?? 5_000,
            degradedLatencyMs: config.connection?.degradedLatencyMs ?? 2_500,
          },
        },

        // =======================================================================
        // Storage
        // =======================================================================
        {
          provide: STORAGE_CONFIG,
          useValue: {
            namespace: storageNamespace,
            version: config.storage.version ?? 1,
            defaultArea: config.storage.defaultArea ?? 'local',
          },
        },

        // =======================================================================
        // Theme
        // =======================================================================
        {
          provide: THEME_CONFIG,
          useValue: {
            defaultColor: config.theme?.defaultColor ?? 'default',
            defaultMode: config.theme?.defaultMode ?? 'system',
          },
        },

        provideAppInitializer(() => {
          inject(ThemeService).initialize();
          inject(SeoService).initialize();
        }),
      ],
    };
  }
}

// =============================================================================
// Core configuration helpers
// =============================================================================

function normalizeRequiredBaseUrl(value: string, property: string): string {
  const normalized = value?.trim();

  if (!normalized) {
    throw new Error(`[CoreModule] ${property} is required.`);
  }

  if (normalized === '/') {
    return normalized;
  }

  return normalized.replace(/\/+$/, '');
}

function joinUrl(base: string, path: string): string {
  const normalizedBase = base === '/' ? '' : base.replace(/\/+$/, '');

  const normalizedPath = path.replace(/^\/+/, '');

  return `${normalizedBase}/` + normalizedPath;
}
