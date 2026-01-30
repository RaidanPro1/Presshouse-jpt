
import { Component, ChangeDetectionStrategy, signal, inject, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutService } from '../../services/dashboard-layout.service';
import { UserService } from '../../services/user.service';

interface Investigation {
  id: number;
  title: string;
  lead: string;
  status: 'مسودة' | 'قيد المراجعة' | 'نُشر';
  lastUpdated: string;
}

interface IndiLabAlert {
  id: number;
  text: string;
  timestamp: string;
}

interface QuickAccessTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  url: string;
}

interface NewsroomService {
  name: string;
  status: 'Online' | 'Degraded' | 'Offline';
  url: string;
}

interface KnowledgeBaseArticle {
  title: string;
  summary: string;
  urlKey: string;
}

interface ActivityItem {
  user: string;
  avatar: string;
  action: string;
  target: string;
  time: string;
}

@Component({
  selector: 'app-journalist-workspace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './journalist-workspace.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JournalistWorkspaceComponent {
  navigate = output<string>();
  private layoutService = inject(DashboardLayoutService);
  private userService = inject(UserService);

  investigations = signal<Investigation[]>([
    { id: 1, title: 'تحقيق: شبكات التهريب عبر السواحل', lead: 'أحمد خالد', status: 'قيد المراجعة', lastUpdated: '2024-07-22' },
    { id: 2, title: 'مسودة: تأثير انقطاع الإنترنت على التعليم', lead: 'فاطمة علي', status: 'مسودة', lastUpdated: '2024-07-20' },
    { id: 3, title: 'تحليل: بيانات الطيران فوق مأرب', lead: 'أنت', status: 'مسودة', lastUpdated: '2024-07-18' },
  ]);

  investigationSearchTerm = signal('');

  filteredInvestigations = computed(() => {
    const term = this.investigationSearchTerm().toLowerCase();
    if (!term) {
      return this.investigations();
    }
    return this.investigations().filter(inv => 
      inv.title.toLowerCase().includes(term) ||
      inv.lead.toLowerCase().includes(term)
    );
  });

  alerts = signal<IndiLabAlert[]>([
    { id: 1, text: 'تغير مفاجئ في بيانات صرف العملة في عدن', timestamp: 'منذ 3 ساعات' },
    { id: 2, text: 'رصد تشويش GPS عالي الكثافة بالقرب من ميناء الحديدة', timestamp: 'منذ 8 ساعات' },
    { id: 3, text: 'زيادة بنسبة 200% في عمليات البحث عن كلمة "أزمة وقود" في صنعاء', timestamp: 'منذ 12 ساعة' },
  ]);

  quickAccessTools = signal<QuickAccessTool[]>([
    { id: 'ai-assistant', name: 'المساعد الذكي', description: 'YemenJPT للبحث والتحليل', icon: 'robot', url: 'http://localhost:8081' },
    { id: 'searxng', name: 'البحث الآمن', description: 'محرك بحث خاص لا يتتبعك', icon: 'search', url: 'http://localhost:8888' },
    { id: 'webtop', name: 'المتصفح الآمن', description: 'لتصفح المواقع المشبوهة بأمان', icon: 'window-maximize', url: 'http://localhost:3004' },
    { id: 'mattermost', name: 'منصة التعاون', description: 'للتواصل مع فريق العمل', icon: 'comments', url: 'http://localhost:8065' },
    { id: 'nextcloud', name: 'الملفات الآمنة', description: 'لتخزين ومشاركة المستندات', icon: 'cloud', url: 'http://localhost:8082' },
    { id: 'libretranslate', name: 'الترجمة الآمنة', description: 'ترجمة النصوص والمستندات بسرية', icon: 'language', url: 'http://localhost:5000' },
  ]);

  newsroomServices = signal<NewsroomService[]>([
    { name: 'منصة التعاون (Chat)', status: 'Online', url: 'http://localhost:8065' },
    { name: 'المكتب السحابي (Files)', status: 'Online', url: 'http://localhost:8082' },
    { name: 'المتصفح الآمن (Browser)', status: 'Degraded', url: 'http://localhost:3004' },
    { name: 'أرشيف الويب (Archive)', status: 'Online', url: 'http://localhost:8000' },
  ]);
  
  knowledgeBaseSpotlight = signal<KnowledgeBaseArticle>({
    title: 'دليل التحليل الجنائي الرقمي للوسائط',
    summary: 'سير عمل مقترح للتحقق من صحة الصور ومقاطع الفيديو باستخدام أدوات InVID, ExifTool, و FotoForensics.',
    urlKey: 'documentation'
  });

  activityFeed = signal<ActivityItem[]>([
    { user: 'أحمد خالد', avatar: 'https://i.pravatar.cc/150?u=ahmed', action: 'أضاف مهمة جديدة:', target: 'جمع شهادات من شهود عيان', time: 'منذ 25 دقيقة' },
    { user: 'فاطمة علي', avatar: 'https://i.pravatar.cc/150?u=fatima', action: 'رفع ملف جديد:', target: 'تقرير مبدئي.docx', time: 'منذ ساعة' },
    { user: 'أنت', avatar: 'assets/team/mohammed-alharibi.jpg', action: 'أرسلت رسالة في نقاش:', target: 'تحقيق انتهاكات 2024', time: 'منذ 3 ساعات' },
  ]);

  user = this.userService.currentUser;
  
  layout = computed(() => {
    const role = this.user()?.role;
    if (!role || (role !== 'investigative-journalist' && role !== 'editor-in-chief')) {
        // Fallback for roles without customizable dashboards (like super-admin)
        return { 
          orderedWidgets: ['quick-access', 'investigations', 'services', 'knowledge', 'alerts', 'activity'], 
          hiddenWidgets: [] 
        };
    }
    return this.layoutService.getLayout(role);
  });

  visibleWidgets = computed(() => {
    const layout = this.layout();
    if (!layout) return [];
    
    return layout.orderedWidgets.filter(key => !layout.hiddenWidgets.includes(key));
  });

  getWidgetSpan(widgetKey: string): string {
    switch (widgetKey) {
      case 'investigations':
        return 'lg:col-span-8';
      case 'activity':
        return 'lg:col-span-12';
      default:
        return 'lg:col-span-4';
    }
  }

  onNavigate(pageKey: string) {
    this.navigate.emit(pageKey);
  }
}
