import { Directive, computed, input } from '@angular/core';

/**
 * Brand-aligned button styling. Apply as an attribute on `<button>` or `<a>`
 * (including `routerLink`-bearing anchors). Encodes contrast, hover, focus,
 * and disabled states once so individual components don't have to.
 *
 * Usage:
 *   <button rnsButton>Add to cart</button>
 *   <button rnsButton="secondary" size="sm">Cancel</button>
 *   <a routerLink="/products" rnsButton size="lg">Browse soaps</a>
 *   <a routerLink="/about" rnsButton="link">Read the whole story</a>
 *
 * Variants:
 *   primary    — sage filled, ivory text. Default for main CTAs.
 *   secondary  — ivory filled, sage border, ink text. Pairs with primary.
 *   ghost      — transparent, sage text, gentle hover wash.
 *   destructive— deep clay, ivory text. Reserved for delete/cancel-irreversible.
 *   link       — text-only, underline on hover. No pill shape.
 *
 * Sizes:
 *   sm — 36 px tall, for dense rows (table actions, footnote CTAs).
 *   md — 44 px tall (default). Meets touch-target guidance.
 *   lg — 48 px tall, for hero CTAs.
 */
@Directive({
  selector: '[rnsButton]',
  standalone: true,
  host: {
    '[class]': 'classes()',
  },
})
export class RnsButtonDirective {
  rnsButton = input<RnsButtonVariant | ''>('');
  size = input<RnsButtonSize>('md');

  protected classes = computed(() => {
    const variant = this.rnsButton() || 'primary';
    return [...BASE, ...SIZE[this.size()], ...VARIANT[variant]].join(' ');
  });
}

export type RnsButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'destructive'
  | 'link';
export type RnsButtonSize = 'sm' | 'md' | 'lg';

const BASE = [
  'inline-flex',
  'items-center',
  'justify-center',
  'font-medium',
  'transition',
  'focus-visible:outline',
  'focus-visible:outline-2',
  'focus-visible:outline-offset-2',
  'disabled:cursor-not-allowed',
];

const SIZE: Record<RnsButtonSize, string[]> = {
  sm: ['min-h-9', 'rounded-full', 'px-3', 'py-1.5', 'text-xs', 'gap-1.5'],
  md: ['min-h-11', 'rounded-full', 'px-4', 'py-2.5', 'text-sm', 'gap-2'],
  lg: ['min-h-12', 'rounded-full', 'px-6', 'py-3', 'text-sm', 'gap-2'],
};

const VARIANT: Record<RnsButtonVariant, string[]> = {
  primary: [
    'bg-sage',
    'text-ivory',
    'hover:bg-sage-dark',
    'active:bg-sage-dark',
    'focus-visible:outline-ink',
    'disabled:bg-sage/30',
    'disabled:text-ink/40',
    'disabled:hover:bg-sage/30',
  ],
  secondary: [
    'border',
    'border-sage/40',
    'bg-ivory',
    'text-ink',
    'hover:border-sage',
    'hover:bg-cream',
    'focus-visible:outline-sage',
    'disabled:opacity-50',
  ],
  ghost: [
    'bg-transparent',
    'text-sage',
    'hover:bg-sage/10',
    'focus-visible:outline-sage',
    'disabled:opacity-50',
  ],
  destructive: [
    'bg-clay',
    'text-ivory',
    'hover:bg-clay-dark',
    'active:bg-clay-dark',
    'focus-visible:outline-ink',
    'disabled:opacity-50',
  ],
  link: [
    // Override pill chrome — link variant is purely text.
    '!min-h-0',
    '!rounded-none',
    '!px-0',
    '!py-0',
    'bg-transparent',
    'text-sage',
    'hover:underline',
    'focus-visible:outline-sage',
    'focus-visible:outline-offset-4',
    'disabled:opacity-50',
  ],
};
