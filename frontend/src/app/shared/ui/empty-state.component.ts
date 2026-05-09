import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'rns-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-soft border border-dashed border-sage/30 bg-ivory/60 px-6 py-12 text-center">
      @if (title) {
        <h3 class="font-serif text-xl text-ink">{{ title }}</h3>
      }
      @if (body) {
        <p class="mt-2 text-sm text-ink/70">{{ body }}</p>
      }
      <div class="mt-4">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() title = '';
  @Input() body = '';
}
