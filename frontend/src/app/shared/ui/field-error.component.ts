import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

/**
 * Surfaces validation errors for a single form control inline, with an
 * `id` that the corresponding input should reference via `aria-describedby`.
 *
 * Usage:
 *   <input
 *     formControlName="email"
 *     [attr.aria-invalid]="email.invalid && email.touched ? true : null"
 *     [attr.aria-describedby]="email.invalid && email.touched ? 'email-err' : null"
 *   />
 *   <rns-field-error id="email-err" [control]="email"></rns-field-error>
 *
 * Maps the standard built-in validators (`required`, `email`, `minlength`,
 * `maxlength`, `min`, `max`) to keys in the `validation.*` namespace.
 */
@Component({
  selector: 'rns-field-error',
  standalone: true,
  imports: [TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <p
        [id]="id()"
        class="mt-1 text-xs text-clay-dark"
        role="alert"
      >
        {{ messageKey() | transloco: messageParams() }}
      </p>
    }
  `,
})
export class FieldErrorComponent {
  control = input.required<AbstractControl>();
  id = input.required<string>();

  // Angular form state (status, touched, dirty) lives on plain properties,
  // not signals — so `computed()` won't re-fire on its own. We bridge by
  // subscribing to the control's event stream and bumping a tick signal,
  // which all the derived `computed`s depend on.
  private tick = signal(0);

  constructor() {
    effect((onCleanup) => {
      const c = this.control();
      // AbstractControl.events emits on status, value, touched, and pristine changes.
      const sub = c.events.subscribe(() => this.tick.update((n) => n + 1));
      onCleanup(() => sub.unsubscribe());
    });
  }

  protected visible = computed(() => {
    this.tick();
    const c = this.control();
    return c.invalid && (c.touched || c.dirty);
  });

  protected messageKey = computed(() => {
    this.tick();
    const errs = this.control().errors;
    if (!errs) return '';
    if (errs['required']) return 'validation.required';
    if (errs['email']) return 'validation.emailInvalid';
    if (errs['minlength']) return 'validation.tooShort';
    if (errs['maxlength']) return 'validation.tooLong';
    if (errs['min']) return 'validation.min';
    if (errs['max']) return 'validation.max';
    return 'errors.generic';
  });

  protected messageParams = computed(() => {
    this.tick();
    const errs = this.control().errors;
    if (!errs) return {};
    if (errs['min']) return { min: errs['min'].min };
    if (errs['max']) return { max: errs['max'].max };
    return {};
  });
}
