import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nFacade } from '../../abstraction/i18n.facade';
import { formatMoney } from '../../core/utils/money';

@Pipe({
  name: 'money',
  standalone: true,
  pure: false,
})
export class MoneyPipe implements PipeTransform {
  private i18n = inject(I18nFacade);

  transform(cents: number | null | undefined, currency = 'ILS'): string {
    if (cents == null) return '';
    return formatMoney(cents, currency, this.i18n.language());
  }
}
