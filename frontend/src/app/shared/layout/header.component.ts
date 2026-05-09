import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthFacade } from '../../abstraction/auth.facade';
import { CartFacade } from '../../abstraction/cart.facade';
import { LanguageToggleComponent } from './language-toggle.component';
import { IconComponent } from '../ui/icon.component';
import { BrandMarkComponent } from '../ui/brand-mark.component';

@Component({
  selector: 'rns-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslocoPipe,
    LanguageToggleComponent,
    IconComponent,
    BrandMarkComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="sticky top-0 z-40 border-b border-sage/20 bg-cream/90 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <a routerLink="/" class="flex items-center gap-2 leading-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage">
          <rns-brand-mark [size]="34"></rns-brand-mark>
          <span class="flex flex-col">
            <span class="font-serif text-lg text-ink sm:text-xl">{{ 'brand.name' | transloco }}</span>
            <span class="hidden text-xs text-ink/60 sm:inline">{{ 'brand.tagline' | transloco }}</span>
          </span>
        </a>

        <nav
          class="ms-auto hidden items-center gap-6 text-sm md:flex"
          [attr.aria-label]="'nav.menu' | transloco"
        >
          <a
            routerLink="/products"
            routerLinkActive="text-sage"
            class="transition hover:text-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
            >{{ 'nav.shop' | transloco }}</a
          >
          <a
            routerLink="/about"
            routerLinkActive="text-sage"
            class="transition hover:text-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
            >{{ 'nav.about' | transloco }}</a
          >
          <a
            routerLink="/contact"
            routerLinkActive="text-sage"
            class="transition hover:text-sage focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sage"
            >{{ 'nav.contact' | transloco }}</a
          >
        </nav>

        <div class="ms-auto flex items-center gap-2 md:ms-4">
          <rns-language-toggle></rns-language-toggle>

          @if (auth.isLoggedIn()) {
            <a
              routerLink="/account"
              class="hidden min-h-11 items-center rounded-full border border-sage/40 bg-ivory/80 px-4 py-2.5 text-xs font-medium text-ink transition hover:border-sage hover:bg-ivory sm:inline-flex focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
              >{{ 'nav.account' | transloco }}</a
            >
          } @else {
            <a
              routerLink="/auth/login"
              class="hidden min-h-11 items-center rounded-full border border-sage/40 bg-ivory/80 px-4 py-2.5 text-xs font-medium text-ink transition hover:border-sage hover:bg-ivory sm:inline-flex focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
              >{{ 'nav.login' | transloco }}</a
            >
          }

          <a
            routerLink="/cart"
            class="relative inline-flex min-h-11 items-center gap-2 rounded-full bg-sage px-4 py-2.5 text-xs font-medium text-ivory transition hover:bg-sage-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            [attr.aria-label]="'nav.cart' | transloco"
          >
            <rns-icon name="cart" size="16"></rns-icon>
            <span>{{ 'nav.cart' | transloco }}</span>
            @if (cart.itemCount() > 0) {
              <span
                class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-clay px-1.5 text-[11px] font-bold text-ivory"
                [attr.aria-label]="cart.itemCount() + ' items'"
                >{{ cart.itemCount() }}</span
              >
            }
          </a>

          <button
            type="button"
            class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-sage/40 text-ink md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
            (click)="toggleMobile()"
            [attr.aria-expanded]="mobileOpen()"
            [attr.aria-label]="'nav.menu' | transloco"
          >
            <rns-icon [name]="mobileOpen() ? 'close' : 'menu'" size="22"></rns-icon>
          </button>
        </div>
      </div>

      @if (mobileOpen()) {
        <nav
          class="border-t border-sage/20 bg-cream md:hidden"
          [attr.aria-label]="'nav.menu' | transloco"
        >
          <ul class="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 text-sm">
            <li>
              <a
                routerLink="/products"
                (click)="closeMobile()"
                class="block rounded px-2 py-2 hover:bg-ivory"
                >{{ 'nav.shop' | transloco }}</a
              >
            </li>
            <li>
              <a
                routerLink="/about"
                (click)="closeMobile()"
                class="block rounded px-2 py-2 hover:bg-ivory"
                >{{ 'nav.about' | transloco }}</a
              >
            </li>
            <li>
              <a
                routerLink="/contact"
                (click)="closeMobile()"
                class="block rounded px-2 py-2 hover:bg-ivory"
                >{{ 'nav.contact' | transloco }}</a
              >
            </li>
            <li>
              @if (auth.isLoggedIn()) {
                <a
                  routerLink="/account"
                  (click)="closeMobile()"
                  class="block rounded px-2 py-2 hover:bg-ivory"
                  >{{ 'nav.account' | transloco }}</a
                >
              } @else {
                <a
                  routerLink="/auth/login"
                  (click)="closeMobile()"
                  class="block rounded px-2 py-2 hover:bg-ivory"
                  >{{ 'nav.login' | transloco }}</a
                >
              }
            </li>
          </ul>
        </nav>
      }
    </header>
  `,
})
export class HeaderComponent {
  protected auth = inject(AuthFacade);
  protected cart = inject(CartFacade);

  private _mobileOpen = signal(false);
  mobileOpen = this._mobileOpen.asReadonly();

  toggleMobile(): void {
    this._mobileOpen.update((v) => !v);
  }
  closeMobile(): void {
    this._mobileOpen.set(false);
  }
}
