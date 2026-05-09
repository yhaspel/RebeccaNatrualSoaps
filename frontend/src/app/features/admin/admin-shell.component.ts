import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthFacade } from '../../abstraction/auth.facade';
import { LanguageToggleComponent } from '../../shared/layout/language-toggle.component';

@Component({
  selector: 'rns-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoPipe, LanguageToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex min-h-screen flex-col bg-ivory text-ink">
      <header class="border-b border-sage/20 bg-cream">
        <div class="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <a routerLink="/admin/products" class="font-serif text-lg text-ink">{{
            'admin.brand' | transloco
          }}</a>

          @if (showNav()) {
            <nav
              class="ms-8 hidden gap-6 text-sm md:flex"
              [attr.aria-label]="'admin.nav.products' | transloco"
            >
              <a
                routerLink="/admin/products"
                routerLinkActive="text-sage"
                class="hover:text-sage"
                >{{ 'admin.nav.products' | transloco }}</a
              >
              <a routerLink="/admin/orders" routerLinkActive="text-sage" class="hover:text-sage">{{
                'admin.nav.orders' | transloco
              }}</a>
              <a
                routerLink="/admin/messages"
                routerLinkActive="text-sage"
                class="hover:text-sage"
                >{{ 'admin.nav.messages' | transloco }}</a
              >
            </nav>
          }

          <div class="ms-auto flex items-center gap-2">
            <rns-language-toggle></rns-language-toggle>
            <a
              routerLink="/"
              class="rounded-full border border-sage/40 bg-ivory/80 px-3 py-1.5 text-xs font-medium text-ink transition hover:border-sage hover:bg-ivory"
              >{{ 'admin.nav.publicSite' | transloco }}</a
            >
            @if (showNav()) {
              <button
                type="button"
                class="rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-ivory transition hover:bg-ink/90"
                (click)="signOut()"
              >
                {{ 'admin.nav.signOut' | transloco }}
              </button>
            }
          </div>
        </div>
      </header>
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class AdminShellComponent {
  protected auth = inject(AuthFacade);
  private router = inject(Router);
  protected showNav = computed(() => this.auth.isStoreAdmin());

  signOut(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
