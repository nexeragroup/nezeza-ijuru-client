import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'light'
  | 'neutral'
  | 'blue'
  | 'green'
  | 'red'
  | 'yellow'
  | 'orange'
  | 'purple'
  | 'teal'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export type ButtonAppearance = 'solid' | 'soft' | 'outline' | 'ghost' | 'link';

export type ButtonSize = 'small' | 'medium' | 'large';

export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  standalone: false,
  styleUrl: './button.css',
  templateUrl: './button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  @Input()
  color: ButtonColor = 'primary';

  @Input()
  appearance: ButtonAppearance = 'solid';

  @Input()
  size: ButtonSize = 'medium';

  @Input()
  type: ButtonType = 'button';

  @Input()
  disabled = false;

  @Input()
  loading = false;

  @Input()
  fullWidth = false;

  @Input()
  iconOnly = false;

  @Input({ transform: booleanAttribute })
  autofocus = false;

  /** Link destination outside the application. */
  @Input()
  href?: string;

  /** Internal application route. */
  @Input()
  route?: string;

  @Input()
  target?: '_blank' | '_self' | '_parent' | '_top';

  @Input()
  rel?: string;

  @Input()
  ariaLabel?: string;

  @Input()
  name?: string;

  @Input()
  value?: string;

  @Input()
  prefixIcon?: string;

  @Input()
  suffixIcon?: string;

  @Input()
  loadingLabel = 'Loading';

  @Output()
  readonly buttonClick = new EventEmitter<MouseEvent>();

  get interactionDisabled(): boolean {
    return this.disabled || this.loading;
  }

  get classes(): string {
    return [
      'button',
      `button--${this.size}`,
      `button--${this.appearance}`,
      `button--${this.color}`,
      this.fullWidth ? 'button--full-width' : '',
      this.iconOnly ? 'button--icon-only' : '',
      this.loading ? 'button--loading' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  get linkRel(): string | null {
    return this.rel ?? (this.target === '_blank' ? 'noopener noreferrer' : null);
  }

  handleClick(event: MouseEvent): void {
    if (this.interactionDisabled) {
      event.preventDefault();
      event.stopPropagation();

      return;
    }

    this.buttonClick.emit(event);
  }
}
