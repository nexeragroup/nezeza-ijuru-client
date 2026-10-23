import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { StorageService } from './storage.service';

const DEVICE_ID_KEY = 'nezeza-ijuru.device-id';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly storage = inject(StorageService);

  getOrCreateId(): string | undefined {
    if (!this.browser) return undefined;

    const existing = this.storage.get<string>(DEVICE_ID_KEY);
    if (existing) return existing;

    const deviceId = uuid();
    this.storage.set(DEVICE_ID_KEY, deviceId);
    return deviceId;
  }
}
