import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * The brand's icon set. All icons render at the size given by the `size`
 * input (default 20 px) and inherit color from `currentColor`, so a parent's
 * `text-sage` etc. controls the stroke.
 *
 * Why a switch over external SVG files: the set is tiny, lives in one place,
 * and avoids the asset-loading flash on first paint. New icons go below.
 *
 * Usage:
 *   <rns-icon name="cart"></rns-icon>
 *   <rns-icon name="arrow-right" size="16"></rns-icon>
 *   <rns-icon name="tallow" size="28" class="text-sage"></rns-icon>
 */
export type IconName =
  | 'cart'
  | 'menu'
  | 'close'
  | 'arrow-right'
  | 'arrow-left'
  | 'soap-bar'
  | 'sprig'
  | 'tallow'
  | 'olive'
  | 'leaf'
  | 'sparkle'
  | 'check'
  | 'chevron-right';

@Component({
  selector: 'rns-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Hide from the a11y tree by default; callers that need a labelled icon
  // can add `aria-label` themselves and `aria-hidden` will be ignored.
  host: {
    'aria-hidden': 'true',
    '[style.display]': '"inline-flex"',
  },
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      [attr.viewBox]="viewBox()"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      @switch (name()) {
        @case ('cart') {
          <path d="M3 5h2l2.4 11.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.5L20.5 9H6.5" />
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="17" cy="20" r="1.5" />
        }
        @case ('menu') {
          <path d="M4 7h16M4 12h16M4 17h16" />
        }
        @case ('close') {
          <path d="M6 6l12 12M18 6L6 18" />
        }
        @case ('arrow-right') {
          <path d="M5 12h14M13 5l7 7-7 7" />
        }
        @case ('arrow-left') {
          <path d="M19 12H5M11 5l-7 7 7 7" />
        }
        @case ('soap-bar') {
          <rect x="4" y="9" width="16" height="9" rx="2" />
          <path d="M8 9c0-2 4-3 8-1" />
        }
        @case ('sprig') {
          <path d="M12 22V8" />
          <path d="M12 14c-3 0-5-2-5-5 3 0 5 2 5 5z" fill="currentColor" fill-opacity="0.18" />
          <path d="M12 11c2.5 0 4-2 4-4-2.5 0-4 1.5-4 4z" fill="currentColor" fill-opacity="0.18" />
        }
        @case ('tallow') {
          <!-- A drop on a small base, evoking richness/cream -->
          <path d="M12 4c-2 3-5 6-5 9a5 5 0 1 0 10 0c0-3-3-6-5-9z" />
          <path d="M7 19h10" />
        }
        @case ('olive') {
          <!-- Olive on a stem with two leaves -->
          <ellipse cx="14.5" cy="14.5" rx="3" ry="4" transform="rotate(35 14.5 14.5)" />
          <path d="M9 9c-1-2-3-3-5-3 0 2 1 4 3 5" fill="currentColor" fill-opacity="0.15" />
          <path d="M9 9c2 -1 4 -3 4 -5 -2 0 -4 1 -5 3" fill="currentColor" fill-opacity="0.15" />
          <path d="M5 6l7 7" />
        }
        @case ('leaf') {
          <path d="M5 19c8 0 14-6 14-14 0 0-7 0-11 4S5 19 5 19z" />
          <path d="M5 19l7-7" />
        }
        @case ('sparkle') {
          <path d="M12 4v6M12 14v6M4 12h6M14 12h6" />
          <path d="M7 7l3 3M14 14l3 3M17 7l-3 3M7 17l3-3" />
        }
        @case ('check') {
          <path d="M5 13l4 4 10-10" />
        }
        @case ('chevron-right') {
          <path d="M9 6l6 6-6 6" />
        }
      }
    </svg>
  `,
})
export class IconComponent {
  name = input.required<IconName>();
  size = input<number | string>(20);

  protected viewBox = computed(() => '0 0 24 24');
}
