
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoggerService } from '../../services/logger.service';
import { UserService } from '../../services/user.service';
import { ViolationsService } from '../../services/violations.service';
import { Violation } from '../../models/violation.model';

@Component({
  selector: 'app-violation-report-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './violation-report-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViolationReportFormComponent {
  private logger = inject(LoggerService);
  private userService = inject(UserService);
  private violationsService = inject(ViolationsService);

  reportAs = signal<'victim' | 'proxy'>('victim');

  // Proxy reporter's data
  proxyName = signal('');
  proxyPhone = signal('');
  proxyRelationship = signal('');
  
  // Victim's data
  victimFullName = signal('');
  victimAlias = signal('');
  victimMediaOrg = signal('');
  victimSocialAccounts = signal('');
  victimWhatsapp = signal('');
  
  // Incident details
  incidentGovernorate = signal('');
  incidentDistrict = signal('');
  incidentDate = signal('');
  
  // Perpetrator details
  perpetrators = signal<string[]>([]);
  incidentReason = signal('');
  incidentStory = signal('');

  // Evidence
  evidenceTypes = signal<string[]>([]);
  evidenceLink = signal('');

  // Needs
  urgentNeeds = signal<string[]>([]);
  
  // Publication policy
  publicationPolicy = signal('');
  
  governorates = [
    'أمانة العاصمة صنعاء', 'عدن', 'تعز', 'الحديدة', 'مأرب', 'حضرموت', 'شبوة', 'إب', 'ذمار', 'لحج', 'الضالع', 'أبين', 'صعدة', 'عمران', 'حجة', 'البيضاء', 'المهرة', 'سقطرى', 'المحويت', 'ريمة', 'الجوف'
  ];
  
  relationshipOptions = ['زميل عمل', 'محامي العائلة', 'أحد أفراد الأسرة', 'شاهد عيان', 'أخرى'];
  
  perpetratorOptions = [
    'جماعة أنصار الله الحوثيين', 'قوات المجلس الانتقالي الجنوبي والحزام الأمني', 'قوات الحكومة الشرعية والأمن العام', 'قوات المقاومة الوطنية في الساحل الغربي', 'تشكيلات عسكرية مدعومة من التحالف', 'تنظيمات متطرفة القاعدة أو داعش', 'مسلحون قبليون', 'عصابات مجهولة أو قطاع طرق', 'جهة العمل المؤسسة الإعلامية نفسها'
  ];

  evidenceOptions = ['صور إصابات', 'رسائل تهديد', 'وثائق قضائية', 'فيديو', 'لا يوجد حالياً'];
  needsOptions = ['دعم قانوني ومحام', 'تدخل طبي عاجل', 'نقل لمكان آمن', 'دعم نفسي', 'مجرد توثيق للواقعة', 'نشر وتضامن إعلامي'];

  // --- Checkbox Handlers ---
  onCheckboxChange(event: Event, item: string, collection: (typeof this.perpetrators | typeof this.evidenceTypes | typeof this.urgentNeeds)) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      collection.update(values => [...values, item]);
    } else {
      collection.update(values => values.filter(v => v !== item));
    }
  }

  isPerpetratorSelected(item: string): boolean {
    return this.perpetrators().includes(item);
  }

  isEvidenceSelected(item: string): boolean {
    return this.evidenceTypes().includes(item);
  }

  isNeedSelected(item: string): boolean {
    return this.urgentNeeds().includes(item);
  }
  // --- End Checkbox Handlers ---

  submitForm() {
    // 1. Create Violation Object for Service
    const newViolation: Violation = {
        id: Date.now(),
        case: this.mapStoryToCaseType(this.incidentStory()), // Simple auto-classification
        journalist: this.victimFullName(),
        governorate: this.incidentGovernorate() || 'غير محدد',
        date: this.incidentDate() || new Date().toISOString().split('T')[0],
        perpetrator: this.perpetrators().length > 0 ? this.perpetrators()[0] : 'مجهول',
        status: 'Pending',
        summary: this.incidentStory().substring(0, 100) + '...'
    };

    // 2. Add to Service (Updates all dashboards)
    this.violationsService.addViolation(newViolation);

    // 3. Log Audit Event
    const currentUser = this.userService.currentUser();
    this.logger.logEvent(
        'تقديم بلاغ انتهاك جديد',
        `تم تقديم بلاغ جديد بخصوص الصحفي "${this.victimFullName()}". (تمت إضافته لقاعدة البيانات كـ Pending)`,
        currentUser?.name ?? 'مُبلِّغ عام',
        currentUser?.role === 'super-admin'
    );

    // 4. Reset Form (Simplified)
    alert('تم استلام البلاغ بنجاح وإضافته إلى قاعدة البيانات للمراجعة.');
    this.victimFullName.set('');
    this.incidentStory.set('');
    this.perpetrators.set([]);
  }

  private mapStoryToCaseType(story: string): string {
      const text = story.toLowerCase();
      if(text.includes('قتل') || text.includes('رصاص')) return 'قتل';
      if(text.includes('حبس') || text.includes('سجن') || text.includes('اعتقال')) return 'اعتقال وحجز حرية';
      if(text.includes('ضرب') || text.includes('اعتداء')) return 'إصابة';
      if(text.includes('منع') || text.includes('تصوير')) return 'منع من التغطية';
      return 'انتهاك آخر';
  }
}
