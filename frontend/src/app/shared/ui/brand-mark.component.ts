import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The tiny brand mark used in the header and admin shell — a soap bar with
 * a sage sprig curling above. Designed to read at 32 px and still render as
 * "soap, hand-made" rather than a generic dot. Inherits no color (uses fixed
 * brand hues) so it stays recognisable on cream and ivory backgrounds.
 */
@Component({
  selector: 'rns-brand-mark',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[style.display]': '"inline-flex"',
  },
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 40 40"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <!-- Soft sage halo -->
      <circle cx="20" cy="20" r="18" fill="#6F8063" fill-opacity="0.10" />

      <!-- Sprig that arcs above the bar -->
      <g stroke="#6F8063" stroke-width="1.4" fill="none">
        <path d="M20 22 C 20 16, 23 13, 27 11" />
        <path d="M20 22 C 20 18, 18 16, 14 14" />
      </g>
      <g fill="#B6C2A5" stroke="#566248" stroke-width="0.8">
        <path d="M24 14 q 4 -1, 5 2 q -4 2, -5 -2 z" />
        <path d="M16 17 q -4 -1, -5 2 q 4 2, 5 -2 z" />
      </g>

      <!-- Soap bar -->
      <rect
        x="11"
        y="22"
        width="18"
        height="9"
        rx="2"
        fill="#FBF7F1"
        stroke="#566248"
        stroke-width="1.3"
      />

      <!-- Subtle stamp -->
      <path d="M18 27 q 2 -1.6, 4 0" stroke="#6F8063" stroke-width="0.9" fill="none" />
    </svg>
  `,
})
export class BrandMarkComponent {
  size = input<number | string>(32);
}
