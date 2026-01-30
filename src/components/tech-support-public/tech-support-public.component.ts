import { Component, ChangeDetectionStrategy, output, signal, OnDestroy, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Slide {
  imageUrl: string;
  title: string;
  subtitle: string;
  actionText: string;
}

@Component({
  selector: 'app-tech-support-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tech-support-public.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechSupportPublicComponent implements OnDestroy {
  login = output<void>();

  slides = signal<Slide[]>([
    {
      imageUrl: 'assets/images/support/portal-1.jpg',
      title: 'بوابة دعم الصحفيين',
      subtitle: 'ملاذ آمن للصحفيين للحصول على المساعدة التقنية والقانونية الطارئة.',
      actionText: 'اطلب المساعدة الآن',
    },
    {
      imageUrl: 'assets/images/support/legal.jpg',
      title: 'مساعدة قانونية عاجلة',
      subtitle: 'هل تواجه ملاحقة قضائية بسبب عملك؟ تواصل مع شبكة المحامين المتخصصين لدينا.',
      actionText: 'احصل على دعم قانوني',
    },
    {
      imageUrl: 'assets/images/support/security-check.jpg',
      title: 'فحص أمني لأجهزتك',
      subtitle: 'هل تشك في وجود برامج تجسس على هاتفك أو حاسوبك؟ فريقنا يساعدك على الفحص والتأمين.',
      actionText: 'ابدأ فحص الأمان الرقمي',
    },
  ]);
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
