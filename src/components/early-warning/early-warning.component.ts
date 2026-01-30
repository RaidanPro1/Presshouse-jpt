
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Report {
  date: string;
  summary: string;
  threatLevel: 'Low' | 'Medium' | 'High';
  indicators: {
    name: string;
    description: string;
    confidence: 'Low' | 'Medium' | 'High';
    pillar: 'Mobility' | 'Communications' | 'Infrastructure' | 'Aviation';
  }[];
  correlation: string;
  scenarios: {
    mostLikely: string;
    worstCase: string;
  };
  recommendations: string[];
}

@Component({
  selector: 'app-early-warning',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './early-warning.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EarlyWarningComponent {
  query = signal<string>('ماذا يحدث في الحديدة؟');
  isLoading = signal<boolean>(false);
  report = signal<Report | null>(null);
  feedbackSent = signal<'' | 'helpful' | 'not-helpful'>('');

  generateReport() {
    if (!this.query()) return;
    this.isLoading.set(true);
    this.report.set(null);
    this.feedbackSent.set('');

    // Simulate AI analysis based on the detailed system prompt
    setTimeout(() => {
      const currentDate = new Date();
      const mockReport: Report = {
        date: currentDate.toLocaleString('ar-EG'),
        summary: `تم رصد مؤشرات متعددة تشير إلى تصعيد محتمل للتوتر في منطقة ${this.query().replace('ماذا يحدث في', '') || 'الحديدة'}.`,
        threatLevel: 'High',
        indicators: [
          {
            name: 'تشويش GPS عالي الكثافة',
            description: 'تم رصد انقطاع كامل لإشارات GPS بالقرب من الميناء والمناطق الساحلية.',
            confidence: 'High',
            pillar: 'Infrastructure',
          },
          {
            name: 'توقف حركة الملاحة البحرية',
            description: 'عدة سفن تجارية أوقفت أجهزة التتبع (AIS) أو توقفت عن الحركة بشكل غير طبيعي.',
            confidence: 'Medium',
            pillar: 'Aviation',
          },
          {
            name: 'ارتفاع في استخدام VPN',
            description: 'لوحظ ارتفاع بنسبة 300% في عمليات البحث وتحميل تطبيقات VPN في محافظة الحديدة خلال الـ 6 ساعات الماضية.',
            confidence: 'Medium',
            pillar: 'Communications'
          }
        ],
        correlation: 'تزامن تشويش الـ GPS مع توقف حركة السفن يوحي بوجود عملية عسكرية أو أمنية تستهدف الملاحة البحرية. الارتفاع في استخدام VPN قد يكون رد فعل من السكان تحسباً لانقطاع وشيك في الإنترنت.',
        scenarios: {
          mostLikely: 'عملية عسكرية محدودة النطاق تستهدف أصولاً بحرية أو استعداد لفرض حصار إلكتروني على المنطقة.',
          worstCase: 'هجوم واسع النطاق على الميناء أو المناطق الساحلية، مصحوب بقطع كامل لشبكة الإنترنت والاتصالات.',
        },
        recommendations: [
          'التحقق من المستشفيات المحلية ومراكز الطوارئ حول أي استعدادات غير طبيعية.',
          'مراقبة قنوات التيليجرام العسكرية والسياسية لكلا الطرفين بحثاً عن أي بيانات أو تهديدات.',
          'التواصل مع مصادر ميدانية في الميناء والمناطق المجاورة للتحقق من أي تحركات غير اعتيادية.',
          'أرشفة المواقع الإخبارية الهامة وصفحات التواصل الاجتماعي تحسباً لحذفها.'
        ],
      };
      this.report.set(mockReport);
      this.isLoading.set(false);
    }, 2500);
  }

  sendFeedback(feedback: 'helpful' | 'not-helpful') {
    this.feedbackSent.set(feedback);
    // In a real application, this would send data to a logging or fine-tuning service.
    console.log(`Feedback received: ${feedback}`);
  }
}