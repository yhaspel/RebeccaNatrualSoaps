import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { CartFacade } from '../../abstraction/cart.facade';
import { I18nFacade } from '../../abstraction/i18n.facade';
import { formatMoney } from '../../core/utils/money';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { TranslateFieldPipe } from '../../shared/pipes/translate-field.pipe';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { RnsButtonDirective } from '../../shared/ui/button.directive';
import { IconComponent } from '../../shared/ui/icon.component';
import { QuantityStepperComponent } from '../../shared/ui/quantity-stepper.component';

@Component({
  selector: 'rns-cart',
  standalone: true,
  imports: [
    RouterLink,
    TranslocoPipe,
    MoneyPipe,
    TranslateFieldPipe,
    EmptyStateComponent,
    RnsButtonDirective,
    IconComponent,
    QuantityStepperComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 class="font-serif text-3xl text-ink sm:text-4xl">{{ 'cart.title' | transloco }}</h1>

      @if (cart.items().length === 0) {
        <div class="mt-6">
          <rns-empty-state [title]="'cart.empty' | transloco">
            <a routerLink="/products" rnsButton size="md">
              {{ 'cart.continueShopping' | transloco }}
            </a>
          </rns-empty-state>
        </div>
      } @else {
        <div class="mt-8 grid gap-10 md:grid-cols-[1fr,20rem]">
          <ul class="divide-y divide-sage/10 rounded-soft bg-ivory shadow-soft">
            @for (line of cart.items(); track line.product.id) {
              <li class="flex gap-4 p-4">
                <div
                  class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-soft bg-sage/10"
                  aria-hidden="true"
                >
                  @if (line.product.image_url) {
                    <img
                      [src]="line.product.image_url"
                      [alt]="line.product | trField: 'name'"
                      class="h-full w-full object-cover"
                    />
                  } @else {
                    <div class="flex h-full w-full items-center justify-center text-sage-dark/40">
                      <rns-icon name="soap-bar" size="32"></rns-icon>
                    </div>
                  }
                </div>
                <div class="flex-1">
                  <h2 class="font-serif text-base text-ink">
                    {{ line.product | trField: 'name' }}
                  </h2>
                  <p class="mt-1 text-sm text-ink/60">
                    {{ line.product.price_cents | money: line.product.currency }}
                  </p>
                  <div class="mt-2 flex flex-wrap items-center gap-3">
                    <rns-quantity-stepper
                      [value]="line.quantity"
                      [min]="1"
                      [max]="50"
                      (valueChange)="setQty(line.product.id, $event)"
                    ></rns-quantity-stepper>
                    <button
                      type="button"
                      class="text-xs text-ink/60 underline hover:text-clay-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                      (click)="cart.remove(line.product.id)"
                    >
                      {{ 'common.remove' | transloco }}
                    </button>
                  </div>
                </div>
                <div class="text-end">
                  <p class="font-medium text-ink">
                    {{ line.lineTotalCents | money: line.product.currency }}
                  </p>
                </div>
              </li>
            }
          </ul>

          <aside class="rounded-soft bg-ivory p-6 shadow-soft">
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between">
                <dt>{{ 'cart.subtotal' | transloco }}</dt>
                <dd>{{ cart.subtotalCents() | money: cart.currency() }}</dd>
              </div>
              <div class="flex justify-between">
                <dt>{{ 'cart.shipping' | transloco }}</dt>
                <dd>
                  @if (cart.shippingCents() === 0) {
                    {{ 'cart.freeShipping' | transloco }}
                  } @else {
                    {{ cart.shippingCents() | money: cart.currency() }}
                  }
                </dd>
              </div>
              <div class="flex justify-between border-t border-sage/10 pt-3 text-base font-medium">
                <dt>{{ 'cart.total' | transloco }}</dt>
                <dd>{{ cart.totalCents() | money: cart.currency() }}</dd>
              </div>
            </dl>
            <p class="mt-3 text-xs text-ink/60">
              {{ 'cart.shippingNoteFreeAt' | transloco: { amount: freeShippingFormatted() } }}
            </p>
            <a routerLink="/checkout" rnsButton size="lg" class="mt-6 w-full">
              {{ 'cart.checkout' | transloco }}
            </a>
            <a
              routerLink="/products"
              rnsButton="link"
              class="mt-3 inline-flex items-center justify-center gap-1 w-full"
            >
              <rns-icon name="arrow-left" size="14" class="rtl:rotate-180"></rns-icon>
              {{ 'cart.continueShopping' | transloco }}
            </a>
          </aside>
        </div>
      }
    </section>
  `,
})
export class CartComponent implements OnInit {
  protected cart = inject(CartFacade);
  private i18n = inject(I18nFacade);

  ngOnInit(): void {
    // Items are hydrated on app start but we can guard anyway.
    if (!this.cart.items().length) {
      this.cart.hydrate();
    }
  }

  setQty(productId: number, qty: number): void {
    const n = Math.max(0, Math.min(50, Math.floor(qty)));
    this.cart.setQuantity(productId, n);
  }

  freeShippingFormatted(): string {
    return formatMoney(20000, this.cart.currency(), this.i18n.language());
  }
}
