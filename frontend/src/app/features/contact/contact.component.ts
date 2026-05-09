import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { ContactFacade } from '../../abstraction/contact.facade';
import { I18nFacade } from '../../abstraction/i18n.facade';
import { AlertComponent } from '../../shared/ui/alert.component';
import { RnsButtonDirective } from '../../shared/ui/button.directive';
import { FieldErrorComponent } from '../../shared/ui/field-error.component';

@Component({
  selector: 'rns-contact',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoPipe,
    AlertComponent,
    RnsButtonDirective,
    FieldErrorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 class="font-serif text-4xl text-ink">{{ 'contact.title' | transloco }}</h1>
      <p class="mt-3 text-ink/70">{{ 'contact.lead' | transloco }}</p>
      <p class="mt-1 text-sm text-ink/60">{{ 'contact.replyTime' | transloco }}</p>

      @if (contact.success()) {
        <div class="mt-6">
          <rns-alert tone="success">
            <div class="space-y-2">
              <p class="font-medium">{{ 'contact.successTitle' | transloco }}</p>
              <p>{{ 'contact.successBody' | transloco }}</p>
              <button
                type="button"
                (click)="contact.reset()"
                class="mt-2 rounded-full border border-ivory/40 bg-ivory/10 px-3 py-1 text-xs"
              >
                {{ 'contact.sendAnother' | transloco }}
              </button>
            </div>
          </rns-alert>
        </div>
      } @else {
        <form
          [formGroup]="form"
          (ngSubmit)="submit()"
          class="mt-8 space-y-4 rounded-soft bg-ivory p-6 shadow-soft"
          novalidate
        >
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="block text-sm text-ink/70">{{ 'contact.name' | transloco }}</span>
              <input
                type="text"
                formControlName="name"
                autocomplete="name"
                [attr.aria-invalid]="showError(form.controls.name) || null"
                [attr.aria-describedby]="showError(form.controls.name) ? 'err-name' : null"
                class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 aria-[invalid=true]:border-clay-dark"
              />
              <rns-field-error id="err-name" [control]="form.controls.name"></rns-field-error>
            </label>
            <label class="block">
              <span class="block text-sm text-ink/70">{{ 'contact.email' | transloco }}</span>
              <input
                type="email"
                formControlName="email"
                autocomplete="email"
                [attr.aria-invalid]="showError(form.controls.email) || null"
                [attr.aria-describedby]="showError(form.controls.email) ? 'err-c-email' : null"
                class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 aria-[invalid=true]:border-clay-dark"
              />
              <rns-field-error id="err-c-email" [control]="form.controls.email"></rns-field-error>
            </label>
          </div>
          <label class="block">
            <span class="block text-sm text-ink/70">{{ 'contact.subject' | transloco }}</span>
            <input
              type="text"
              formControlName="subject"
              class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
            />
          </label>
          <label class="block">
            <span class="block text-sm text-ink/70">{{ 'contact.message' | transloco }}</span>
            <textarea
              rows="6"
              formControlName="body"
              [attr.aria-invalid]="showError(form.controls.body) || null"
              [attr.aria-describedby]="showError(form.controls.body) ? 'err-body' : null"
              class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 aria-[invalid=true]:border-clay-dark"
            ></textarea>
            <rns-field-error id="err-body" [control]="form.controls.body"></rns-field-error>
          </label>

          @if (contact.error()) {
            <rns-alert tone="error">{{ errorText() }}</rns-alert>
          }

          <button
            type="submit"
            rnsButton
            size="md"
            [disabled]="contact.submitting() || form.invalid"
          >
            {{ 'contact.send' | transloco }}
          </button>
        </form>
      }
    </section>
  `,
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  protected contact = inject(ContactFacade);
  private i18n = inject(I18nFacade);
  private transloco = inject(TranslocoService);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: [''],
    body: ['', [Validators.required, Validators.minLength(5)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.contact.send({
      name: v.name,
      email: v.email,
      subject: v.subject,
      body: v.body,
      language: this.i18n.language(),
    });
  }

  errorText(): string {
    const err = this.contact.error();
    if (!err) return '';
    // If it looks like a translation key, translate; else show raw.
    if (err.includes('.')) return this.transloco.translate(err);
    return err;
  }

  protected showError(ctrl: { invalid: boolean; touched: boolean; dirty: boolean }): boolean {
    return ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }
}
