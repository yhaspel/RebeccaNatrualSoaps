import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

import { AdminFacade } from '../../../abstraction/admin.facade';
import { CatalogFacade } from '../../../abstraction/catalog.facade';
import { TranslateFieldPipe } from '../../../shared/pipes/translate-field.pipe';
import { AlertComponent } from '../../../shared/ui/alert.component';
import { SpinnerComponent } from '../../../shared/ui/spinner.component';
import { RnsButtonDirective } from '../../../shared/ui/button.directive';

@Component({
  selector: 'rns-admin-product-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslocoPipe,
    TranslateFieldPipe,
    AlertComponent,
    SpinnerComponent,
    RnsButtonDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 class="font-serif text-3xl text-ink">
        @if (editingId()) {
          {{ 'admin.form.editTitle' | transloco }}
        } @else {
          {{ 'admin.form.createTitle' | transloco }}
        }
      </h1>

      @if (loadingExisting()) {
        <rns-spinner></rns-spinner>
      } @else {
        <form
          [formGroup]="form"
          (ngSubmit)="submit()"
          class="mt-8 space-y-8 rounded-soft bg-cream p-6 shadow-soft"
          novalidate
        >
          <div class="grid gap-6 md:grid-cols-2">
            <!-- English. We compose each input's accessible name from the
                 legend id ("English") plus the visible field label ("Name"),
                 so screen readers announce "English Name" / "English Description"
                 even when navigating field-by-field rather than landing on the
                 fieldset first. -->
            <fieldset class="space-y-4" aria-labelledby="form-section-en">
              <legend id="form-section-en" class="font-serif text-lg text-ink" lang="en">
                {{ 'admin.form.sectionEnglish' | transloco }}
              </legend>
              <label class="block">
                <span id="lbl-name-en" class="block text-sm text-ink/70">{{
                  'admin.form.name' | transloco
                }}</span>
                <input
                  type="text"
                  id="name-en"
                  formControlName="name_en"
                  aria-labelledby="form-section-en lbl-name-en"
                  lang="en"
                  class="mt-1 w-full rounded-soft border border-sage/30 bg-ivory px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
                />
              </label>
              <label class="block">
                <span id="lbl-desc-en" class="block text-sm text-ink/70">{{
                  'admin.form.description' | transloco
                }}</span>
                <textarea
                  rows="4"
                  id="desc-en"
                  formControlName="description_en"
                  aria-labelledby="form-section-en lbl-desc-en"
                  lang="en"
                  class="mt-1 w-full rounded-soft border border-sage/30 bg-ivory px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
                ></textarea>
              </label>
              <label class="block">
                <span id="lbl-ing-en" class="block text-sm text-ink/70">{{
                  'admin.form.ingredients' | transloco
                }}</span>
                <textarea
                  rows="3"
                  id="ing-en"
                  formControlName="ingredients_en"
                  aria-labelledby="form-section-en lbl-ing-en"
                  lang="en"
                  class="mt-1 w-full rounded-soft border border-sage/30 bg-ivory px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
                ></textarea>
              </label>
            </fieldset>

            <!-- Hebrew -->
            <fieldset class="space-y-4" dir="rtl" lang="he" aria-labelledby="form-section-he">
              <legend id="form-section-he" class="font-serif text-lg text-ink">
                {{ 'admin.form.sectionHebrew' | transloco }}
              </legend>
              <label class="block">
                <span id="lbl-name-he" class="block text-sm text-ink/70">{{
                  'admin.form.name' | transloco
                }}</span>
                <input
                  type="text"
                  id="name-he"
                  formControlName="name_he"
                  aria-labelledby="form-section-he lbl-name-he"
                  lang="he"
                  class="mt-1 w-full rounded-soft border border-sage/30 bg-ivory px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
                />
              </label>
              <label class="block">
                <span id="lbl-desc-he" class="block text-sm text-ink/70">{{
                  'admin.form.description' | transloco
                }}</span>
                <textarea
                  rows="4"
                  id="desc-he"
                  formControlName="description_he"
                  aria-labelledby="form-section-he lbl-desc-he"
                  lang="he"
                  class="mt-1 w-full rounded-soft border border-sage/30 bg-ivory px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
                ></textarea>
              </label>
              <label class="block">
                <span id="lbl-ing-he" class="block text-sm text-ink/70">{{
                  'admin.form.ingredients' | transloco
                }}</span>
                <textarea
                  rows="3"
                  id="ing-he"
                  formControlName="ingredients_he"
                  aria-labelledby="form-section-he lbl-ing-he"
                  lang="he"
                  class="mt-1 w-full rounded-soft border border-sage/30 bg-ivory px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
                ></textarea>
              </label>
            </fieldset>
          </div>

          <div class="grid gap-4 md:grid-cols-4">
            <label class="block">
              <span class="block text-sm text-ink/70">{{ 'admin.form.sku' | transloco }}</span>
              <input
                type="text"
                formControlName="sku"
                class="mt-1 w-full rounded-soft border border-sage/30 bg-ivory px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
              />
            </label>
            <label class="block">
              <span class="block text-sm text-ink/70">{{ 'admin.form.category' | transloco }}</span>
              <select
                formControlName="category"
                class="mt-1 w-full rounded-soft border border-sage/30 bg-ivory px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
              >
                @for (cat of catalog.categories(); track cat.id) {
                  <option [value]="cat.id">{{ cat | trField: 'name' }}</option>
                }
              </select>
            </label>
            <label class="block">
              <span class="block text-sm text-ink/70">{{ 'admin.form.priceIls' | transloco }}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                formControlName="price_ils"
                class="mt-1 w-full rounded-soft border border-sage/30 bg-ivory px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
              />
            </label>
            <label class="block">
              <span class="block text-sm text-ink/70">{{ 'admin.form.stock' | transloco }}</span>
              <input
                type="number"
                min="0"
                formControlName="stock"
                class="mt-1 w-full rounded-soft border border-sage/30 bg-ivory px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
              />
            </label>
          </div>

          <label class="block">
            <span class="block text-sm text-ink/70">{{ 'admin.form.imageUrl' | transloco }}</span>
            <input
              type="url"
              formControlName="image_url"
              class="mt-1 w-full rounded-soft border border-sage/30 bg-ivory px-3 py-2 text-sm focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage/30"
            />
          </label>

          <div class="flex flex-wrap gap-6">
            <label class="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" formControlName="is_featured" class="h-4 w-4 accent-sage" />
              {{ 'admin.form.isFeatured' | transloco }}
            </label>
            <label class="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" formControlName="is_active" class="h-4 w-4 accent-sage" />
              {{ 'admin.form.isActive' | transloco }}
            </label>
          </div>

          @if (errorMessage()) {
            <rns-alert tone="error">{{ errorMessage() }}</rns-alert>
          }

          <div class="flex items-center justify-end gap-3">
            <a routerLink="/admin/products" rnsButton="secondary" size="md">{{
              'admin.form.cancel' | transloco
            }}</a>
            <button type="submit" rnsButton size="md" [disabled]="saving() || form.invalid">
              @if (saving()) {
                {{ 'admin.form.saving' | transloco }}
              } @else {
                {{ 'admin.form.save' | transloco }}
              }
            </button>
          </div>
        </form>
      }
    </section>
  `,
})
export class AdminProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private admin = inject(AdminFacade);
  protected catalog = inject(CatalogFacade);

  private _editingId = signal<number | null>(null);
  private _saving = signal(false);
  private _loadingExisting = signal(false);
  private _error = signal<string | null>(null);

  editingId = this._editingId.asReadonly();
  saving = this._saving.asReadonly();
  loadingExisting = this._loadingExisting.asReadonly();
  errorMessage = computed(() => this._error());

  form = this.fb.nonNullable.group({
    sku: ['', Validators.required],
    category: [0, Validators.required],
    name_en: ['', Validators.required],
    name_he: ['', Validators.required],
    description_en: [''],
    description_he: [''],
    ingredients_en: [''],
    ingredients_he: [''],
    price_ils: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    image_url: [''],
    is_featured: [false],
    is_active: [true],
  });

  ngOnInit(): void {
    this.catalog.loadCategories();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this._editingId.set(id);
      this._loadingExisting.set(true);
      this.admin.getProduct(id).subscribe({
        next: (p) => {
          this.form.patchValue({
            sku: p.sku,
            category: p.category,
            name_en: p.name_en,
            name_he: p.name_he,
            description_en: p.description_en,
            description_he: p.description_he,
            ingredients_en: p.ingredients_en,
            ingredients_he: p.ingredients_he,
            price_ils: p.price_cents / 100,
            stock: p.stock,
            image_url: p.image_url,
            is_featured: p.is_featured,
            is_active: p.is_active,
          });
          this._loadingExisting.set(false);
        },
        error: () => this._loadingExisting.set(false),
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload = {
      sku: v.sku,
      category: Number(v.category),
      name_en: v.name_en,
      name_he: v.name_he,
      description_en: v.description_en,
      description_he: v.description_he,
      ingredients_en: v.ingredients_en,
      ingredients_he: v.ingredients_he,
      price_cents: Math.round(Number(v.price_ils) * 100),
      stock: Number(v.stock),
      image_url: v.image_url,
      is_featured: v.is_featured,
      is_active: v.is_active,
    };
    this._saving.set(true);
    this._error.set(null);
    const obs = this._editingId()
      ? this.admin.updateProduct(this._editingId()!, payload)
      : this.admin.createProduct(payload);
    obs.subscribe({
      next: () => {
        this._saving.set(false);
        this.router.navigate(['/admin/products']);
      },
      error: (e) => {
        this._saving.set(false);
        this._error.set(e?.error?.detail ?? 'errors.generic');
      },
    });
  }
}
