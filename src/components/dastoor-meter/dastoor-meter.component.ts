
import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ViolationRecord {
  id: number;
  officialName: string;
  entity: string;
  violationDate: string;
  lawViolated: string;
  severityScore: number; // 1-10
  status: 'New' | 'Verified' | 'Published';
  summary: string;
}

@Component({
  selector: 'app-dastoor-meter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dastoor-meter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DastoorMeterComponent {
  
  // --- Data State ---
  violations = signal<ViolationRecord[]>([
    { id: 1, officialName: 'وزير النقل', entity: 'وزارة النقل', violationDate: '2024-07-20', lawViolated: 'قانون المناقصات رقم 23', severityScore: 7, status: 'Published', summary: 'إصدار أمر مباشر بالأمر المباشر دون مناقصة عامة.' },
    { id: 2, officialName: 'مدير أمن المحافظة', entity: 'إدارة الأمن', violationDate: '2024-07-18', lawViolated: 'الدستور - المادة 48 (حرية التنقل)', severityScore: 9, status: 'Verified', summary: 'احتجاز تعسفي لمواطنين في نقطة تفتيش دون مسوغ قانوني.' },
    { id: 3, officialName: 'مدير مكتب التربية', entity: 'مكتب التربية والتعليم', violationDate: '2024-07-15', lawViolated: 'قانون الخدمة المدنية', severityScore: 4, status: 'Published', summary: 'خصم غير قانوني من مستحقات المعلمين.' },
  ]);

  selectedReceipt = signal<ViolationRecord | null>(null);

  daysSinceLastViolation = computed(() => {
    const lastDate = new Date(this.violations()[0].violationDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  });

  topViolator = computed(() => {
    // Simple logic: verify who appears most or has highest severity sum
    return 'وزير النقل'; 
  });

  redList = computed(() => {
    // Return top 5 officials with highest severity
    return [...this.violations()].sort((a,b) => b.severityScore - a.severityScore);
  });

  // --- Search/Archive State ---
  searchQuery = signal('');
  contradictionResult = signal<{statement1: string, date1: string, statement2: string, date2: string} | null>(null);
  
  // --- Audio State ---
  isPlayingAudio = signal(false);

  checkContradiction() {
    if(!this.searchQuery()) return;
    // Simulate finding a contradiction
    this.contradictionResult.set({
        statement1: 'لا توجد أي سجون سرية في المحافظة، ونحن نلتزم بالقانون.',
        date1: '2023-05-10',
        statement2: 'قمنا بنقل المحتجزين من الموقع "س" لدواعٍ أمنية.',
        date2: '2024-02-15'
    });
  }

  calculateFine(score: number): string {
    const jailMonths = score * 6; // 6 months per point (hypothetical)
    const years = Math.floor(jailMonths / 12);
    const months = jailMonths % 12;
    return `${years} سنوات و ${months} أشهر`;
  }

  togglePodcast() {
    this.isPlayingAudio.set(!this.isPlayingAudio());
  }

  viewReceipt(violation: ViolationRecord) {
    this.selectedReceipt.set(violation);
  }

  closeReceipt() {
    this.selectedReceipt.set(null);
  }
}
