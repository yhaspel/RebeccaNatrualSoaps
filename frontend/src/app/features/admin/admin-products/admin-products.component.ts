import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AdminFacade } from '../../../abstraction/admin.facade';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';
import { TranslateFieldPipe } from '../../../shared/pipes/translate-field.pipe';
import { SpinnerComponent } from '../../../shared/ui/spinner.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { RnsButtonDirective } from '../../../shared/ui/button.directive';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog.component';
import { IconComponent } from '../../../shared/ui/icon.component';

@Component({
  selector: 'rns-admin-products',
  standalone: true,
  imports: [
    RouterLink,
    TranslocoPipe,
    MoneyPipe,
    TranslateFieldPipe,
    SpinnerComponent,
    EmptyStateComponent,
    RnsButtonDirective,
    ConfirmDialogComponent,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div class="flex items-center justify-between">
        <h1 class="font-serif text-3xl text-ink">{{ 'admin.products.title' | transloco }}</h1>
        <a routerLink="/admin/products/new" rnsButton size="md">
          + {{ 'admin.products.newCta' | transloco }}
        </a>
      </div>

      @if (admin.loading()) {
        <rns-spinner></rns-spinner>
      } @else if (admin.products().length === 0) {
        <div class="mt-8">
          <rns-empty-state [title]="'admin.products.empty' | transloco"></rns-empty-state>
        </div>
      } @else {
        <div class="mt-6 overflow-x-auto rounded-soft bg-cream shadow-soft">
          <table class="min-w-full divide-y divide-sage/10 text-sm">
            <thead class="bg-ivory/80 text-start text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th class="px-4 py-3 text-start">
                  {{ 'admin.products.columns.image' | transloco }}
                </th>
                <th class="px-4 py-3 text-start">
                  {{ 'admin.products.columns.name' | transloco }}
                </th>
                <th class="px-4 py-3 text-start">
                  {{ 'admin.products.columns.category' | transloco }}
                </th>
                <th class="px-4 py-3 text-start">
                  {{ 'admin.products.columns.price' | transloco }}
                </th>
                <th class="px-4 py-3 text-start">
                  {{ 'admin.products.columns.stock' | transloco }}
                </th>
                <th class="px-4 py-3 text-start">
                  {{ 'admin.products.columns.status' | transloco }}
                </th>
                <th class="px-4 py-3 text-end">
                  {{ 'admin.products.columns.actions' | transloco }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-sage/10">
              @for (p of admin.products(); track p.id) {
                <tr class="hover:bg-ivory/50">
                  <td class="px-4 py-3">
                    <div
                      class="h-10 w-10 overflow-hidden rounded bg-sage/10"
                      aria-hidden="true"
                    >
                      @if (p.image_url && !brokenImages().has(p.id)) {
                        <img
                          [src]="p.image_url"
                          alt=""
                          class="h-full w-full object-cover"
                          (error)="markBroken(p.id)"
                        />
                      } @else {
                        <div class="flex h-full w-full items-center justify-center text-sage-dark/40">
                          <rns-icon name="soap-bar" size="20"></rns-icon>
                        </div>
                      }
                    </div>
                  </td>
                  <td class="px-4 py-3 font-medium text-ink">
                    {{ p | trField: 'name' }}
                    @if (p.is_featured) {
                      <span class="ms-2 rounded bg-clay/20 px-1.5 py-0.5 text-[10px] text-clay">
                        {{ 'admin.products.featured' | transloco }}
                      </span>
                    }
                  </td>
                  <td class="px-4 py-3 text-ink/70">{{ p.category_slug }}</td>
                  <td class="px-4 py-3 text-ink/70">
                    {{ p.price_cents | money: p.currency }}
                  </td>
                  <td class="px-4 py-3 text-ink/70">{{ p.stock }}</td>
                  <td class="px-4 py-3">
                    @if (p.is_active) {
                      <span class="text-sage">{{
                        'admin.products.statusActive' | transloco
                      }}</span>
                    } @else {
                      <span class="text-ink/50">{{
                        'admin.products.statusInactive' | transloco
                      }}</span>
                    }
                  </td>
                  <td class="px-4 py-3 text-end">
                    <div class="flex items-center justify-end gap-3">
                      <a
                        [routerLink]="['/admin/products', p.id, 'edit']"
                        class="text-sage hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                      >
                        {{ 'common.edit' | transloco }}
                      </a>
                      <button
                        type="button"
                        (click)="askDelete(p.id)"
                        class="text-clay-dark hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay"
                      >
                        {{ 'common.delete' | transloco }}
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <rns-confirm-dialog
        [open]="pendingDeleteId() !== null"
        [title]="'admin.products.deleteConfirmTitle' | transloco"
        [body]="'admin.products.deleteConfirm' | transloco"
        [confirmLabel]="'common.delete' | transloco"
        [cancelLabel]="'common.cancel' | transloco"
        variant="destructive"
        (confirm)="onDeleteConfirmed()"
        (cancel)="pendingDeleteId.set(null)"
      ></rns-confirm-dialog>
    </section>
  `,
})
export class AdminProductsComponent implements OnInit {
  protected admin = inject(AdminFacade);

  // Tracks product IDs whose image URL 404'd so we can fall back to the placeholder.
  private _brokenImages = signal<Set<number>>(new Set());
  protected brokenImages = this._brokenImages.asReadonly();

  protected markBroken(id: number): void {
    const next = new Set(this._brokenImages());
    next.add(id);
    this._brokenImages.set(next);
  }

  // Drives the confirm dialog. `null` = closed; number = product to delete on confirm.
  protected pendingDeleteId = signal<number | null>(null);

  ngOnInit(): void {
    this.admin.loadProducts();
  }

  protected askDelete(id: number): void {
    this.pendingDeleteId.set(id);
  }

  protected onDeleteConfirmed(): void {
    const id = this.pendingDeleteId();
    if (id !== null) {
      this.admin.deleteProduct(id);
    }
    this.pendingDeleteId.set(null);
  }
}
