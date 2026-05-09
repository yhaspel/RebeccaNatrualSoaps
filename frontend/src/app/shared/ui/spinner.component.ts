import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'rns-spinner',
  standalone: true,
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-center gap-3 py-8 text-ink/60" role="status">
      <span
        class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-sage/30 border-t-sage"
        aria-hidden="true"
      ></span>
      <span class="text-sm">{{ label || ('common.loading' | transloco) }}</span>
    </div>
  `,
})
export class SpinnerComponent {
  @Input() label = '';
}
