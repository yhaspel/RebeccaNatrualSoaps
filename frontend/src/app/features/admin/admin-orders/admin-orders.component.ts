import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { AdminFacade } from '../../../abstraction/admin.facade';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'rns-admin-orders',
  standalone: true,
  imports: [TranslocoPipe, MoneyPipe, EmptyStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 class="font-serif text-3xl text-ink">{{ 'admin.orders.title' | transloco }}</h1>

      @if (admin.orders().length === 0) {
        <div class="mt-8">
          <rns-empty-state [title]="'admin.orders.empty' | transloco"></rns-empty-state>
        </div>
      } @else {
        <div class="mt-6 overflow-x-auto rounded-soft bg-cream shadow-soft">
          <table class="min-w-full divide-y divide-sage/10 text-sm">
            <thead class="bg-ivory/80 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th class="px-4 py-3 text-start">
                  {{ 'admin.orders.columns.id' | transloco }}
                </th>
                <th class="px-4 py-3 text-start">
                  {{ 'admin.orders.columns.customer' | transloco }}
                </th>
                <th class="px-4 py-3 text-start">
                  {{ 'admin.orders.columns.total' | transloco }}
                </th>
                <th class="px-4 py-3 text-start">
                  {{ 'admin.orders.columns.status' | transloco }}
                </th>
                <th class="px-4 py-3 text-start">
                  {{ 'admin.orders.columns.placed' | transloco }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-sage/10">
              @for (o of admin.orders(); track o.id) {
                <tr class="hover:bg-ivory/50">
                  <td class="px-4 py-3 font-medium">#{{ o.id }}</td>
                  <td class="px-4 py-3">
                    <div class="font-medium text-ink">{{ o.full_name }}</div>
                    <div class="text-xs text-ink/60">{{ o.email }}</div>
                  </td>
                  <td class="px-4 py-3 text-ink/80">
                    {{ o.total_cents | money: o.currency }}
                  </td>
                  <td class="px-4 py-3">
                    <select
                      class="rounded-soft border border-sage/30 bg-ivory px-2 py-1 text-xs"
                      [value]="o.status"
                      (change)="updateStatus(o.id, $any($event.target).value)"
                    >
                      <option value="pending_payment">
                        {{ 'admin.orders.statusPending' | transloco }}
                      </option>
                      <option value="paid">{{ 'admin.orders.statusPaid' | transloco }}</option>
                      <option value="fulfilled">
                        {{ 'admin.orders.statusFulfilled' | transloco }}
                      </option>
                      <option value="canceled">
                        {{ 'admin.orders.statusCanceled' | transloco }}
                      </option>
                    </select>
                  </td>
                  <td class="px-4 py-3 text-ink/60">
                    {{ formatDate(o.created_at) }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
})
export class AdminOrdersComponent implements OnInit {
  protected admin = inject(AdminFacade);

  ngOnInit(): void {
    this.admin.loadOrders();
  }

  updateStatus(id: number, status: OrderStatus): void {
    this.admin.setOrderStatus(id, status);
  }

  formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }
}
