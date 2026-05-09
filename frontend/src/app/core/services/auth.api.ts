import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginResponse, TokenPair, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/auth`;

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login/`, { username, password });
  }

  adminLogin(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/admin-login/`, { username, password });
  }

  register(payload: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }): Observable<User> {
    return this.http.post<User>(`${this.base}/register/`, payload);
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.base}/me/`);
  }

  refresh(refresh: string): Observable<TokenPair> {
    return this.http.post<TokenPair>(`${this.base}/refresh/`, { refresh });
  }

  logout(refresh: string): Observable<void> {
    return this.http.post<void>(`${this.base}/logout/`, { refresh });
  }
}
