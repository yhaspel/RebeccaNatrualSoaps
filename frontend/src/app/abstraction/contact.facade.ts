import { Injectable, inject, signal } from '@angular/core';

import { ContactApi, ContactPayload } from '../core/services/contact.api';

@Injectable({ providedIn: 'root' })
export class ContactFacade {
  private api = inject(ContactApi);

  private _submitting = signal(false);
  private _error = signal<string | null>(null);
  private _success = signal(false);

  readonly submitting = this._submitting.asReadonly();
  readonly error = this._error.asReadonly();
  readonly success = this._success.asReadonly();

  send(payload: ContactPayload): void {
    this._submitting.set(true);
    this._error.set(null);
    this.api.send(payload).subscribe({
      next: () => {
        this._submitting.set(false);
        this._success.set(true);
      },
      error: (e) => {
        this._submitting.set(false);
        if (e?.status === 429) this._error.set('contact.rateLimited');
        else this._error.set(e?.error?.detail ?? 'errors.generic');
      },
    });
  }

  reset(): void {
    this._error.set(null);
    this._success.set(false);
  }
}
