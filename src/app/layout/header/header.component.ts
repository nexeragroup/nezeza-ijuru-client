import { Component, inject, signal } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';

interface NavigationItem {
  readonly label: string;
  readonly href: string;
}

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  readonly theme = inject(ThemeService);
  readonly navigation: readonly NavigationItem[] = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Conferences', href: '/conferences' },
    { label: 'Programs', href: '/programs' },
    { label: 'Media', href: '/media' },
    { label: 'Contact', href: '/contact' },
  ];
  readonly isOpen = signal(false);

  toggleNavigation(): void {
    this.isOpen.update((open) => !open);
  }

  closeNavigation(): void {
    this.isOpen.set(false);
  }
}
