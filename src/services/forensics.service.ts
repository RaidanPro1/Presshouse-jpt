
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ForensicsService {
  // FIX: Explicitly type the injected HttpClient to resolve a type inference issue.
  private http: HttpClient = inject(HttpClient);
  private apiUrl = '/api/forensics';

  analyzeMedia(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/analyze/`, formData);
  }
}
