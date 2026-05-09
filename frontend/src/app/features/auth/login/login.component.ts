import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthFacade } from '../../../abstraction/auth.facade';
import { AlertComponent } from '../../../shared/ui/alert.component';
import { RnsButtonDirective } from '../../../shared/ui/button.directive';
import { FieldErrorComponent } from '../../../shared/ui/field-error.component';

@Component({
  selector: 'rns-login',
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
      <h1 class="font-serif text-3xl text-ink">{{ 'auth.loginTitle' | transloco }}</h1>
      <p class="mt-2 text-ink/70">{{ 'auth.loginSubtitle' | transloco }}</p>

      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        class="mt-6 space-y-4 rounded-soft bg-ivory p-6 shadow-soft"
        novalidate
      >
        <label class="block">
          <span class="block text-sm text-ink/70">{{ 'auth.username' | transloco }}</span>
          <input
            type="text"
            formControlName="username"
            autocomplete="username"
            [attr.aria-invalid]="showError(form.controls.username) || null"
            [attr.aria-describedby]="showError(form.controls.username) ? 'err-username' : null"
            class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 aria-[invalid=true]:border-clay-dark"
          />
          <rns-field-error id="err-username" [control]="form.controls.username"></rns-field-error>
        </label>
        <label class="block">
          <span class="block text-sm text-ink/70">{{ 'auth.password' | transloco }}</span>
          <input
            type="password"
            formControlName="password"
            autocomplete="current-password"
            [attr.aria-invalid]="showError(form.controls.password) || null"
            [attr.aria-describedby]="showError(form.controls.password) ? 'err-password' : null"
            class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 aria-[invalid=true]:border-clay-dark"
          />
          <rns-field-error id="err-password" [control]="form.controls.password"></rns-field-error>
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
          {{ 'auth.signIn' | transloco }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-ink/70">
        {{ 'auth.needAccount' | transloco }}
        <a routerLink="/auth/register" rnsButton="link" class="ms-1">{{
          'auth.goRegister' | transloco
        }}</a>
      </p>
    </section>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  protected auth = inject(AuthFacade);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const next = this.route.snapshot.queryParamMap.get('next');
    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password, next);
  }

  protected showError(ctrl: { invalid: boolean; touched: boolean; dirty: boolean }): boolean {
    return ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }
}
