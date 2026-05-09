import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  body: string;
  language: 'en' | 'he';
}

@Injectable({ providedIn: 'root' })
export class ContactApi {
  private http = inject(HttpClient);
  send(payload: ContactPayload): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/contact/`, payload);
  }
}
