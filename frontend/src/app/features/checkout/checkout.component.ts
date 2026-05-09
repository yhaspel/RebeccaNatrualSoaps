import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { CartFacade } from '../../abstraction/cart.facade';
import { I18nFacade } from '../../abstraction/i18n.facade';
import { OrdersFacade } from '../../abstraction/orders.facade';
import { AuthFacade } from '../../abstraction/auth.facade';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { TranslateFieldPipe } from '../../shared/pipes/translate-field.pipe';
import { AlertComponent } from '../../shared/ui/alert.component';
import { RnsButtonDirective } from '../../shared/ui/button.directive';
import { FieldErrorComponent } from '../../shared/ui/field-error.component';

@Component({
  selector: 'rns-checkout',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe,
    MoneyPipe,
    TranslateFieldPipe,
    AlertComponent,
    RnsButtonDirective,
    FieldErrorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 class="font-serif text-3xl text-ink sm:text-4xl">{{ 'checkout.title' | transloco }}</h1>

      @if (cart.items().length === 0) {
        <div class="mt-6">
          <rns-alert tone="info">
            {{ 'cart.empty' | transloco }}
            <a routerLink="/products" class="ms-2 underline">{{
              'cart.continueShopping' | transloco
            }}</a>
          </rns-alert>
        </div>
      } @else {
        <form
          [formGroup]="form"
          (ngSubmit)="submit()"
          class="mt-8 grid gap-10 md:grid-cols-[1fr,22rem]"
          novalidate
        >
          <div class="space-y-8">
            <!-- Contact -->
            <fieldset class="rounded-soft bg-ivory p-6 shadow-soft">
              <legend class="px-1 font-serif text-lg text-ink">
                {{ 'checkout.contactSection' | transloco }}
              </legend>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <label class="block">
                  <span class="block text-sm text-ink/70">{{
                    'checkout.email' | transloco
                  }}</span>
                  <input
                    type="email"
                    formControlName="email"
                    autocomplete="email"
                    [attr.aria-invalid]="showError(form.controls.email) || null"
                    [attr.aria-describedby]="showError(form.controls.email) ? 'err-email' : null"
                    class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 aria-[invalid=true]:border-clay-dark"
                  />
                  <rns-field-error id="err-email" [control]="form.controls.email"></rns-field-error>
                </label>
                <label class="block">
                  <span class="block text-sm text-ink/70">{{
                    'checkout.fullName' | transloco
                  }}</span>
                  <input
                    type="text"
                    formControlName="full_name"
                    autocomplete="name"
                    [attr.aria-invalid]="showError(form.controls.full_name) || null"
                    [attr.aria-describedby]="showError(form.controls.full_name) ? 'err-full_name' : null"
                    class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 aria-[invalid=true]:border-clay-dark"
                  />
                  <rns-field-error id="err-full_name" [control]="form.controls.full_name"></rns-field-error>
                </label>
                <label class="block sm:col-span-2">
                  <span class="block text-sm text-ink/70">{{
                    'checkout.phone' | transloco
                  }}</span>
                  <input
                    type="tel"
                    formControlName="phone"
                    autocomplete="tel"
                    class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
                  />
                </label>
              </div>
            </fieldset>

            <!-- Shipping -->
            <fieldset class="rounded-soft bg-ivory p-6 shadow-soft">
              <legend class="px-1 font-serif text-lg text-ink">
                {{ 'checkout.shippingSection' | transloco }}
              </legend>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <label class="block sm:col-span-2">
                  <span class="block text-sm text-ink/70">{{
                    'checkout.line1' | transloco
                  }}</span>
                  <input
                    type="text"
                    formControlName="shipping_line1"
                    autocomplete="address-line1"
                    [attr.aria-invalid]="showError(form.controls.shipping_line1) || null"
                    [attr.aria-describedby]="showError(form.controls.shipping_line1) ? 'err-line1' : null"
                    class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 aria-[invalid=true]:border-clay-dark"
                  />
                  <rns-field-error id="err-line1" [control]="form.controls.shipping_line1"></rns-field-error>
                </label>
                <label class="block sm:col-span-2">
                  <span class="block text-sm text-ink/70">{{
                    'checkout.line2' | transloco
                  }}</span>
                  <input
                    type="text"
                    formControlName="shipping_line2"
                    autocomplete="address-line2"
                    class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
                  />
                </label>
                <label class="block">
                  <span class="block text-sm text-ink/70">{{
                    'checkout.city' | transloco
                  }}</span>
                  <input
                    type="text"
                    formControlName="shipping_city"
                    autocomplete="address-level2"
                    [attr.aria-invalid]="showError(form.controls.shipping_city) || null"
                    [attr.aria-describedby]="showError(form.controls.shipping_city) ? 'err-city' : null"
                    class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 aria-[invalid=true]:border-clay-dark"
                  />
                  <rns-field-error id="err-city" [control]="form.controls.shipping_city"></rns-field-error>
                </label>
                <label class="block">
                  <span class="block text-sm text-ink/70">{{
                    'checkout.postalCode' | transloco
                  }}</span>
                  <input
                    type="text"
                    formControlName="shipping_postal_code"
                    autocomplete="postal-code"
                    [attr.aria-invalid]="showError(form.controls.shipping_postal_code) || null"
                    [attr.aria-describedby]="showError(form.controls.shipping_postal_code) ? 'err-postal' : null"
                    class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30 aria-[invalid=true]:border-clay-dark"
                  />
                  <rns-field-error id="err-postal" [control]="form.controls.shipping_postal_code"></rns-field-error>
                </label>
                <label class="block sm:col-span-2">
                  <span class="block text-sm text-ink/70">{{
                    'checkout.country' | transloco
                  }}</span>
                  <input
                    type="text"
                    formControlName="shipping_country"
                    autocomplete="country-name"
                    class="mt-1 w-full rounded-soft border border-sage/30 bg-cream px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
                  />
                </label>
              </div>
            </fieldset>

            <!-- Payment -->
            <fieldset class="rounded-soft bg-ivory p-6 shadow-soft">
              <legend class="px-1 font-serif text-lg text-ink">
                {{ 'checkout.paymentSection' | transloco }}
              </legend>
              <p class="mt-2 text-sm text-ink/70">{{ 'checkout.paymentRedirectNotice' | transloco }}</p>
            </fieldset>

            @if (errorMessage()) {
              <rns-alert tone="error">{{ errorMessage() }}</rns-alert>
            }
          </div>

          <!-- Summary -->
          <aside class="h-fit rounded-soft bg-ivory p-6 shadow-soft">
            <h2 class="font-serif text-lg text-ink">{{ 'checkout.summary' | transloco }}</h2>
            <ul class="mt-4 space-y-3 text-sm">
              @for (line of cart.items(); track line.product.id) {
                <li class="flex justify-between gap-3">
                  <span class="text-ink/80">
                    {{ line.product | trField: 'name' }}
                    <span class="text-ink/50" dir="ltr">&times;{{ line.quantity }}</span>
                  </span>
                  <span class="text-ink">{{ line.lineTotalCents | money: line.product.currency }}</span>
                </li>
              }
            </ul>
            <dl class="mt-4 space-y-2 border-t border-sage/10 pt-4 text-sm">
              <div class="flex justify-between">
                <dt>{{ 'cart.subtotal' | transloco }}</dt>
                <dd>{{ cart.subtotalCents() | money: cart.currency() }}</dd>
              </div>
              <div class="flex justify-between">
                <dt>{{ 'cart.shipping' | transloco }}</dt>
                <dd>
                  @if (cart.shippingCents() === 0) {
                    {{ 'cart.freeShipping' | transloco }}
                  } @else {
                    {{ cart.shippingCents() | money: cart.currency() }}
                  }
                </dd>
              </div>
              <div class="flex justify-between border-t border-sage/10 pt-2 text-base font-medium">
                <dt>{{ 'cart.total' | transloco }}</dt>
                <dd>{{ cart.totalCents() | money: cart.currency() }}</dd>
              </div>
            </dl>

            <button
              type="submit"
              rnsButton
              size="lg"
              class="mt-6 w-full"
              [disabled]="orders.submitting() || form.invalid"
            >
              @if (orders.submitting()) {
                {{ 'checkout.processing' | transloco }}
              } @else {
                {{ 'checkout.placeOrder' | transloco }}
              }
            </button>
          </aside>
        </form>
      }
    </section>
  `,
})
export class CheckoutComponent implements OnInit {
  protected cart = inject(CartFacade);
  protected orders = inject(OrdersFacade);
  protected auth = inject(AuthFacade);
  protected i18n = inject(I18nFacade);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private transloco = inject(TranslocoService);

  protected errorMessage = computed(() => this.orders.error());

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    full_name: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
    shipping_line1: ['', Validators.required],
    shipping_line2: [''],
    shipping_city: ['', Validators.required],
    shipping_postal_code: ['', Validators.required],
    shipping_country: [''],
  });

  constructor() {
    // Keep the country default in sync with the active language. selectTranslate
    // waits for the language file to actually load (instead of returning the
    // raw key), and re-emits when the user toggles language. Don't overwrite
    // once the user has typed in the field.
    effect((onCleanup) => {
      const lang = this.i18n.language();
      const ctrl = this.form.controls.shipping_country;
      const sub = this.transloco
        .selectTranslate('checkout.countryDefault', {}, lang)
        .subscribe((value: string) => {
          if (ctrl.pristine && value && value !== 'checkout.countryDefault') {
            ctrl.setValue(value);
          }
        });
      onCleanup(() => sub.unsubscribe());
    });
  }

  ngOnInit(): void {
    const user = this.auth.user();
    if (user) {
      this.form.patchValue({
        email: user.email || '',
        full_name: [user.first_name, user.last_name].filter(Boolean).join(' ') || '',
      });
    }
  }

  /** True when the field has an error worth showing to the user. */
  protected showError(ctrl: { invalid: boolean; touched: boolean; dirty: boolean }): boolean {
    return ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  submit(): void {
    if (this.form.invalid || this.cart.items().length === 0) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const items = this.cart.items().map((l) => ({
      product_id: l.product.id,
      quantity: l.quantity,
    }));
    this.orders
      .createCheckout({
        email: v.email,
        full_name: v.full_name,
        phone: v.phone || undefined,
        shipping_line1: v.shipping_line1,
        shipping_line2: v.shipping_line2 || undefined,
        shipping_city: v.shipping_city,
        shipping_postal_code: v.shipping_postal_code,
        shipping_country: v.shipping_country,
        language: this.i18n.language(),
        items,
      })
      .subscribe({
        next: (res) => {
          if (res.is_mock) {
            // Mock mode — skip payment page and confirm directly
            this.orders.confirm(res.order_id).subscribe({
              next: (order) => {
                this.cart.clear();
                this.router.navigate(['/checkout/success'], {
                  queryParams: { id: order.id },
                });
              },
            });
          } else {
            // Live mode — redirect to Grow hosted payment page
            this.cart.clear();
            window.location.href = res.payment_page_link;
          }
        },
      });
  }
}
