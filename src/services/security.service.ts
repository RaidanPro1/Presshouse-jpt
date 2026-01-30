
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  // FIX: Explicitly type the injected HttpClient to resolve a type inference issue.
  private http: HttpClient = inject(HttpClient);
  private apiUrl = '/api';

  triggerPanicMode(): Observable<any> {
    return this.http.post(`${this.apiUrl}/panic`, {});
  }
}
