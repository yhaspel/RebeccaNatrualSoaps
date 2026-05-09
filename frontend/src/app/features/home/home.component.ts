import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { CatalogFacade } from '../../abstraction/catalog.facade';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { TranslateFieldPipe } from '../../shared/pipes/translate-field.pipe';
import { RnsButtonDirective } from '../../shared/ui/button.directive';
import { IconComponent, IconName } from '../../shared/ui/icon.component';

@Component({
  selector: 'rns-home',
  standalone: true,
  imports: [
    RouterLink,
    TranslocoPipe,
    MoneyPipe,
    TranslateFieldPipe,
    RnsButtonDirective,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero -->
    <section class="bg-gradient-to-b from-cream via-cream to-ivory">
      <div class="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
        <div>
          <h1 class="font-serif text-4xl leading-tight text-ink sm:text-5xl md:text-6xl">
            {{ 'home.heroTitle' | transloco }}
          </h1>
          <p class="mt-6 max-w-lg text-base text-ink/70 sm:text-lg">
            {{ 'home.heroSubtitle' | transloco }}
          </p>
          <a routerLink="/products" rnsButton size="lg" class="mt-8">
            {{ 'home.heroCta' | transloco }}
            <rns-icon name="arrow-right" size="16" class="ms-1 rtl:rotate-180"></rns-icon>
          </a>
        </div>
        <div class="relative">
          <div
            class="aspect-[4/5] w-full overflow-hidden rounded-soft bg-ivory shadow-soft"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 400 500"
              class="h-full w-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <!-- Sprig -->
              <g fill="none" stroke="#8A9A7B" stroke-width="2" stroke-linecap="round">
                <path d="M200 220 C 200 180, 215 150, 250 130" />
                <path d="M200 230 C 200 200, 185 175, 155 160" />
                <!-- Leaves on the right curve -->
                <path
                  d="M225 175 q 20 -8, 30 5 q -20 8, -30 -5 z"
                  fill="#B6C2A5"
                  stroke="#6B7D5C"
                />
                <path
                  d="M240 145 q 22 -6, 28 8 q -22 6, -28 -8 z"
                  fill="#B6C2A5"
                  stroke="#6B7D5C"
                />
                <!-- Leaves on the left curve -->
                <path
                  d="M180 200 q -22 -6, -30 6 q 22 8, 30 -6 z"
                  fill="#B6C2A5"
                  stroke="#6B7D5C"
                />
                <path
                  d="M165 175 q -22 -4, -25 9 q 22 5, 25 -9 z"
                  fill="#B6C2A5"
                  stroke="#6B7D5C"
                />
              </g>
              <!-- Soap bar -->
              <g>
                <rect
                  x="120"
                  y="240"
                  width="160"
                  height="100"
                  rx="14"
                  fill="#F5EFE6"
                  stroke="#6B7D5C"
                  stroke-width="2"
                />
                <!-- Stamp / mark -->
                <text
                  x="200"
                  y="298"
                  text-anchor="middle"
                  font-family="Fraunces, Georgia, serif"
                  font-size="22"
                  font-style="italic"
                  fill="#6B7D5C"
                >R</text>
              </g>
              <!-- Shadow line under bar -->
              <line
                x1="105"
                y1="350"
                x2="295"
                y2="350"
                stroke="#E4DDD0"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <header class="mb-8 text-center">
        <h2 class="font-serif text-3xl text-ink sm:text-4xl">
          {{ 'home.categoriesTitle' | transloco }}
        </h2>
        <p class="mt-2 text-ink/70">{{ 'home.categoriesSubtitle' | transloco }}</p>
      </header>

      <ul class="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
        @for (cat of catalog.categories(); track cat.id) {
          <li>
            <a
              [routerLink]="['/products']"
              [queryParams]="{ category: cat.slug }"
              class="group flex h-full flex-col items-center rounded-soft border border-sage/15 bg-ivory p-6 text-center shadow-soft transition hover:-translate-y-0.5 hover:border-sage/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
            >
              <div
                class="flex h-20 w-20 items-center justify-center rounded-full"
                [class]="categoryCircleClass(cat.slug)"
                aria-hidden="true"
              >
                <rns-icon [name]="iconForSlug(cat.slug)" size="32"></rns-icon>
              </div>
              <h3 class="mt-5 font-serif text-xl text-ink">{{ cat | trField: 'name' }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-ink/60">
                {{ cat | trField: 'description' }}
              </p>
            </a>
          </li>
        }
      </ul>
    </section>

    <!-- Featured -->
    <section class="bg-ivory">
      <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <header class="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 class="font-serif text-3xl text-ink sm:text-4xl">
              {{ 'home.featuredTitle' | transloco }}
            </h2>
            <p class="mt-2 text-ink/70">{{ 'home.featuredSubtitle' | transloco }}</p>
          </div>
          <a
            routerLink="/products"
            rnsButton="link"
            class="hidden items-center gap-1 sm:inline-flex"
          >
            {{ 'common.viewAll' | transloco }}
            <rns-icon name="arrow-right" size="14" class="rtl:rotate-180"></rns-icon>
          </a>
        </header>

        <ul class="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          @for (p of catalog.featured().slice(0, 4); track p.id) {
            <li>
              <a
                [routerLink]="['/products', p.id]"
                class="group block rounded-soft bg-cream shadow-soft transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
              >
                <div
                  class="aspect-square overflow-hidden rounded-t-soft bg-sage/10"
                  aria-hidden="true"
                >
                  @if (p.image_url && !brokenImages().has(p.id)) {
                    <img
                      [src]="p.image_url"
                      [alt]="p | trField: 'name'"
                      class="h-full w-full object-cover"
                      loading="lazy"
                      (error)="markBroken(p.id)"
                    />
                  } @else {
                    <div class="flex h-full w-full items-center justify-center text-sage-dark/40">
                      <rns-icon name="soap-bar" size="48"></rns-icon>
                    </div>
                  }
                </div>
                <div class="p-3 text-center">
                  <h3 class="font-serif text-base text-ink">{{ p | trField: 'name' }}</h3>
                  <p class="mt-1 text-sm text-ink/70">{{ p.price_cents | money: p.currency }}</p>
                </div>
              </a>
            </li>
          }
        </ul>
      </div>
    </section>

    <!-- Story -->
    <section class="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
      <h2 class="font-serif text-3xl text-ink sm:text-4xl">{{ 'home.storyTitle' | transloco }}</h2>
      <p class="mt-6 text-lg italic text-ink/80">{{ 'home.storyLead' | transloco }}</p>
      <p class="mt-4 text-ink/70">{{ 'home.storyBody' | transloco }}</p>
      <a routerLink="/about" rnsButton="link" class="mt-6 inline-flex items-center gap-1">
        {{ 'home.storyCta' | transloco }}
        <rns-icon name="arrow-right" size="14" class="rtl:rotate-180"></rns-icon>
      </a>
    </section>

    <!-- Testimonials -->
    <section class="bg-ivory">
      <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 class="text-center font-serif text-3xl text-ink sm:text-4xl">
          {{ 'home.testimonialsTitle' | transloco }}
        </h2>
        <ul class="mt-10 grid gap-6 md:grid-cols-3">
          @for (t of testimonials; track t.key) {
            <li class="relative pt-8">
              <span
                aria-hidden="true"
                class="absolute start-0 top-0 font-serif text-7xl leading-none text-sage/40"
                style="font-family: var(--font-serif, 'Fraunces', Georgia, serif);"
              >&ldquo;</span>
              <blockquote
                class="font-serif text-lg italic leading-relaxed text-ink/85"
              >{{ t.quote | transloco }}</blockquote>
              <cite
                class="mt-4 block text-xs not-italic uppercase tracking-[0.12em] text-ink/55"
              >— {{ t.author | transloco }}</cite>
            </li>
          }
        </ul>
      </div>
    </section>

    <!-- Newsletter -->
    <section class="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <svg
        viewBox="0 0 100 30"
        class="mx-auto h-8 w-24 text-sage"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        stroke-width="1.2"
        stroke-linecap="round"
      >
        <path d="M5 20 q 20 -10, 45 -10 t 45 10" />
        <path d="M50 5 v 6" stroke-width="1" />
        <path d="M46 8 q 4 -2, 8 0" fill="currentColor" fill-opacity="0.25" stroke-width="0.8" />
      </svg>
      <h2 class="mt-3 font-serif text-3xl text-ink sm:text-4xl">
        {{ 'home.newsletterTitle' | transloco }}
      </h2>
      <p class="mt-2 text-ink/70">{{ 'home.newsletterHint' | transloco }}</p>
      <p class="mt-4 text-xs uppercase tracking-wide text-ink/60">
        {{ 'home.newsletterComingSoon' | transloco }}
      </p>
      <form
        class="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-center"
        (submit)="$event.preventDefault()"
      >
        <div class="flex flex-col gap-1 text-start sm:max-w-xs sm:flex-1">
          <label
            for="newsletter-email"
            class="text-xs font-medium text-ink/70"
          >
            {{ 'home.newsletterEmail' | transloco }}
          </label>
          <input
            id="newsletter-email"
            type="email"
            disabled
            class="w-full rounded-soft border border-sage/30 bg-ivory/60 px-4 py-3 text-sm text-ink placeholder:text-ink/40 disabled:cursor-not-allowed focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
            [placeholder]="'home.newsletterPlaceholder' | transloco"
          />
        </div>
        <button type="submit" rnsButton size="md" disabled>
          {{ 'home.newsletterCta' | transloco }}
        </button>
      </form>
    </section>
  `,
})
export class HomeComponent implements OnInit {
  protected catalog = inject(CatalogFacade);

  // Tracks product IDs whose image URL 404'd so we can fall back to the placeholder.
  private _brokenImages = signal<Set<number>>(new Set());
  protected brokenImages = this._brokenImages.asReadonly();

  protected markBroken(id: number): void {
    const next = new Set(this._brokenImages());
    next.add(id);
    this._brokenImages.set(next);
  }

  ngOnInit(): void {
    this.catalog.loadCategories();
    if (!this.catalog.products().length) {
      this.catalog.loadProducts();
    }
  }

  protected readonly testimonials = [
    { key: 't1', quote: 'home.t1', author: 'home.t1Author' },
    { key: 't2', quote: 'home.t2', author: 'home.t2Author' },
    { key: 't3', quote: 'home.t3', author: 'home.t3Author' },
  ];

  /** Map a category slug to its inline-SVG icon. */
  protected iconForSlug(slug: string): IconName {
    switch (slug) {
      case 'tallow':
        return 'tallow';
      case 'olive-oil':
        return 'olive';
      case 'vegan':
        return 'leaf';
      case 'specials':
        return 'sparkle';
      default:
        return 'soap-bar';
    }
  }

  /** Sub-palette tint per category — keeps the four circles visually distinct. */
  protected categoryCircleClass(slug: string): string {
    switch (slug) {
      case 'tallow':
        return 'bg-clay/15 text-clay-dark';
      case 'olive-oil':
        return 'bg-sage/20 text-sage-dark';
      case 'vegan':
        return 'bg-sage/15 text-sage-dark';
      case 'specials':
        return 'bg-clay/20 text-clay-dark';
      default:
        return 'bg-sage/10 text-sage-dark';
    }
  }
}
