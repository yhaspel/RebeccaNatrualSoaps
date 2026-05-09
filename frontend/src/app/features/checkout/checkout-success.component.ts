import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { OrdersFacade } from '../../abstraction/orders.facade';
import { RnsButtonDirective } from '../../shared/ui/button.directive';
import { IconComponent } from '../../shared/ui/icon.component';

@Component({
  selector: 'rns-checkout-success',
  standalone: true,
  imports: [RouterLink, TranslocoPipe, RnsButtonDirective, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <div
        class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sage/15 text-sage-dark"
        aria-hidden="true"
      >
        <rns-icon name="check" size="32"></rns-icon>
      </div>
      <h1 class="mt-6 font-serif text-4xl text-ink">
        {{ 'checkout.successTitle' | transloco }}
      </h1>
      <p class="mt-4 text-ink/70">
        {{ 'checkout.successBody' | transloco: { id: orderId() ?? '—' } }}
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        @if (orderId()) {
          <a [routerLink]="['/account']" rnsButton="secondary" size="md">
            {{ 'checkout.viewOrder' | transloco }}
          </a>
        }
        <a routerLink="/products" rnsButton size="md">
          {{ 'checkout.keepShopping' | transloco }}
        </a>
      </div>
    </section>
  `,
})
export class CheckoutSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orders = inject(OrdersFacade);
  private _id = signal<string | null>(null);
  orderId = this._id.asReadonly();

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('id');
    this._id.set(id);

    // When returning from Grow (non-mock), confirm the order server-side
    const isMock = this.route.snapshot.queryParamMap.get('mock');
    if (id && !isMock) {
      this.orders.confirm(Number(id)).subscribe();
    }
  }
}
