import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

const STORAGE_KEY = 'rns_lang';

export type AppLang = 'en' | 'he';

@Injectable({ providedIn: 'root' })
export class I18nFacade {
  private transloco = inject(TranslocoService);

  private _lang = signal<AppLang>(this.readInitial());

  readonly language = this._lang.asReadonly();
  readonly isRtl = computed(() => this._lang() === 'he');
  readonly dir = computed(() => (this.isRtl() ? 'rtl' : 'ltr'));

  /** Called once from AppComponent; applies the language to document + Transloco. */
  init(): void {
    // Effect keeps <html lang> / <html dir> synced with the signal.
    effect(() => {
      const l = this._lang();
      document.documentElement.lang = l;
      document.documentElement.dir = this.dir();
      this.transloco.setActiveLang(l);
      try {
        localStorage.setItem(STORAGE_KEY, l);
      } catch {
        /* ignore (private mode) */
      }
    });
  }

  setLanguage(lang: AppLang): void {
    this._lang.set(lang);
  }

  toggle(): void {
    this.setLanguage(this._lang() === 'en' ? 'he' : 'en');
  }

  /** Lookup `${base}_${lang}` on an object with English fallback. */
  tr(obj: Record<string, unknown> | null | undefined, base: string): string {
    if (!obj) return '';
    const lang = this._lang();
    return (obj[`${base}_${lang}`] as string) ?? (obj[`${base}_en`] as string) ?? '';
  }

  private readInitial(): AppLang {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'he') return stored;
    } catch {
      /* ignore */
    }
    const browser = (navigator?.language || 'en').slice(0, 2);
    return browser === 'he' ? 'he' : 'en';
  }
}
