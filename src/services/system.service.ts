
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ServiceAction = 'start' | 'stop' | 'restart';

@Injectable({
  providedIn: 'root'
})
export class SystemService {
  private http: HttpClient = inject(HttpClient);
  private apiUrl = '/api/service';

  performServiceAction(serviceName: string, action: ServiceAction): Observable<any> {
    return this.http.post(`${this.apiUrl}/${action}`, { serviceName });
  }
}
