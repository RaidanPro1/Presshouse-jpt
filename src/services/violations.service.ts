
import { Injectable, signal, computed } from '@angular/core';
import { Violation } from '../models/violation.model';

@Injectable({
  providedIn: 'root',
})
export class ViolationsService {
  // The Single Source of Truth
  violations = signal<Violation[]>([]);

  // --- Dynamic Statistics ---

  totalViolations = computed(() => this.violations().length);

  violationsThisMonth = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return this.violations().filter(v => {
      const vDate = new Date(v.date);
      return vDate.getMonth() === currentMonth && vDate.getFullYear() === currentYear;
    }).length;
  });

  mostDangerousGovernorate = computed(() => {
    if (this.violations().length === 0) return 'لا توجد بيانات';
    const counts: Record<string, number> = {};
    this.violations().forEach(v => {
      counts[v.governorate] = (counts[v.governorate] || 0) + 1;
    });
    let max = 0;
    let governorate = 'غير محدد';
    for (const [gov, count] of Object.entries(counts)) {
      if (count > max) {
        max = count;
        governorate = gov;
      }
    }
    return governorate;
  });

  statsByType = computed(() => {
    const counts: Record<string, number> = {
      'اعتقال وحجز حرية': 0,
      'تهديد وتحريض': 0,
      'إصابة': 0,
      'منع من التغطية': 0,
      'قتل': 0,
      'محاكمات واستدعاء': 0,
      'أخرى': 0
    };

    this.violations().forEach(v => {
      if (v.case.includes('اعتقال') || v.case.includes('إخفاء') || v.case.includes('خطف')) counts['اعتقال وحجز حرية']++;
      else if (v.case.includes('تهديد') || v.case.includes('تحريض')) counts['تهديد وتحريض']++;
      else if (v.case.includes('إصابة') || v.case.includes('اعتداء')) counts['إصابة']++;
      else if (v.case.includes('منع') || v.case.includes('حجب') || v.case.includes('مصادرة')) counts['منع من التغطية']++;
      else if (v.case.includes('قتل') || v.case.includes('اغتيال') || v.case.includes('إعدام')) counts['قتل']++;
      else if (v.case.includes('استدعاء') || v.case.includes('حكم')) counts['محاكمات واستدعاء']++;
      else counts['أخرى']++;
    });

    return [
      { type: 'اعتقال وحجز حرية', count: counts['اعتقال وحجز حرية'], color: 'bg-red-600' },
      { type: 'تهديد وتحريض', count: counts['تهديد وتحريض'], color: 'bg-orange-500' },
      { type: 'إصابة', count: counts['إصابة'], color: 'bg-yellow-500' },
      { type: 'منع من التغطية', count: counts['منع من التغطية'], color: 'bg-blue-500' },
      { type: 'قتل', count: counts['قتل'], color: 'bg-black' },
      { type: 'محاكمات واستدعاء', count: counts['محاكمات واستدعاء'], color: 'bg-purple-500' },
    ];
  });

  statsByGovernorate = computed(() => {
    const counts: Record<string, number> = {};
    this.violations().forEach(v => {
      counts[v.governorate] = (counts[v.governorate] || 0) + 1;
    });
    
    // Convert to array and sort
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  });

  statsByPerpetrator = computed(() => {
     const counts: Record<string, number> = {
        'جماعة أنصار الله': 0,
        'قوات الحكومة الشرعية': 0,
        'المجلس الانتقالي الجنوبي': 0,
        'تنظيمات متطرفة (القاعدة/داعش)': 0,
        'أخرى': 0
     };

     this.violations().forEach(v => {
        if (v.perpetrator.includes('أنصار الله') || v.perpetrator.includes('الحوثيين')) counts['جماعة أنصار الله']++;
        else if (v.perpetrator.includes('الشرعية') || v.perpetrator.includes('الأمن') || v.perpetrator.includes('الجيش')) counts['قوات الحكومة الشرعية']++;
        else if (v.perpetrator.includes('الانتقالي') || v.perpetrator.includes('الحزام')) counts['المجلس الانتقالي الجنوبي']++;
        else if (v.perpetrator.includes('القاعدة') || v.perpetrator.includes('داعش')) counts['تنظيمات متطرفة (القاعدة/داعش)']++;
        else counts['أخرى']++;
     });

     return [
        { name: 'جماعة أنصار الله', count: counts['جماعة أنصار الله'], color: 'stroke-green-600', legendColor: 'bg-green-600' },
        { name: 'قوات الحكومة الشرعية', count: counts['قوات الحكومة الشرعية'], color: 'stroke-red-600', legendColor: 'bg-red-600' },
        { name: 'المجلس الانتقالي الجنوبي', count: counts['المجلس الانتقالي الجنوبي'], color: 'stroke-cyan-500', legendColor: 'bg-cyan-500' },
        { name: 'تنظيمات متطرفة (القاعدة/داعش)', count: counts['تنظيمات متطرفة (القاعدة/داعش)'], color: 'stroke-black', legendColor: 'bg-black' },
        { name: 'أخرى / مجهولون', count: counts['أخرى'], color: 'stroke-gray-500', legendColor: 'bg-gray-500' },
     ];
  });

  // --- Actions ---

  addViolation(violation: Violation) {
    this.violations.update(current => [violation, ...current]);
  }
}