import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'rns-footer',
  standalone: true,
  imports: [RouterLink, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="mt-16 border-t border-sage/20 bg-ivory">
      <div class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-ink/80 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div class="max-w-sm">
          <p class="font-serif text-lg text-ink">{{ 'brand.name' | transloco }}</p>
          <p class="mt-2 text-ink/70">{{ 'brand.tagline' | transloco }}</p>
          <p class="mt-4 text-xs uppercase tracking-wide text-ink/50">
            {{ 'footer.craftedIn' | transloco }}
          </p>
        </div>

        <nav class="flex flex-wrap gap-6" aria-label="Footer">
          <a routerLink="/about" class="hover:text-sage">{{ 'nav.about' | transloco }}</a>
          <a routerLink="/contact" class="hover:text-sage">{{ 'nav.contact' | transloco }}</a>
          <a routerLink="/products" class="hover:text-sage">{{ 'nav.shop' | transloco }}</a>
          <a routerLink="/auth/login" class="hover:text-sage">{{ 'nav.login' | transloco }}</a>
        </nav>
      </div>
      <div class="border-t border-sage/10">
        <p class="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-ink/60 sm:px-6">
          {{ 'footer.copy' | transloco: { year: year } }}
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected year = new Date().getFullYear();
}
