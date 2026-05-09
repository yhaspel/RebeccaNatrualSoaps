import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { I18nFacade } from '../../abstraction/i18n.facade';

@Component({
  selector: 'rns-language-toggle',
  standalone: true,
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="inline-flex min-h-11 items-center rounded-full border border-sage/40 bg-ivory/80 px-4 py-2.5 text-xs font-medium tracking-wide text-ink transition hover:border-sage hover:bg-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
      (click)="i18n.toggle()"
      [attr.aria-label]="'nav.language' | transloco"
      [lang]="i18n.language() === 'en' ? 'he' : 'en'"
    >
      {{ 'nav.toggleLang' | transloco }}
    </button>
  `,
})
export class LanguageToggleComponent {
  protected i18n = inject(I18nFacade);
}
