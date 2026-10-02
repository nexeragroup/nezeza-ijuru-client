export interface LoginRequest {
  identifier: string;
  pin: string;
  rememberDevice: boolean;
  deviceId?: string;
}

export interface AuthenticatedUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  avatarUrl?: string;
  permissions: readonly string[];
}

export interface LoginResponse {
  user: AuthenticatedUser;
  accessToken?: string;
  expiresIn?: number;
}

export interface AuthSession {
  user: AuthenticatedUser;
  accessToken?: string;
  /**
   * Absolute expiration timestamp in milliseconds.
   *
   * Example:
   * Date.now() + expiresIn * 1000
   */
  expiresAt?: number;
}
