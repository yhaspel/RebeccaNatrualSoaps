import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { I18nFacade } from './abstraction/i18n.facade';
import { AuthFacade } from './abstraction/auth.facade';
import { CartFacade } from './abstraction/cart.facade';
import { CatalogFacade } from './abstraction/catalog.facade';

@Component({
  selector: 'rns-root',
  standalone: true,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<router-outlet />`,
})
export class AppComponent {
  // Initialize app-wide facades. Each facade handles its own bootstrap (hydrating
  // stored state, setting document dir/lang, etc.)
  private i18n = inject(I18nFacade);
  private auth = inject(AuthFacade);
  private cart = inject(CartFacade);
  private catalog = inject(CatalogFacade);

  constructor() {
    this.i18n.init();
    this.auth.hydrate();
    this.cart.hydrate();
    this.catalog.loadCategories();
  }
}
