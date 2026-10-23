import { Component, inject } from '@angular/core';
import { AlertService } from '../../../../shared/components/alert/alert.service';
import type { InputOption } from '../../../../shared/components/input/input';

@Component({
  selector: 'app-contact-page',
  standalone: false,
  styleUrl: './contact-page.css',
  templateUrl: './contact-page.html',
})
export class ContactPage {
  private readonly alerts = inject(AlertService);

  readonly subjectOptions: readonly InputOption[] = [
    { label: 'Attend an upcoming activity', value: 'attend' },
    { label: 'Serve or volunteer', value: 'serve' },
    { label: 'Support the mission', value: 'support' },
    { label: 'Partnership or collaboration', value: 'partnership' },
    { label: 'Share a testimony or story', value: 'testimony' },
    { label: 'Ask about our programs', value: 'programs' },
    { label: 'Media or communication inquiry', value: 'media' },
    { label: 'General question', value: 'general' },
  ];

  announceEmailClient(): void {
    this.alerts.success('Your email app is opening with your message ready to send.', {
      title: 'Message ready',
    });
  }
}
