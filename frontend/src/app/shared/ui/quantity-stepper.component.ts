import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

/**
 * Custom quantity input — a `−` and `+` pair flanking a read-only value.
 * Replaces native `<input type="number">` so the spinner controls don't
 * render differently across Chrome/Firefox/Safari.
 *
 * Why a button group instead of `appearance: none` on the native input:
 * native step buttons are tiny and not touch-friendly. The button pair gets
 * 44 px touch targets, proper aria labels, and works with screen readers.
 *
 * Usage:
 *   <rns-quantity-stepper
 *     [value]="qty()"
 *     [min]="1"
 *     [max]="10"
 *     (valueChange)="setQty($event)"
 *   ></rns-quantity-stepper>
 */
@Component({
  selector: 'rns-quantity-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="inline-flex items-center rounded-full border border-sage/30 bg-cream"
      role="group"
      [attr.aria-label]="ariaLabel()"
    >
      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-sage/10 disabled:cursor-not-allowed disabled:text-ink/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
        [disabled]="value() <= min()"
        (click)="step(-1)"
        [attr.aria-label]="decrementLabel()"
      >
        <span aria-hidden="true">−</span>
      </button>
      <span
        class="min-w-[2.5rem] text-center text-sm font-medium tabular-nums text-ink"
        aria-live="polite"
        [attr.aria-label]="valueLabel()"
      >{{ value() }}</span>
      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-sage/10 disabled:cursor-not-allowed disabled:text-ink/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
        [disabled]="value() >= max()"
        (click)="step(1)"
        [attr.aria-label]="incrementLabel()"
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  `,
})
export class QuantityStepperComponent {
  value = input<number>(1);
  min = input<number>(1);
  max = input<number>(99);

  valueChange = output<number>();

  private transloco = inject(TranslocoService);

  // Mirror translations into signals so the bindings refresh when the
  // language toggles. selectTranslate emits whenever the translation changes.
  private quantityLabelSignal = signal('Quantity');
  private incrementLabelSignal = signal('Increase');
  private decrementLabelSignal = signal('Decrease');

  constructor() {
    effect((onCleanup) => {
      const subs = [
        this.transloco
          .selectTranslate<string>('common.quantity')
          .subscribe((v) => this.quantityLabelSignal.set(v)),
        this.transloco
          .selectTranslate<string>('common.increase')
          .subscribe((v) => this.incrementLabelSignal.set(v)),
        this.transloco
          .selectTranslate<string>('common.decrease')
          .subscribe((v) => this.decrementLabelSignal.set(v)),
      ];
      onCleanup(() => subs.forEach((s) => s.unsubscribe()));
    });
  }

  protected ariaLabel = computed(() => this.quantityLabelSignal());
  protected valueLabel = computed(
    () => `${this.quantityLabelSignal()}: ${this.value()}`,
  );
  protected incrementLabel = this.incrementLabelSignal.asReadonly();
  protected decrementLabel = this.decrementLabelSignal.asReadonly();

  protected step(delta: number): void {
    const next = Math.max(this.min(), Math.min(this.max(), this.value() + delta));
    if (next !== this.value()) this.valueChange.emit(next);
  }
}
