import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AdminFacade } from '../../../abstraction/admin.facade';
import { CatalogFacade } from '../../../abstraction/catalog.facade';
import { TranslateFieldPipe } from '../../../shared/pipes/translate-field.pipe';
import { AlertComponent } from '../../../shared/ui/alert.component';
import { SpinnerComponent } from '../../../shared/ui/spinner.component';
import { RnsButtonDirective } from '../../../shared/ui/button.directive';
import { ProductWritePayload } from '../../../core/services/admin.api';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);

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

          <!-- Image picker. We deliberately don't bind this to the reactive
               form (Files don't round-trip cleanly through FormControls);
               instead we keep the picked File and the existing URL in
               separate signals and merge them at submit time. -->
          <fieldset class="space-y-3" aria-labelledby="lbl-image">
            <legend id="lbl-image" class="block text-sm text-ink/70">
              {{ 'admin.form.image' | transloco }}
            </legend>
            <p class="text-xs text-ink/50">{{ 'admin.form.imageHint' | transloco }}</p>

            <div class="flex flex-wrap items-start gap-4">
              <!-- Preview thumbnail -->
              <div
                class="flex h-28 w-28 items-center justify-center overflow-hidden rounded-soft border border-sage/20 bg-ivory"
                aria-hidden="true"
              >
                @if (previewUrl()) {
                  <img [src]="previewUrl()" alt="" class="h-full w-full object-cover" />
                } @else {
                  <span class="px-2 text-center text-[11px] text-ink/40">{{
                    'admin.form.imageNone' | transloco
                  }}</span>
                }
              </div>

              <div class="flex flex-col gap-2">
                <input
                  #fileInput
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  class="sr-only"
                  (change)="onFilePicked($event)"
                />
                <button
                  type="button"
                  rnsButton="secondary"
                  size="sm"
                  (click)="fileInput.click()"
                >
                  @if (hasImage()) {
                    {{ 'admin.form.imageReplace' | transloco }}
                  } @else {
                    {{ 'admin.form.imageChoose' | transloco }}
                  }
                </button>
                @if (pickedFileName(); as name) {
                  <span class="text-xs text-ink/60">{{ name }}</span>
                }
                @if (hasImage()) {
                  <button
                    type="button"
                    class="self-start text-xs text-clay-dark hover:underline"
                    (click)="removeImage()"
                  >
                    {{ 'admin.form.imageRemove' | transloco }}
                  </button>
                }
              </div>
            </div>

            @if (imageError(); as msg) {
              <rns-alert tone="error">{{ msg }}</rns-alert>
            }
          </fieldset>

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
export class AdminProductFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private admin = inject(AdminFacade);
  private transloco = inject(TranslocoService);
  protected catalog = inject(CatalogFacade);

  private _editingId = signal<number | null>(null);
  private _saving = signal(false);
  private _loadingExisting = signal(false);
  private _error = signal<string | null>(null);

  // Image state — kept outside the reactive form because File objects don't
  // round-trip cleanly through FormControls and we want a separate validation
  // surface anyway.
  private _pickedFile = signal<File | null>(null);
  private _pickedObjectUrl = signal<string | null>(null);
  private _existingImageUrl = signal<string>('');
  // null = "no change"; '' = "user clicked Remove image, clear server-side image".
  private _imageRemoveRequested = signal(false);
  private _imageError = signal<string | null>(null);

  editingId = this._editingId.asReadonly();
  saving = this._saving.asReadonly();
  loadingExisting = this._loadingExisting.asReadonly();
  errorMessage = computed(() => this._error());
  imageError = this._imageError.asReadonly();
  pickedFileName = computed(() => this._pickedFile()?.name ?? null);
  hasImage = computed(
    () =>
      !!this._pickedFile() ||
      (!!this._existingImageUrl() && !this._imageRemoveRequested()),
  );
  previewUrl = computed(() => {
    const objUrl = this._pickedObjectUrl();
    if (objUrl) return objUrl;
    if (this._imageRemoveRequested()) return '';
    return this._existingImageUrl();
  });

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
            is_featured: p.is_featured,
            is_active: p.is_active,
          });
          this._existingImageUrl.set(p.image_url ?? '');
          this._loadingExisting.set(false);
        },
        error: () => this._loadingExisting.set(false),
      });
    }
  }

  ngOnDestroy(): void {
    this.revokePickedObjectUrl();
  }

  protected onFilePicked(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;

    if (!ALLOWED_IMAGE_MIMES.has(file.type)) {
      this._imageError.set(this.transloco.translate('admin.form.imageInvalidType'));
      input.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      this._imageError.set(this.transloco.translate('admin.form.imageTooLarge'));
      input.value = '';
      return;
    }

    this._imageError.set(null);
    this.revokePickedObjectUrl();
    this._pickedFile.set(file);
    this._pickedObjectUrl.set(URL.createObjectURL(file));
    this._imageRemoveRequested.set(false);
    // Reset the input so picking the same filename again still fires `change`.
    input.value = '';
  }

  protected removeImage(): void {
    this.revokePickedObjectUrl();
    this._pickedFile.set(null);
    this._pickedObjectUrl.set(null);
    // If we're editing and the server has an image, mark it for removal.
    // (The current backend doesn't support clearing — we just stop sending
    // the file. This signal is here so the UI shows the no-image state
    // immediately; future server-side support can read the same signal.)
    if (this._existingImageUrl()) {
      this._imageRemoveRequested.set(true);
    }
    this._imageError.set(null);
  }

  private revokePickedObjectUrl(): void {
    const url = this._pickedObjectUrl();
    if (url) URL.revokeObjectURL(url);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload: ProductWritePayload = {
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
      is_featured: v.is_featured,
      is_active: v.is_active,
    };
    const file = this._pickedFile();
    if (file) {
      payload.image = file;
    }

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
        // DRF returns either {detail: '...'} or per-field arrays — surface
        // the first message we can find so the admin sees what went wrong.
        const errBody = e?.error;
        let msg: string | null = null;
        if (errBody?.detail) msg = errBody.detail;
        else if (errBody && typeof errBody === 'object') {
          const firstKey = Object.keys(errBody)[0];
          const firstVal = errBody[firstKey];
          if (Array.isArray(firstVal)) msg = `${firstKey}: ${firstVal[0]}`;
          else if (typeof firstVal === 'string') msg = firstVal;
        }
        this._error.set(msg ?? 'errors.generic');
      },
    });
  }
}
