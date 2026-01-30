import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsletterService } from '../../services/newsletter.service';

@Component({
  selector: 'app-newsletter-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './newsletter-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsletterManagementComponent {
  newsletterService = inject(NewsletterService);
  subscribers = this.newsletterService.subscribers;

  exportSubscribers() {
    const subs = this.subscribers();
    if (subs.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,Email,SubscribedAt\n";
    subs.forEach(sub => {
      csvContent += `${sub.email},${sub.subscribedAt.toISOString()}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
