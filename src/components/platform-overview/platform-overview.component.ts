import { Component, ChangeDetectionStrategy, computed, inject, output } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ToolService } from '../../services/tool.service';
import { Tool } from '../../models/tool.model';
import { ToolCardComponent } from '../tool-card/tool-card.component';
import { TrialService } from '../../services/trial.service';
import { UserService } from '../../services/user.service';
import { PageHeaderComponent } from '../page-header/page-header.component';

interface FeatureHighlightCard {
  icon: string; // Heroicon SVG path
  title: string;
  description: string;
  color: string; // Tailwind color name (e.g., 'blue', 'red')
}

interface FeatureSection {
  title: string;
  description: string;
  imageUrl: string;
  imagePosition: 'left' | 'right';
}


@Component({
  selector: 'app-platform-overview',
  standalone: true,
  imports: [CommonModule, ToolCardComponent, PageHeaderComponent, NgOptimizedImage],
  templateUrl: './platform-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlatformOverviewComponent {
  private toolService = inject(ToolService);
  private trialService = inject(TrialService);
  private userService = inject(UserService);

  login = output<void>();

  contextualFeatures: FeatureHighlightCard[] = [
    {
      icon: 'M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 0v-1.5a6 6 0 0 0-6-6v0a6 6 0 0 0-6 6v1.5m6 7.5a6 6 0 0 0-6-6',
      title: 'حاجز اللهجات',
      description: 'عجز النماذج العامة عن فهم اللهجات الصنعانية، التعزية، أو الحضرمية بدقة، مما يؤدي لسوء فهم السياق.',
      color: 'blue'
    },
    {
      icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.007H12v-.007Z',
      title: 'الهلوسة المعلوماتية',
      description: 'اختلاق حقائق غير موجودة حول القوانين اليمنية أو الأعراف القبلية لعدم توفر بيانات تدريب كافية.',
      color: 'red'
    },
    {
      icon: 'm21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z',
      title: 'فجوة السياق',
      description: 'غياب الفهم الدقيق للديناميكيات السياسية والاجتماعية والقبلية المعقدة في اليمن.',
      color: 'purple'
    }
  ];

  featureSections: FeatureSection[] = [
    {
      title: 'سيادة رقمية وأمان لا مثيل له',
      description: 'تعمل المنصة بالكامل على خوادم خاصة، مما يضمن بقاء بيانات تحقيقاتك الحساسة ومصادرك بعيدة عن أي طرف ثالث. مع إمكانية العمل دون اتصال بالإنترنت، يبقى عملك مستمراً وآمناً حتى في أصعب الظروف.',
      imageUrl: 'https://picsum.photos/seed/security/1200/900',
      imagePosition: 'right'
    },
    {
      title: 'ترسانة متكاملة من أدوات التحقيق',
      description: 'من جمع المعلومات الاستخباراتية مفتوحة المصدر (OSINT) والتحقق من الوسائط، إلى التحليل الجغرافي والمالي، توفر YemenJPT كل ما تحتاجه في مكان واحد، مما يلغي الحاجة للتنقل بين عشرات الأدوات المتفرقة.',
      imageUrl: 'https://picsum.photos/seed/tools/1200/900',
      imagePosition: 'left'
    },
    {
      title: 'نواة معرفية مدعومة بالذكاء الاصطناعي',
      description: 'تم تصميم نماذج الذكاء الاصطناعي في المنصة وتدريبها على فهم السياق اليمني المعقد، اللهجات المحلية، والمصطلحات السياسية والقبلية، مما يوفر لك تحليلات وتلخيصات أكثر دقة وعمقاً من أي نموذج عالمي.',
      imageUrl: 'https://picsum.photos/seed/ai/1200/900',
      imagePosition: 'right'
    }
  ];

  // Filter for tools that are marked as publicly visible
  publicTools = computed(() => this.toolService.tools().filter(tool => tool.isVisiblePublicly));

  categorizedTools = computed(() => {
    return this.publicTools().reduce((acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push(tool);
      return acc;
    }, {} as Record<string, Tool[]>);
  });

  get categories(): string[] {
    const preferredOrder = [
      'النواة المعرفية والتحليل الذكي',
      'التقصي والاستخبارات مفتوحة المصدر',
      'تحليل الإعلام الاجتماعي',
      'التحقق وكشف التزييف',
      'الخرائط والرصد الجغرافي',
      'التحقيقات المالية والشركات',
      'الأرشفة والتوثيق الرقمي',
      'التواصل وسير العمل',
      'الأمن السيبراني المتقدم',
      'إدارة غرفة الأخبار والنشر',
      'إدارة المشاريع المؤسسية',
      'بوابة التدريب',
      'الدعم الفني',
      'إدارة العلاقات (CRM)',
      'الأتمتة وسير العمل'
    ];
    const allCategories = Object.keys(this.categorizedTools());
    
    // Sort categories based on preferred order, then alphabetically for the rest
    return allCategories.sort((a, b) => {
        const indexA = preferredOrder.indexOf(a);
        const indexB = preferredOrder.indexOf(b);
        if (indexA > -1 && indexB > -1) return indexA - indexB;
        if (indexA > -1) return -1;
        if (indexB > -1) return 1;
        return a.localeCompare(b);
    });
  }

  onTrialClick() {
    this.trialService.recordInteraction();
  }

  onLoginClick() {
    this.login.emit();
  }
}
