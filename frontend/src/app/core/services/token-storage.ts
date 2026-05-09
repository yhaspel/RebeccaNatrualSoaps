import { Injectable } from '@angular/core';

const ACCESS = 'rns_access';
const REFRESH = 'rns_refresh';

@Injectable({ providedIn: 'root' })
export class TokenStorage {
  read(): { access: string | null; refresh: string | null } {
    return {
      access: localStorage.getItem(ACCESS),
      refresh: localStorage.getItem(REFRESH),
    };
  }
  write(access: string, refresh: string): void {
    localStorage.setItem(ACCESS, access);
    localStorage.setItem(REFRESH, refresh);
  }
  writeAccess(access: string): void {
    localStorage.setItem(ACCESS, access);
  }
  clear(): void {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  }
}
