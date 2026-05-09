import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  computed,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';

import { CatalogFacade } from '../../abstraction/catalog.facade';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { TranslateFieldPipe } from '../../shared/pipes/translate-field.pipe';
import { SpinnerComponent } from '../../shared/ui/spinner.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { AlertComponent } from '../../shared/ui/alert.component';
import { IconComponent } from '../../shared/ui/icon.component';

@Component({
  selector: 'rns-products',
  standalone: true,
  imports: [
    RouterLink,
    TranslocoPipe,
    MoneyPipe,
    TranslateFieldPipe,
    SpinnerComponent,
    EmptyStateComponent,
    AlertComponent,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header class="mb-6 text-center">
        <h1 class="font-serif text-3xl text-ink sm:text-4xl">{{ 'products.title' | transloco }}</h1>
        <p class="mt-2 text-ink/70">{{ 'products.subtitle' | transloco }}</p>
      </header>

      <!-- Category tabs -->
      <div
        role="tablist"
        [attr.aria-label]="'products.tabAriaLabel' | transloco"
        class="mb-8 flex flex-wrap justify-center gap-2"
        (keydown)="onTabsKeydown($event)"
      >
        <button
          #tab
          role="tab"
          type="button"
          [attr.aria-selected]="activeSlug() === null"
          [attr.tabindex]="activeSlug() === null ? 0 : -1"
          [class.bg-sage]="activeSlug() === null"
          [class.text-ivory]="activeSlug() === null"
          [class.bg-ivory]="activeSlug() !== null"
          [class.border-sage]="activeSlug() !== null"
          class="rounded-full border border-sage/30 px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
          (click)="selectCategory(null)"
        >
          {{ 'categories.all' | transloco }}
        </button>
        @for (cat of catalog.categories(); track cat.id) {
          <button
            #tab
            role="tab"
            type="button"
            [attr.aria-selected]="activeSlug() === cat.slug"
            [attr.tabindex]="activeSlug() === cat.slug ? 0 : -1"
            [class.bg-sage]="activeSlug() === cat.slug"
            [class.text-ivory]="activeSlug() === cat.slug"
            [class.bg-ivory]="activeSlug() !== cat.slug"
            [class.border-sage]="activeSlug() !== cat.slug"
            class="rounded-full border border-sage/30 px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
            (click)="selectCategory(cat.slug)"
          >
            {{ cat | trField: 'name' }}
          </button>
        }
      </div>

      @if (catalog.loading()) {
        <rns-spinner></rns-spinner>
      } @else if (catalog.error()) {
        <rns-alert tone="error">{{ ('errors.loadProducts' | transloco) }}</rns-alert>
      } @else if (catalog.products().length === 0) {
        <rns-empty-state [title]="'products.empty' | transloco"></rns-empty-state>
      } @else {
        <ul class="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          @for (p of catalog.products(); track p.id) {
            <li>
              <a
                [routerLink]="['/products', p.id]"
                class="group block rounded-soft bg-ivory shadow-soft transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
              >
                <div
                  class="aspect-square overflow-hidden rounded-t-soft bg-sage/10"
                  aria-hidden="true"
                >
                  @if (p.image_url && !brokenImages().has(p.id)) {
                    <img
                      [src]="p.image_url"
                      [alt]="p | trField: 'name'"
                      class="h-full w-full object-cover transition group-hover:scale-105"
                      loading="lazy"
                      (error)="markBroken(p.id)"
                    />
                  } @else {
                    <div class="flex h-full w-full items-center justify-center text-sage-dark/40">
                      <rns-icon name="soap-bar" size="48"></rns-icon>
                    </div>
                  }
                </div>
                <div class="p-3">
                  <h2 class="font-serif text-base text-ink">{{ p | trField: 'name' }}</h2>
                  <p class="mt-1 text-sm text-ink/70">
                    {{ p.price_cents | money: p.currency }}
                  </p>
                  @if (p.stock === 0) {
                    <p class="mt-1 text-xs text-clay">{{ 'common.outOfStock' | transloco }}</p>
                  }
                </div>
              </a>
            </li>
          }
        </ul>
      }
    </section>
  `,
})
export class ProductsComponent implements OnInit {
  protected catalog = inject(CatalogFacade);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Tracks product IDs whose image URL 404'd so we can fall back to the placeholder.
  private _brokenImages = signal<Set<number>>(new Set());
  protected brokenImages = this._brokenImages.asReadonly();

  protected markBroken(id: number): void {
    const next = new Set(this._brokenImages());
    next.add(id);
    this._brokenImages.set(next);
  }

  private queryParams = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  activeSlug = computed(() => this.queryParams().get('category'));

  ngOnInit(): void {
    this.catalog.loadCategories();
    this.catalog.loadProducts(this.activeSlug());
    // Reload on query-param change.
    this.route.queryParamMap.subscribe((params) => {
      this.catalog.loadProducts(params.get('category'));
    });
  }

  selectCategory(slug: string | null): void {
    this.router.navigate([], {
      queryParams: { category: slug || null },
      queryParamsHandling: 'merge',
    });
  }

  // Tab buttons (the All-soaps tab plus one per category) — collected so we
  // can move focus on arrow-key navigation per the WAI-ARIA tabs pattern.
  protected tabs = viewChildren<ElementRef<HTMLButtonElement>>('tab');

  protected onTabsKeydown(event: KeyboardEvent): void {
    const key = event.key;
    if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Home' && key !== 'End') return;
    event.preventDefault();

    const buttons = this.tabs().map((t) => t.nativeElement);
    if (buttons.length === 0) return;

    const isRtl = document.documentElement.dir === 'rtl';
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    let next = current === -1 ? 0 : current;

    if (key === 'Home') next = 0;
    else if (key === 'End') next = buttons.length - 1;
    else {
      // In RTL, ArrowRight goes to the previous tab, ArrowLeft to the next.
      const direction = (key === 'ArrowRight' ? 1 : -1) * (isRtl ? -1 : 1);
      next = (current + direction + buttons.length) % buttons.length;
    }
    buttons[next].focus();
    buttons[next].click();
  }
}
