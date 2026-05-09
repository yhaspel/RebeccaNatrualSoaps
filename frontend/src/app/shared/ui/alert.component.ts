import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type AlertTone = 'info' | 'success' | 'error';

@Component({
  selector: 'rns-alert',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="alert"
      class="rounded-soft border px-4 py-3 text-sm"
      [class.bg-ivory]="tone === 'info'"
      [class.border-sage]="tone === 'info' || tone === 'success'"
      [class.text-ink]="tone !== 'error'"
      [class.bg-sage]="tone === 'success'"
      [class.text-ivory]="tone === 'success'"
      [class.bg-red-50]="tone === 'error'"
      [class.border-red-300]="tone === 'error'"
      [class.text-red-800]="tone === 'error'"
    >
      <ng-content></ng-content>
    </div>
  `,
})
export class AlertComponent {
  @Input() tone: AlertTone = 'info';
}
