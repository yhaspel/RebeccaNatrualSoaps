import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthFacade } from '../../../abstraction/auth.facade';
import { AlertComponent } from '../../../shared/ui/alert.component';
import { RnsButtonDirective } from '../../../shared/ui/button.directive';
import { FieldErrorComponent } from '../../../shared/ui/field-error.component';

function matchPasswords(group: AbstractControl): ValidationErrors | null {
  const a = group.get('password')?.value;
  const b = group.get('passwordConfirm')?.value;
  return a === b ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'rns-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe,
    AlertComponent,
    RnsButtonDirective,
    FieldErrorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 class="font-serif text-3xl text-ink">{{ 'auth.registerTitle' | transloco }}</h1>
      <p class="mt-2 text-ink/70">{{ 'auth.registerSubtitle' | transloco }}</p>

      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        class="mt-6 space-y-4 rounded-soft bg-ivory p-6 shadow-soft"
        novalidate
      >
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="block text-sm text-ink/70">{{ 'auth.firstName' | transloco }}</span>
            <input
              type="text"
              formControlName="first_name"
              autocomplete="given-name"
              class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
            />
          </label>
          <label class="block">
            <span class="block text-sm text-ink/70">{{ 'auth.lastName' | transloco }}</span>
            <input
              type="text"
              formControlName="last_name"
              autocomplete="family-name"
              class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
            />
          </label>
        </div>
        <label class="block">
          <span class="block text-sm text-ink/70">{{ 'auth.username' | transloco }}</span>
          <input
            type="text"
            formControlName="username"
            autocomplete="username"
            [attr.aria-invalid]="showError(form.controls.username) || null"
            [attr.aria-describedby]="showError(form.controls.username) ? 'err-r-username' : null"
            class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 aria-[invalid=true]:border-clay-dark"
          />
          <rns-field-error id="err-r-username" [control]="form.controls.username"></rns-field-error>
        </label>
        <label class="block">
          <span class="block text-sm text-ink/70">{{ 'auth.email' | transloco }}</span>
          <input
            type="email"
            formControlName="email"
            autocomplete="email"
            [attr.aria-invalid]="showError(form.controls.email) || null"
            [attr.aria-describedby]="showError(form.controls.email) ? 'err-r-email' : null"
            class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 aria-[invalid=true]:border-clay-dark"
          />
          <rns-field-error id="err-r-email" [control]="form.controls.email"></rns-field-error>
        </label>
        <label class="block">
          <span class="block text-sm text-ink/70">{{ 'auth.password' | transloco }}</span>
          <input
            type="password"
            formControlName="password"
            autocomplete="new-password"
            [attr.aria-invalid]="showError(form.controls.password) || null"
            [attr.aria-describedby]="showError(form.controls.password) ? 'err-r-password' : null"
            class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 aria-[invalid=true]:border-clay-dark"
          />
          <rns-field-error id="err-r-password" [control]="form.controls.password"></rns-field-error>
        </label>
        <label class="block">
          <span class="block text-sm text-ink/70">{{
            'auth.passwordConfirm' | transloco
          }}</span>
          <input
            type="password"
            formControlName="passwordConfirm"
            autocomplete="new-password"
            [attr.aria-invalid]="(showError(form.controls.passwordConfirm) || passwordMismatchVisible()) || null"
            [attr.aria-describedby]="passwordMismatchVisible() ? 'err-mismatch' : (showError(form.controls.passwordConfirm) ? 'err-r-confirm' : null)"
            class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 aria-[invalid=true]:border-clay-dark"
          />
          <rns-field-error id="err-r-confirm" [control]="form.controls.passwordConfirm"></rns-field-error>
          @if (passwordMismatchVisible()) {
            <p id="err-mismatch" class="mt-1 text-xs text-clay-dark" role="alert">
              {{ 'auth.passwordsMismatch' | transloco }}
            </p>
          }
        </label>

        @if (auth.error()) {
          <rns-alert tone="error">{{ auth.error() }}</rns-alert>
        }

        <button
          type="submit"
          rnsButton
          size="lg"
          class="w-full"
          [disabled]="auth.loading() || form.invalid"
        >
          {{ 'auth.signUp' | transloco }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-ink/70">
        {{ 'auth.haveAccount' | transloco }}
        <a routerLink="/auth/login" rnsButton="link" class="ms-1">{{
          'auth.goLogin' | transloco
        }}</a>
      </p>
    </section>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  protected auth = inject(AuthFacade);

  form = this.fb.nonNullable.group(
    {
      first_name: [''],
      last_name: [''],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', Validators.required],
    },
    { validators: matchPasswords },
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.auth.register({
      username: v.username,
      email: v.email,
      password: v.password,
      first_name: v.first_name,
      last_name: v.last_name,
    }).subscribe();
  }

  protected showError(ctrl: { invalid: boolean; touched: boolean; dirty: boolean }): boolean {
    return ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  protected passwordMismatchVisible(): boolean {
    const confirm = this.form.controls.passwordConfirm;
    // Show the mismatch only once both fields have content and were touched.
    return (
      !!this.form.errors?.['passwordsMismatch'] &&
      (confirm.touched || confirm.dirty) &&
      !!confirm.value
    );
  }
}
