import { Component, ChangeDetectionStrategy, output, signal, OnDestroy, afterNextRender, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../services/content.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-projects-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects-public.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsPublicComponent implements OnDestroy {
  login = output<void>();
  private contentService = inject(ContentService);
  settingsService = inject(SettingsService);
  
  projects = this.contentService.projects;

  slides = computed(() => 
    this.projects().slice(0, 3).map(project => ({
      imageUrl: project.imageUrl,
      title: project.title,
      subtitle: project.description.substring(0, 100) + '...',
      actionText: 'اعرف المزيد',
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
