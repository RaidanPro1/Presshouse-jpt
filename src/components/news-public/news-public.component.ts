import { Component, ChangeDetectionStrategy, output, signal, OnDestroy, afterNextRender, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../services/content.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-news-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-public.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsPublicComponent implements OnDestroy {
  login = output<void>();
  private contentService = inject(ContentService);
  settingsService = inject(SettingsService);
  
  news = this.contentService.news;

  // Use the latest news articles for the slider
  slides = computed(() => 
    this.news().slice(0, 3).map(article => ({
      imageUrl: article.imageUrl,
      category: article.category,
      title: article.title,
      subtitle: article.summary,
      actionText: 'اقرأ المزيد',
    }))
  );

  currentSlide = signal(0);
  private intervalId: any;

  constructor() {
    afterNextRender(() => {
      this.startAutoSlider();
    });
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  startAutoSlider() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    this.currentSlide.update(s => (s + 1) % this.slides().length);
  }

  prevSlide() {
    this.currentSlide.update(s => (s - 1 + this.slides().length) % this.slides().length);
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
    clearInterval(this.intervalId);
    this.startAutoSlider();
  }

  onLogin() {
    this.login.emit();
  }
}
