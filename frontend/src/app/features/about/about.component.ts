import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { RnsButtonDirective } from '../../shared/ui/button.directive';

@Component({
  selector: 'rns-about',
  standalone: true,
  imports: [RouterLink, TranslocoPipe, RnsButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-ivory">
      <div class="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 class="font-serif text-4xl text-ink sm:text-5xl">{{ 'about.title' | transloco }}</h1>

        <div class="prose mt-8 max-w-none text-ink/80">
          <p class="leading-relaxed">{{ 'about.intro' | transloco }}</p>

          <div
            class="my-10 aspect-[16/9] overflow-hidden rounded-soft bg-cream"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 640 360"
              class="h-full w-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <!-- Counter line -->
              <line
                x1="60"
                y1="280"
                x2="580"
                y2="280"
                stroke="#E4DDD0"
                stroke-width="2"
                stroke-linecap="round"
              />
              <!-- Pot -->
              <g fill="none" stroke="#6B7D5C" stroke-width="2.5" stroke-linecap="round">
                <!-- Pot body -->
                <path
                  d="M250 280 L 240 200 Q 240 190, 250 190 L 390 190 Q 400 190, 400 200 L 390 280 Z"
                  fill="#FBF7F1"
                />
                <!-- Pot rim -->
                <line x1="232" y1="190" x2="408" y2="190" stroke-width="3" />
                <!-- Handles -->
                <path d="M240 210 q -15 0, -15 18 q 0 12, 15 12" />
                <path d="M400 210 q 15 0, 15 18 q 0 12, -15 12" />
              </g>
              <!-- Steam wisps -->
              <g fill="none" stroke="#B6C2A5" stroke-width="2" stroke-linecap="round" opacity="0.85">
                <path d="M280 175 q 8 -20, 0 -40 q -8 -18, 4 -38" />
                <path d="M320 170 q 6 -22, -2 -44 q -10 -22, 4 -44" />
                <path d="M360 175 q 8 -20, 0 -40 q -8 -18, 4 -38" />
              </g>
              <!-- Sprig of greenery beside pot -->
              <g stroke="#6B7D5C" stroke-width="1.5" stroke-linecap="round" fill="#B6C2A5">
                <path
                  d="M460 280 C 470 250, 478 230, 480 200"
                  fill="none"
                />
                <path d="M477 232 q 14 -4, 20 5 q -14 6, -20 -5 z" />
                <path d="M482 210 q 14 -4, 18 6 q -14 5, -18 -6 z" />
                <path d="M467 252 q -14 -3, -18 7 q 14 5, 18 -7 z" />
              </g>
            </svg>
          </div>

          <h2 class="font-serif text-2xl text-ink">&nbsp;</h2>
          <p class="leading-relaxed">{{ 'about.ingredients' | transloco }}</p>
          <p class="leading-relaxed mt-4">{{ 'about.process' | transloco }}</p>
          <p class="leading-relaxed mt-4">{{ 'about.values' | transloco }}</p>

          <p class="leading-relaxed mt-10 italic text-ink/70">
            {{ 'about.closing' | transloco }}
          </p>
        </div>

        <div class="mt-10 flex flex-wrap gap-3">
          <a routerLink="/products" rnsButton size="md">
            {{ 'home.heroCta' | transloco }}
          </a>
          <a routerLink="/contact" rnsButton="secondary" size="md">
            {{ 'nav.contact' | transloco }}
          </a>
        </div>
      </div>
    </section>
  `,
})
export class AboutComponent {}
