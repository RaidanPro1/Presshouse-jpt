import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

export interface LogEntry {
  timestamp: Date;
  event: string;
  details: string;
  user: string;
  isRoot: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private http: HttpClient = inject(HttpClient);
  // This URL is now relative to the domain, so it will be proxied by Nginx
  private botApiUrl = '/api/notify';

  logs = signal<LogEntry[]>([]);

  logEvent(event: string, details: string, user: string = 'زائر', isRoot: boolean = false) {
    const newLog: LogEntry = {
      timestamp: new Date(),
      event,
      details,
      user,
      isRoot
    };
    
    // Add to the beginning of the logs array
    this.logs.update(currentLogs => [newLog, ...currentLogs]);
    
    // Limit log history to prevent memory issues
    if (this.logs().length > 100) {
      this.logs.update(currentLogs => currentLogs.slice(0, 100));
    }

    this.http.post(this.botApiUrl, { event, details, user, isRoot }).subscribe({
      next: () => console.log('Event logged to bot server.'),
      error: (err: HttpErrorResponse) => {
        // Log a more descriptive error message instead of [object Object]
        console.error('Failed to log event to bot server:', err.status, err.statusText, err.url);
      }
    });
  }
}