import { computed, Injectable, signal } from '@angular/core';
import { AuthenticatedUser, AuthSession } from '../models/auth.models';

import type { AuthStatus } from '../types/auth.type';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  // ---------------------------------------------------------------------------
  // Internal state
  // ---------------------------------------------------------------------------
  private readonly sessionState = signal<AuthSession | null>(null);
  private readonly statusState = signal<AuthStatus>('initializing');
  private readonly loadingState = signal(false);

  // ---------------------------------------------------------------------------
  // Public readonly state
  // ---------------------------------------------------------------------------
  readonly session = this.sessionState.asReadonly();
  readonly status = this.statusState.asReadonly();
  readonly loading = this.loadingState.asReadonly();

  // ---------------------------------------------------------------------------
  // Derived authentication state
  // ---------------------------------------------------------------------------
  readonly initialized = computed(() => this.statusState() !== 'initializing');
  readonly user = computed<AuthenticatedUser | null>(() => this.sessionState()?.user ?? null);
  readonly authenticated = computed(
    () => this.statusState() === 'authenticated' && this.user() !== null,
  );
  readonly anonymous = computed(() => this.statusState() === 'anonymous');

  // ---------------------------------------------------------------------------
  // Session expiration
  // ---------------------------------------------------------------------------
  readonly sessionExpired = computed(() => {
    const expiresAt = this.sessionState()?.expiresAt;
    if (!expiresAt) {
      return false;
    }
    return Date.now() >= expiresAt;
  });

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  setLoading(value: boolean): void {
    this.loadingState.set(value);
  }

  // ---------------------------------------------------------------------------
  // Initialization
  // ---------------------------------------------------------------------------
  startInitialization(): void {
    this.statusState.set('initializing');
  }

  // ---------------------------------------------------------------------------
  // Session
  // ---------------------------------------------------------------------------
  setSession(session: AuthSession): void {
    this.sessionState.set(session);
    this.statusState.set('authenticated');
    this.loadingState.set(false);
  }

  setAnonymous(): void {
    this.sessionState.set(null);
    this.statusState.set('anonymous');
    this.loadingState.set(false);
  }

  clear(): void {
    this.setAnonymous();
  }

  // ---------------------------------------------------------------------------
  // Permissions
  // ---------------------------------------------------------------------------
  hasPermission(permission: string): boolean {
    return this.user()?.permissions.includes(permission) ?? false;
  }

  hasAnyPermission(permissions: readonly string[]): boolean {
    const userPermissions = this.user()?.permissions;
    if (!userPermissions?.length) {
      return false;
    }
    return permissions.some((permission) => userPermissions.includes(permission));
  }

  hasAllPermissions(permissions: readonly string[]): boolean {
    const userPermissions = this.user()?.permissions;
    if (!userPermissions?.length) {
      return false;
    }
    return permissions.every((permission) => userPermissions.includes(permission));
  }

  readonly accessToken = computed(() => this.sessionState()?.accessToken ?? null);

  setAccessToken(accessToken: string, expiresIn?: number): void {
    this.sessionState.update((session) => {
      if (!session) {
        return null;
      }

      return {
        ...session,
        accessToken,
        expiresAt: expiresIn !== undefined ? Date.now() + expiresIn * 1000 : session.expiresAt,
      };
    });
  }
}
