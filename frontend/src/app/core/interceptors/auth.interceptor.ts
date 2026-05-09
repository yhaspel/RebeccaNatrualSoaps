import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { TokenStorage } from '../services/token-storage';

/**
 * Attaches the bearer token to outgoing requests. On 401, tries a single
 * refresh before failing. Refresh endpoint and login endpoint are excluded
 * from the retry loop to avoid recursion.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(TokenStorage);
  const http = inject(HttpClient);
  const { access, refresh } = storage.read();

  const authed = access
    ? req.clone({ setHeaders: { Authorization: `Bearer ${access}` } })
    : req;

  return next(authed).pipe(
    catchError((err: unknown) => {
      if (
        err instanceof HttpErrorResponse &&
        err.status === 401 &&
        refresh &&
        !req.url.includes('/auth/refresh/') &&
        !req.url.includes('/auth/login/') &&
        !req.url.includes('/auth/admin-login/')
      ) {
        return http
          .post<{ access: string; refresh?: string }>(
            `${environment.apiUrl}/auth/refresh/`,
            { refresh },
          )
          .pipe(
            switchMap((tokens) => {
              storage.writeAccess(tokens.access);
              if (tokens.refresh) storage.write(tokens.access, tokens.refresh);
              const retry = req.clone({
                setHeaders: { Authorization: `Bearer ${tokens.access}` },
              });
              return next(retry);
            }),
            catchError((refreshErr) => {
              storage.clear();
              return throwError(() => refreshErr);
            }),
          );
      }
      return throwError(() => err);
    }),
  );
};
