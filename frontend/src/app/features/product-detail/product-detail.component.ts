import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { CatalogApi } from '../../core/services/catalog.api';
import { Product } from '../../core/models/product.model';
import { CartFacade } from '../../abstraction/cart.facade';
import { CatalogFacade } from '../../abstraction/catalog.facade';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { TranslateFieldPipe } from '../../shared/pipes/translate-field.pipe';
import { SpinnerComponent } from '../../shared/ui/spinner.component';
import { AlertComponent } from '../../shared/ui/alert.component';
import { RnsButtonDirective } from '../../shared/ui/button.directive';
import { IconComponent } from '../../shared/ui/icon.component';
import { QuantityStepperComponent } from '../../shared/ui/quantity-stepper.component';

@Component({
  selector: 'rns-product-detail',
  standalone: true,
  imports: [
    RouterLink,
    TranslocoPipe,
    MoneyPipe,
    TranslateFieldPipe,
    SpinnerComponent,
    AlertComponent,
    RnsButtonDirective,
    IconComponent,
    QuantityStepperComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <nav class="mb-6 text-sm text-ink/60" aria-label="Breadcrumb">
        <a routerLink="/products" class="hover:text-sage">{{
          'productDetail.breadcrumbShop' | transloco
        }}</a>
        <span class="mx-2" aria-hidden="true">/</span>
        <span>{{ product() ? (product()! | trField: 'name') : '' }}</span>
      </nav>

      @if (loading()) {
        <rns-spinner></rns-spinner>
      } @else if (notFound()) {
        <div class="text-center">
          <h1 class="font-serif text-3xl text-ink">
            {{ 'productDetail.notFoundTitle' | transloco }}
          </h1>
          <p class="mt-2 text-ink/70">{{ 'productDetail.notFoundBody' | transloco }}</p>
          <a routerLink="/products" rnsButton size="md" class="mt-6">
            {{ 'common.keepShopping' | transloco }}
          </a>
        </div>
      } @else if (product()) {
        @let p = product()!;
        <div class="grid gap-10 md:grid-cols-2">
          <div class="overflow-hidden rounded-soft bg-sage/10 shadow-soft">
            @if (p.image_url && !imageBroken()) {
              <img
                [src]="p.image_url"
                [alt]="p | trField: 'name'"
                class="aspect-square w-full object-cover"
                (error)="imageBroken.set(true)"
              />
            } @else {
              <div
                class="flex aspect-square w-full items-center justify-center text-sage-dark/40"
                aria-hidden="true"
              >
                <rns-icon name="soap-bar" size="120"></rns-icon>
              </div>
            }
          </div>
          <div>
            <h1 class="font-serif text-3xl text-ink sm:text-4xl">{{ p | trField: 'name' }}</h1>
            <p class="mt-2 text-lg text-ink/80">{{ p.price_cents | money: p.currency }}</p>

            <p class="mt-6 whitespace-pre-line leading-relaxed text-ink/80">
              {{ p | trField: 'description' }}
            </p>

            <div class="mt-6">
              @if (p.stock === 0) {
                <p class="text-sm font-medium text-clay">{{ 'common.outOfStock' | transloco }}</p>
              } @else if (p.stock <= 5) {
                <p class="text-sm text-clay">
                  {{ 'productDetail.stockLeft' | transloco: { count: p.stock } }}
                </p>
              } @else {
                <p class="text-sm text-ink/60">{{ 'productDetail.inStock' | transloco }}</p>
              }
            </div>

            <div class="mt-4 flex items-center gap-3">
              <span class="text-sm text-ink/70">{{ 'common.quantity' | transloco }}</span>
              <rns-quantity-stepper
                [value]="qty()"
                [min]="1"
                [max]="10"
                (valueChange)="setQty($event)"
              ></rns-quantity-stepper>
            </div>

            <button
              type="button"
              rnsButton
              size="lg"
              class="mt-6"
              [disabled]="p.stock === 0"
              (click)="addToCart(p)"
            >
              {{ 'common.addToCart' | transloco }}
            </button>

            <!-- Persistent live region — content updates whenever the user
                 hits "Add to cart", which screen readers announce via
                 aria-live=polite. Empty by default so it doesn't add to the
                 visible layout when there's nothing to announce. -->
            <div class="mt-4 min-h-6" role="status" aria-live="polite">
              @if (justAdded()) {
                <p class="inline-flex items-center gap-2 rounded-full bg-sage/15 px-3 py-1 text-sm text-sage-dark">
                  <rns-icon name="check" size="16"></rns-icon>
                  {{ 'productDetail.added' | transloco }}
                </p>
              }
            </div>

            <section class="mt-10 border-t border-sage/10 pt-6">
              <h2 class="font-serif text-lg text-ink">
                {{ 'productDetail.ingredientsTitle' | transloco }}
              </h2>
              <p class="mt-2 whitespace-pre-line text-sm text-ink/70">
                {{ p | trField: 'ingredients' }}
              </p>
            </section>
          </div>
        </div>

        @if (related().length > 0) {
          <section class="mt-16 border-t border-sage/10 pt-12">
            <h2 class="font-serif text-2xl text-ink sm:text-3xl">
              {{ 'productDetail.relatedTitle' | transloco }}
            </h2>
            <ul class="mt-6 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              @for (r of related(); track r.id) {
                <li>
                  <a
                    [routerLink]="['/products', r.id]"
                    class="group block rounded-soft bg-ivory shadow-soft transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                  >
                    <div
                      class="aspect-square overflow-hidden rounded-t-soft bg-sage/10"
                      aria-hidden="true"
                    >
                      @if (r.image_url) {
                        <img
                          [src]="r.image_url"
                          [alt]="r | trField: 'name'"
                          class="h-full w-full object-cover transition group-hover:scale-105"
                          loading="lazy"
                        />
                      } @else {
                        <div class="flex h-full w-full items-center justify-center text-sage-dark/40">
                          <rns-icon name="soap-bar" size="40"></rns-icon>
                        </div>
                      }
                    </div>
                    <div class="p-3">
                      <h3 class="font-serif text-base text-ink">{{ r | trField: 'name' }}</h3>
                      <p class="mt-1 text-sm text-ink/70">
                        {{ r.price_cents | money: r.currency }}
                      </p>
                    </div>
                  </a>
                </li>
              }
            </ul>
          </section>
        }
      }
    </section>
  `,
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(CatalogApi);
  private cart = inject(CartFacade);
  protected catalog = inject(CatalogFacade);

  private _product = signal<Product | null>(null);
  private _loading = signal(true);
  private _notFound = signal(false);
  private _qty = signal(1);
  private _justAdded = signal(false);
  protected imageBroken = signal(false);

  product = this._product.asReadonly();
  loading = this._loading.asReadonly();
  notFound = this._notFound.asReadonly();
  qty = this._qty.asReadonly();
  justAdded = this._justAdded.asReadonly();

  /** Up to four related products from the same category, excluding this one. */
  protected related = computed(() => {
    const current = this._product();
    if (!current) return [];
    const all = this.catalog.products();
    return all
      .filter(
        (p) => p.id !== current.id && p.category_slug === current.category_slug && p.is_active,
      )
      .slice(0, 4);
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this._notFound.set(true);
      this._loading.set(false);
      return;
    }
    this.api.getProduct(id).subscribe({
      next: (p) => {
        this._product.set(p);
        this._loading.set(false);
        // Lazy-load the rest of the catalog so the "related" computed has
        // products to draw from.
        if (!this.catalog.products().length) {
          this.catalog.loadProducts();
        }
      },
      error: () => {
        this._notFound.set(true);
        this._loading.set(false);
      },
    });
  }

  setQty(value: number): void {
    const n = Math.max(1, Math.min(10, Math.floor(value)));
    this._qty.set(n);
  }

  addToCart(p: Product): void {
    this.cart.add(p, this._qty());
    this._justAdded.set(true);
    setTimeout(() => this._justAdded.set(false), 2500);
  }
}
