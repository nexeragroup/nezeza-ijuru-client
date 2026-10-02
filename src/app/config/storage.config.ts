import { InjectionToken } from '@angular/core';

export type StorageArea = 'local' | 'session';

export interface StorageConfig {
  /**
   * Prevents collisions with other applications
   * running on the same origin.
   *
   * Example:
   * nezeza-ijuru
   */
  namespace: string;

  /**
   * StorageArea schema version.
   *
   * Increment when persisted data becomes incompatible.
   */
  version: number;

  /**
   * Default storage mechanism.
   */
  defaultArea: StorageArea;
}

export const STORAGE_CONFIG = new InjectionToken<StorageConfig>('STORAGE_CONFIG');
