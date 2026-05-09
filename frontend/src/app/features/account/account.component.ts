import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthFacade } from '../../abstraction/auth.facade';
import { OrdersFacade } from '../../abstraction/orders.facade';
import { I18nFacade } from '../../abstraction/i18n.facade';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { RnsButtonDirective } from '../../shared/ui/button.directive';

@Component({
  selector: 'rns-account',
  standalone: true,
  imports: [RouterLink, TranslocoPipe, MoneyPipe, EmptyStateComponent, RnsButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="font-serif text-3xl text-ink">{{ 'account.title' | transloco }}</h1>
          <p class="mt-1 text-ink/70">
            {{ 'account.greeting' | transloco: { name: auth.displayName() } }}
          </p>
        </div>
        <button type="button" rnsButton="secondary" size="sm" (click)="auth.logout()">
          {{ 'account.signOut' | transloco }}
        </button>
      </div>

      <section class="mt-10">
        <h2 class="font-serif text-xl text-ink">{{ 'account.ordersTitle' | transloco }}</h2>
        @if (orders.myOrders().length === 0) {
          <div class="mt-4">
            <rns-empty-state [title]="'account.noOrders' | transloco">
              <a routerLink="/products" rnsButton size="md">
                {{ 'common.keepShopping' | transloco }}
              </a>
            </rns-empty-state>
          </div>
        } @else {
          <ul class="mt-4 space-y-3">
            @for (o of orders.myOrders(); track o.id) {
              <li class="rounded-soft bg-ivory p-5 shadow-soft">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 class="font-medium text-ink">
                      {{ 'account.orderNumber' | transloco: { id: o.id } }}
                    </h3>
                    <p class="text-xs text-ink/60">
                      {{ 'account.orderDate' | transloco: { date: formatDate(o.created_at) } }}
                    </p>
                  </div>
                  <div class="text-end">
                    <p class="text-sm font-medium">
                      {{ o.total_cents | money: o.currency }}
                    </p>
                    <p class="text-xs uppercase tracking-wide text-ink/60">
                      {{ statusKey(o.status) | transloco }}
                    </p>
                  </div>
                </div>
              </li>
            }
          </ul>
        }
      </section>
    </section>
  `,
})
export class AccountComponent implements OnInit {
  protected auth = inject(AuthFacade);
  protected orders = inject(OrdersFacade);
  protected i18n = inject(I18nFacade);

  ngOnInit(): void {
    this.orders.loadMyOrders();
  }

  formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString(
        this.i18n.language() === 'he' ? 'he-IL' : 'en-IL',
      );
    } catch {
      return iso;
    }
  }

  statusKey(status: string): string {
    switch (status) {
      case 'pending_payment':
        return 'admin.orders.statusPending';
      case 'paid':
        return 'admin.orders.statusPaid';
      case 'fulfilled':
        return 'admin.orders.statusFulfilled';
      case 'canceled':
        return 'admin.orders.statusCanceled';
      default:
        return status;
    }
  }
}
