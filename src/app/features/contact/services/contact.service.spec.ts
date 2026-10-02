import '@angular/compiler';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { lastValueFrom, of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { ApiService } from '../../../core/services/api.service';
import { ContactService } from './contact.service';

describe('ContactService', () => {
  it('bootstraps CSRF before submitting an inquiry', async () => {
    const get = vi.fn(() => of({ message: 'CSRF cookie initialized', token: 'csrf-token' }));
    const post = vi.fn(() => of({ message: 'Inquiry sent', reference: 'inquiry-1' }));
    const injector = createEnvironmentInjector(
      [{ provide: ApiService, useValue: { get, post } }],
      null,
    );
    const service = runInInjectionContext(injector, () => new ContactService());

    await expect(
      lastValueFrom(
        service.submitInquiry({
          names: 'Ada Lovelace',
          email: 'ada@example.test',
          service: 'consultation',
          projectDetails: 'I need help planning a reliable software product.',
        }),
      ),
    ).resolves.toEqual({ message: 'Inquiry sent', reference: 'inquiry-1' });

    injector.destroy();

    expect(get).toHaveBeenCalledWith('auth/csrf', expect.any(Object));
    expect(post).toHaveBeenCalledWith(
      'inquiries',
      expect.objectContaining({ email: 'ada@example.test' }),
      expect.objectContaining({ headers: { 'X-XSRF-TOKEN': 'csrf-token' } }),
    );
  });
});
