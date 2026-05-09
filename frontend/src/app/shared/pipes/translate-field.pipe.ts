import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nFacade } from '../../abstraction/i18n.facade';

/**
 * Returns the language-appropriate field off a bilingual record.
 *
 * Usage: `{{ product | trField:'name' }}` yields `name_he` when lang = he, else `name_en`.
 */
@Pipe({
  name: 'trField',
  standalone: true,
  pure: false,
})
export class TranslateFieldPipe implements PipeTransform {
  private i18n = inject(I18nFacade);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(obj: any, base: string): string {
    return this.i18n.tr(obj as Record<string, unknown>, base);
  }
}
