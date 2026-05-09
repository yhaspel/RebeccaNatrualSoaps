import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { AuthApi } from '../core/services/auth.api';
import { TokenStorage } from '../core/services/token-storage';
import { LoginResponse, User } from '../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private api = inject(AuthApi);
  private tokens = inject(TokenStorage);
  private router = inject(Router);

  private _user = signal<User | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _hydrated = signal(false);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly hydrated = this._hydrated.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isStoreAdmin = computed(() => !!this._user()?.is_store_admin);
  readonly displayName = computed(
    () => this._user()?.first_name || this._user()?.username || '',
  );

  /** On bootstrap: if we have a token, try to load /me. */
  hydrate(): void {
    const { access } = this.tokens.read();
    if (!access) {
      this._hydrated.set(true);
      return;
    }
    this.api.me().subscribe({
      next: (u) => {
        this._user.set(u);
        this._hydrated.set(true);
      },
      error: () => {
        this.tokens.clear();
        this._user.set(null);
        this._hydrated.set(true);
      },
    });
  }

  private handleLoginSuccess = (res: LoginResponse) => {
    this.tokens.write(res.access, res.refresh);
    this._user.set(res.user);
    this._loading.set(false);
    this._error.set(null);
  };

  login(username: string, password: string, next: string | null = null): void {
    this._loading.set(true);
    this._error.set(null);
    this.api.login(username, password).subscribe({
      next: (res) => {
        this.handleLoginSuccess(res);
        this.router.navigateByUrl(next || '/account');
      },
      error: (e) => {
        this._loading.set(false);
        this._error.set(this.readError(e, 'errors.invalidCredentials'));
      },
    });
  }

  adminLogin(username: string, password: string): void {
    this._loading.set(true);
    this._error.set(null);
    this.api.adminLogin(username, password).subscribe({
      next: (res) => {
        this.handleLoginSuccess(res);
        this.router.navigate(['/admin/products']);
      },
      error: (e) => {
        this._loading.set(false);
        this._error.set(this.readError(e, 'errors.adminLoginFailed'));
      },
    });
  }

  register(payload: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }): Observable<User> {
    this._loading.set(true);
    this._error.set(null);
    return this.api.register(payload).pipe(
      tap({
        next: () => {
          this.login(payload.username, payload.password);
        },
        error: (e) => {
          this._loading.set(false);
          this._error.set(this.readError(e, 'errors.registerFailed'));
        },
      }),
    );
  }

  logout(): void {
    const { refresh } = this.tokens.read();
    const clear = () => {
      this.tokens.clear();
      this._user.set(null);
      this.router.navigate(['/']);
    };
    if (refresh) {
      this.api.logout(refresh).subscribe({ next: clear, error: clear });
    } else {
      clear();
    }
  }

  private readError(e: any, fallbackKey: string): string {
    if (e?.error?.detail) return e.error.detail;
    if (e?.error && typeof e.error === 'object') {
      const firstKey = Object.keys(e.error)[0];
      const firstVal = e.error[firstKey];
      if (Array.isArray(firstVal)) return `${firstKey}: ${firstVal[0]}`;
      if (typeof firstVal === 'string') return firstVal;
    }
    return fallbackKey;
  }
}
