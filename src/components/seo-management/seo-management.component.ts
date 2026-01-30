
import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-seo-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seo-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeoManagementComponent {
  seoService = inject(SeoService);

  // Local signals to bind to the form, initialized from the service
  title = signal(this.seoService.pageTitle());
  description = signal(this.seoService.metaDescription());
  keywords = signal(this.seoService.metaKeywords());
  
  saveStatus = signal<'idle' | 'saving' | 'saved'>('idle');

  constructor() {
    // Keep local form signals in sync if service state changes elsewhere
    effect(() => {
      this.title.set(this.seoService.pageTitle());
      this.description.set(this.seoService.metaDescription());
      this.keywords.set(this.seoService.metaKeywords());
    });
  }
  
  saveSeoSettings() {
    this.saveStatus.set('saving');

    // Update the service with the new values from the form
    this.seoService.pageTitle.set(this.title());
    this.seoService.metaDescription.set(this.description());
    this.seoService.metaKeywords.set(this.keywords());
    
    // Simulate async save and show feedback
    setTimeout(() => {
      this.saveStatus.set('saved');
      setTimeout(() => this.saveStatus.set('idle'), 2000);
    }, 1000);
  }
}
