import { Component, ChangeDetectionStrategy, computed, signal, OnDestroy, afterNextRender, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserRole } from '../../services/user.service';

// --- Data Models for the Control Panel ---

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  color: string;
}

interface Service {
  name: string;
  status: 'Online' | 'Degraded' | 'Offline' | 'Restarting';
}

interface Investigation {
  id: number;
  title: string;
  lead: string;
  status: 'Active' | 'Review' | 'Closed';
  lastActivity: string;
}

interface TeamMember {
  name: string;
  title: string;
  imageUrl: string;
  status: 'Online' | 'Away' | 'Offline';
}

type CommandCenterView = 'overview' | 'security' | 'ai_analytics' | 'tasks';

interface CommandCenterLink {
  key: CommandCenterView;
  name: string;
  icon: string; // SVG path
  allowedRoles: UserRole[];
}

@Component({
  selector: 'app-command-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './command-center.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandCenterComponent implements OnDestroy {
  private userService = inject(UserService);

  // --- State Signals for the Control Panel ---
  systemMetrics = signal<SystemMetric[]>([
    { name: 'المعالج', value: 34, unit: '%', color: 'bg-green-500' },
    { name: 'الذاكرة', value: 58, unit: '%', color: 'bg-yellow-500' },
    { name: 'التخزين', value: 71, unit: '%', color: 'bg-orange-500' },
  ]);

  services = signal<Service[]>([
    { name: 'Gateway', status: 'Online' },
    { name: 'AI Core (Ollama)', status: 'Online' },
    { name: 'Database (Postgres)', status: 'Online' },
    { name: 'Archive Service (MinIO)', status: 'Degraded' },
    { name: 'Task Queue (Redis)', status: 'Online' },
    { name: 'OSINT Worker (Celery)', status: 'Online' },
  ]);
  
  serviceStats = computed(() => {
    const stats = { online: 0, degraded: 0, offline: 0 };
    this.services().forEach(s => {
      if (s.status === 'Online') stats.online++;
      else if (s.status === 'Degraded') stats.degraded++;
      else if (s.status === 'Offline') stats.offline++;
    });
    return stats;
  });

  costData = signal({
    gemini: { daily: 45, monthly: 850 },
    local: { daily: 15, monthly: 300 },
    dailyBudget: 100
  });

  dailySpendPercentage = computed(() => {
    const totalDaily = this.costData().gemini.daily + this.costData().local.daily;
    return Math.min(100, (totalDaily / this.costData().dailyBudget) * 100);
  });

  investigations = signal<Investigation[]>([
    { id: 1, title: 'تحقيق: شبكات التهريب', lead: 'أحمد خالد', status: 'Active', lastActivity: 'تحديث قبل 5 دقائق' },
    { id: 2, title: 'تقرير: حالة التعليم', lead: 'فاطمة علي', status: 'Review', lastActivity: 'تقديم للمراجعة قبل ساعة' },
  ]);

  team = signal<TeamMember[]>([
    { name: 'محمد الحريبي', title: 'رئيس المؤسسة', imageUrl: 'assets/team/mohammed-alharibi.jpg', status: 'Online' },
    { name: 'مازن فارس', title: 'المدير التنفيذي', imageUrl: 'assets/team/mazen-fares.jpg', status: 'Online' },
    { name: 'الفتح العيسائي', title: 'مدير البرامج', imageUrl: 'assets/team/alfateh-alissai.jpg', status: 'Away' },
    { name: 'أحمد منعم', title: 'إدارة الإعلام', imageUrl: 'assets/team/ahmed-monem.jpg', status: 'Offline' },
  ]);
  
  showLogsModal = signal(false);
  logContent = signal('');
  
  // --- AI Terminal State ---
  aiPrompt = signal<string>('ما هي آخر المؤشرات الأمنية في مأرب؟');
  aiResponse = signal<string>('');
  isAiLoading = signal(false);

  // --- NEW: Sidebar Navigation State ---
  activeView = signal<CommandCenterView>('overview');
  
  private allLinks = signal<CommandCenterLink[]>([
    { key: 'overview', name: 'نظرة عامة', icon: 'M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.012-1.244h3.859M12 3v10.5m-4.5-4.5-4.5 4.5M16.5 9l4.5 4.5', allowedRoles: ['super-admin', 'editor-in-chief'] },
    { key: 'security', name: 'مراقبة الأمان', icon: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.007H12v-.007Z', allowedRoles: ['super-admin'] },
    { key: 'ai_analytics', name: 'تحليلات الذكاء الاصطناعي', icon: 'M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0V7.5A2.25 2.25 0 0 0 18 5.25h-2.25m-7.5 0h7.5m-7.5 0-1 1.083-1.558 1.685-1.558 1.686M8.25 5.25 9.25 6.333l1.558 1.685 1.558 1.686m-4.455 0L12 13.5m-1.558-1.685 1.558 1.686m0 0 1 1.083 1.558 1.685 1.558 1.686M9 21h6', allowedRoles: ['super-admin'] },
    { key: 'tasks', name: 'المهام الحرجة', icon: 'M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.235 1.248V16.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 16.5V11.126c0-.414.156-.812.434-1.126M6.75 12h10.5"', allowedRoles: ['super-admin', 'editor-in-chief'] }
  ]);
  
  visibleLinks = computed(() => {
    const userRole = this.userService.currentUser()?.role;
    if (!userRole) return [];
    return this.allLinks().filter(link => link.allowedRoles.includes(userRole));
  });

  private intervals: any[] = [];

  constructor() {
    afterNextRender(() => {
      this.startSimulations();
    });
  }

  ngOnDestroy() {
    this.intervals.forEach(clearInterval);
  }

  private startSimulations() {
    // Simulate system metrics fluctuation
    const metricsInterval = setInterval(() => {
      this.systemMetrics.update(metrics => 
        metrics.map(metric => ({
          ...metric,
          value: Math.min(100, Math.max(10, metric.value + (Math.random() - 0.5) * 5))
        }))
      );
    }, 2000);
    this.intervals.push(metricsInterval);
  }

  // --- NEW Method ---
  setView(view: CommandCenterView) {
    this.activeView.set(view);
  }

  // --- Service Management Simulation ---
  restartService(serviceName: string) {
    this.services.update(services =>
      services.map(s => s.name === serviceName ? { ...s, status: 'Restarting' } : s)
    );
    setTimeout(() => {
      this.services.update(services =>
        services.map(s => s.name === serviceName ? { ...s, status: 'Online' } : s)
      );
    }, 2000);
  }

  viewLogs(serviceName: string) {
    this.logContent.set(`[${new Date().toLocaleTimeString()}] INFO: Starting log stream for ${serviceName}...\n[${new Date().toLocaleTimeString()}] INFO: Service is running correctly.\n[${new Date().toLocaleTimeString()}] DEBUG: Connection to database pool successful.`);
    this.showLogsModal.set(true);
  }
  
  closeLogsModal() {
    this.showLogsModal.set(false);
    this.logContent.set('');
  }

  // --- AI Terminal Simulation ---
  async askAI() {
    if (this.isAiLoading() || !this.aiPrompt()) return;

    this.isAiLoading.set(true);
    this.aiResponse.set('');

    const fullResponse = `بناءً على تحليل المؤشرات الأولية، تم رصد ما يلي في محيط مأرب:\n- **زيادة في حركة الطيران غير المجدول:** تم تسجيل 3 رحلات جوية لطائرات استطلاع في الساعات الست الماضية.\n- **تشويش على الاتصالات:** تقارير متقطعة عن ضعف في شبكات الاتصالات الخلوية في المناطق الشمالية للمحافظة.\n- **نشاط إعلامي:** ارتفاع في استخدام وسوم مرتبطة بالتوتر على منصات التواصل الاجتماعي.\n\n**الاستنتاج الأولي:** هذه المؤشرات قد تشير إلى استعدادات لعملية أمنية أو عسكرية محدودة. يوصى بتكثيف المراقبة والتواصل مع المصادر الميدانية للتحقق.`;
    const words = fullResponse.split(/(\s+)/); // Split by spaces, keeping them

    for (const word of words) {
      this.aiResponse.update(r => r + word);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 20));
    }

    this.isAiLoading.set(false);
  }
}