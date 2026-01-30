import { Component, ChangeDetectionStrategy, output, signal, OnDestroy, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Slide {
  imageUrl: string;
  title: string;
  subtitle: string;
  actionText: string;
}

@Component({
  selector: 'app-training-portal-public',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './training-portal-public.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainingPortalPublicComponent implements OnDestroy {
  login = output<void>();

  slides = signal<Slide[]>([
    {
      imageUrl: 'assets/images/training/portal-1.jpg',
      title: 'بوابة التدريب والتطوير',
      subtitle: 'تمكين الصحفيين بأدوات ومهارات العصر الرقمي.',
      actionText: 'تصفح الدورات المتاحة',
    },
    {
      imageUrl: 'assets/images/training/digital-security.jpg',
      title: 'دورة الأمان الرقمي للصحفيين',
      subtitle: 'تعلم كيفية حماية اتصالاتك، تأمين أجهزتك، والتصفح الآمن أثناء عملك.',
      actionText: 'التسجيل في الدورة',
    },
    {
      imageUrl: 'assets/images/training/data-journalism.jpg',
      title: 'ورشة عمل صحافة البيانات المتقدمة',
      subtitle: 'حول الأرقام إلى قصص صحفية مؤثرة باستخدام أدوات تحليل وتصوير البيانات.',
      actionText: 'اكتشف الورشة',
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
