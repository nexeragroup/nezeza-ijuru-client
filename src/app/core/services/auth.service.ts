import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, map, Observable, tap } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import { AuthSession, LoginRequest, LoginResponse } from '../models/auth.models';
import { AuthStore } from '../stores/auth.store';
import { DeviceService } from './device.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly store = inject(AuthStore);
  private readonly device = inject(DeviceService);
  private readonly router = inject(Router);

  login(request: LoginRequest): Observable<AuthSession> {
    this.store.setLoading(true);
    const payload: LoginRequest = {
      ...request,
      deviceId: this.device.getOrCreateId(),
    };

    return this.api
      .post<ApiResponse<LoginResponse>, LoginRequest>('/auth/login', payload)
      .pipe(
        map((response) => this.toAuthSession(response.data)),
        tap((session) => this.establishSession(session)),
        finalize(() => this.store.setLoading(false)),
      );
  }

  restoreSession(): Observable<AuthSession> {
    return this.api.get<ApiResponse<LoginResponse>>('/auth/session').pipe(
      map((response) => this.toAuthSession(response.data)),
      tap((session) => this.establishSession(session)),
    );
  }

  logout(): Observable<void> {
    this.store.setLoading(true);
    return this.api.post<ApiResponse<null>, Record<string, never>>('/auth/logout', {}).pipe(
      map(() => undefined),
      finalize(() => {
        this.clearSession();
        this.store.setLoading(false);
        void this.router.navigateByUrl('/login');
      }),
    );
  }

  // ===========================================================================
  // Session
  // ===========================================================================
  private establishSession(session: AuthSession): void {
    this.store.setSession(session);
  }

  // ===========================================================================
  // Mapping
  // ===========================================================================
  private toAuthSession(response: LoginResponse): AuthSession {
    return {
      user: response.user,
      accessToken: response.accessToken,
      expiresAt:
        response.expiresIn !== undefined ? Date.now() + response.expiresIn * 1000 : undefined,
    };
  }

  private clearSession(): void {
    this.store.clear();
  }
}
