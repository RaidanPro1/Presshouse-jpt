
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-public-defender',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './public-defender.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicDefenderComponent {
  private userService = inject(UserService);
  private logger = inject(LoggerService);

  complaintText = signal('');
  isProcessing = signal(false);
  generatedDocument = signal('');
  
  caseTypes = ['نزاع عقاري', 'انتهاك حقوق وظيفية', 'ابتزاز إلكتروني', 'اعتداء جسدي', 'اعتقال تعسفي', 'أخرى'];
  selectedCaseType = signal('نزاع عقاري');

  generateLegalDocument() {
    if (!this.complaintText()) return;

    this.isProcessing.set(true);
    
    // Simulate AI processing time
    setTimeout(() => {
        const doc = `
بسم الله الرحمن الرحيم

لدى محكمة [اسم المحكمة المختصة] الموقرة
الموضوع: شكوى وبلاغ حول ${this.selectedCaseType()}

إلى سيادة رئيس المحكمة / وكيل النيابة المحترم،
تحية طيبة وبعد،

مقدم الطلب: [الاسم الكامل]
ضد: [اسم المدعى عليه / الجهة]

أتقدم إليكم بهذه الشكوى بصفتي مواطناً متضرراً، ملتمساً إنصافكم وتطبيقكم لسيادة القانون. حيث أنه في تاريخ [التاريخ]، الموافق [اليوم]، تعرضت لـ [وصف موجز للضرر] من قبل المذكور أعلاه في منطقة [المكان].

الوقائع:
${this.complaintText()}

الأسانيد القانونية:
استناداً إلى الدستور اليمني والقوانين النافذة التي تجرم التعدي على حقوق الآخرين وتكفل الحماية للمواطنين، وحيث أن ما قام به المشكو به يعد مخالفة صريحة لنصوص المواد [أرقام مواد افتراضية] من قانون الجرائم والعقوبات.

الطلبات:
1. قبول الشكوى شكلاً وموضوعاً.
2. استدعاء المشكو به والتحقيق معه في المنسوب إليه.
3. إلزام المشكو به بوقف التعرض / إعادة الحق / التعويض العادل عما لحق بي من ضرر مادي ومعنوي.
4. اتخاذ الإجراءات القانونية الرادعة لضمان عدم تكرار مثل هذه الأفعال.

وتقبلوا خالص التحية والتقدير،،،

مقدم الطلب: ....................
التوقيع: ....................
التاريخ: ${new Date().toLocaleDateString('ar-EG')}
        `;
        
        this.generatedDocument.set(doc);
        this.isProcessing.set(false);
        
        const user = this.userService.currentUser();
        this.logger.logEvent(
            'استخدام المُرافع الشعبي',
            `تم توليد عريضة قانونية لنوع القضية: ${this.selectedCaseType()}`,
            user?.name,
            user?.role === 'super-admin'
        );

    }, 2500);
  }

  printDocument() {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
        printWindow.document.write('<html><head><title>طباعة العريضة</title>');
        printWindow.document.write('<style>body { font-family: "Cairo", sans-serif; direction: rtl; padding: 2rem; white-space: pre-wrap; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(this.generatedDocument());
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }
  }
}
