import { Component, ChangeDetectionStrategy, signal, OnDestroy, afterNextRender, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../services/content.service';
import { SettingsService } from '../../services/settings.service';

interface Slide {
  imageUrl: string;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutUsComponent implements OnDestroy {
  private contentService = inject(ContentService);
  settingsService = inject(SettingsService);
  
  slides = signal<Slide[]>([
    {
      imageUrl: 'assets/images/about/slider-1.jpg',
      title: 'مؤسسة بيت الصحافة',
      subtitle: 'مؤسسة مجتمع مدني تهدف إلى تعزيز حرية الإعلام وخلق مساحة نقاش مهني وعملي للصحفيين والصحفيات.',
    },
    {
      imageUrl: 'assets/images/about/slider-2.jpg',
      title: 'رؤيتنا',
      subtitle: this.contentService.aboutContent().vision,
    },
    {
      imageUrl: 'assets/images/about/slider-3.jpg',
      title: 'رسالتنا',
      subtitle: this.contentService.aboutContent().mission,
    },
  ]);
  currentSlide = signal(0);
  private intervalId: any;

  // Data from ContentService
  team = this.contentService.team;
  advisors = this.contentService.advisors;
  partners = this.contentService.partners;
  aboutContent = this.contentService.aboutContent;
  
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
    clearInterval(this.intervalId); // Reset timer
    this.startAutoSlider();
  }
}
