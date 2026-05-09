import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

import { AuthFacade } from '../../../abstraction/auth.facade';
import { AlertComponent } from '../../../shared/ui/alert.component';
import { BrandMarkComponent } from '../../../shared/ui/brand-mark.component';

@Component({
  selector: 'rns-admin-login',
  standalone: true,
  imports: [ReactiveFormsModule, TranslocoPipe, AlertComponent, BrandMarkComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-md px-4 py-16 text-center sm:px-6 sm:text-start">
      <rns-brand-mark [size]="56" class="mx-auto sm:mx-0"></rns-brand-mark>
      <h1 class="mt-4 font-serif text-3xl text-ink">{{ 'admin.loginTitle' | transloco }}</h1>
      <p class="mt-2 text-ink/70">{{ 'admin.loginSubtitle' | transloco }}</p>

      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        class="mt-6 space-y-4 rounded-soft bg-cream p-6 shadow-soft"
        novalidate
      >
        <label class="block">
          <span class="block text-sm text-ink/70">{{ 'admin.username' | transloco }}</span>
          <input
            type="text"
            formControlName="username"
            autocomplete="username"
            class="mt-1 w-full rounded-soft border border-sage/30 bg-ivory px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
          />
        </label>
        <label class="block">
          <span class="block text-sm text-ink/70">{{ 'admin.password' | transloco }}</span>
          <input
            type="password"
            formControlName="password"
            autocomplete="current-password"
            class="mt-1 w-full rounded-soft border border-sage/30 bg-ivory px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
          />
        </label>

        @if (auth.error()) {
          <rns-alert tone="error">{{ auth.error() }}</rns-alert>
        }

        <button
          type="submit"
          [disabled]="auth.loading() || form.invalid"
          class="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-5 py-3 text-sm font-medium text-ivory transition hover:bg-ink/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage disabled:bg-ink/30 disabled:text-ivory/60 disabled:cursor-not-allowed"
        >
          {{ 'admin.signIn' | transloco }}
        </button>
      </form>
    </section>
  `,
})
export class AdminLoginComponent {
  private fb = inject(FormBuilder);
  protected auth = inject(AuthFacade);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) return;
    const { username, password } = this.form.getRawValue();
    this.auth.adminLogin(username, password);
  }
}
