import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolService } from '../../services/tool.service';
import { UserService } from '../../services/user.service';
import { ToolCardComponent } from '../tool-card/tool-card.component';
import { Tool } from '../../models/tool.model';

interface TeamMember {
  name: string;
  avatar: string;
}

interface Project {
  id: number;
  name: string;
  status: 'On Track' | 'At Risk' | 'Off Track';
  progress: number;
  dueDate: string;
  budget: {
    total: number;
    spent: number;
  };
  team: TeamMember[];
  milestones?: { name: string, date: string }[];
}

interface CalendarEvent {
  date: Date;
  title: string;
  type: 'milestone' | 'deadline';
  projectId: number;
}

interface Resource {
  name: string;
  avatar: string;
  capacity: number; // percentage
  projects: { name: string, allocation: number }[];
}

interface Activity {
  user: TeamMember;
  action: string;
  target: string;
  project: string;
  timestamp: string;
}

@Component({
  selector: 'app-project-management-portal',
  standalone: true,
  imports: [CommonModule, ToolCardComponent],
  templateUrl: './project-management-portal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectManagementPortalComponent {
  private toolService = inject(ToolService);
  userService = inject(UserService);

  user = this.userService.currentUser;
  activeTab = signal<'overview' | 'calendar' | 'resources' | 'reports'>('overview');
  filterStatus = signal<'all' | 'On Track' | 'At Risk' | 'Off Track'>('all');

  teamMembers: TeamMember[] = [
    { name: 'محمد الحريبي', avatar: 'assets/team/mohammed-alharibi.jpg' },
    { name: 'مازن فارس', avatar: 'assets/team/mazen-fares.jpg' },
    { name: 'الفتح العيسائي', avatar: 'assets/team/alfateh-alissai.jpg' },
    { name: 'مكين العوجري', avatar: 'assets/team/makeen-alawjari.jpg' },
  ];

  projects = signal<Project[]>([
    { id: 1, name: 'تحقيق انتهاكات 2024', status: 'On Track', progress: 90, dueDate: '2024-08-15', budget: { total: 50000, spent: 45000 }, team: [this.teamMembers[0], this.teamMembers[1]], milestones: [{name: 'تقديم المسودة الأولى', date: '2024-08-01'}] },
    { id: 2, name: 'تحقيق فساد العقود الحكومية', status: 'At Risk', progress: 45, dueDate: '2024-09-01', budget: { total: 75000, spent: 40000 }, team: [this.teamMembers[2], this.teamMembers[3]] },
    { id: 3, name: 'تدريب الصحفيين - الدفعة 3', status: 'On Track', progress: 100, dueDate: '2024-07-20', budget: { total: 20000, spent: 19500 }, team: [this.teamMembers[1]] },
    { id: 4, name: 'تطوير المنصة الرقمية - المرحلة 2', status: 'On Track', progress: 75, dueDate: '2024-10-30', budget: { total: 120000, spent: 80000 }, team: [this.teamMembers[0], this.teamMembers[3]], milestones: [{name: 'إطلاق نسخة تجريبية', date: '2024-09-30'}, {name: 'جمع الملاحظات', date: '2024-10-15'}] },
  ]);
  
  filteredProjects = computed(() => {
    const status = this.filterStatus();
    if (status === 'all') {
      return this.projects();
    }
    return this.projects().filter(p => p.status === status);
  });

  recentActivities = signal<Activity[]>([
    { user: this.teamMembers[1], action: 'أكمل مهمة', target: 'تحديد الموقع الجغرافي للفيديو', project: 'تحقيق انتهاكات 2024', timestamp: 'منذ ساعتين' },
    { user: this.teamMembers[3], action: 'رفع ملف جديد', target: 'وثائق مسربة.pdf', project: 'تحقيق فساد العقود الحكومية', timestamp: 'منذ 5 ساعات' },
    { user: this.teamMembers[0], action: 'أضاف تعليقاً', target: 'مقابلة المصدر "س"', project: 'تحقيق انتهاكات 2024', timestamp: 'أمس' },
  ]);
  
  resources = signal<Resource[]>([
    { name: 'فريق التحقيقات', avatar: 'assets/team/mohammed-alharibi.jpg', capacity: 85, projects: [{name: 'تحقيق الانتهاكات', allocation: 50}, {name: 'تحقيق الفساد', allocation: 35}] },
    { name: 'فريق التدريب', avatar: 'assets/team/mazen-fares.jpg', capacity: 60, projects: [{name: 'تدريب الدفعة 3', allocation: 60}] },
    { name: 'فريق التطوير', avatar: 'assets/team/alfateh-alissai.jpg', capacity: 95, projects: [{name: 'تطوير المنصة', allocation: 95}] },
  ]);

  currentMonth = signal(new Date());

  calendarEvents = computed(() => {
    const deadlines = this.projects().map(p => ({
      date: new Date(p.dueDate),
      title: `تسليم: ${p.name}`,
      type: 'deadline',
      projectId: p.id
    } as CalendarEvent));

    const milestones = this.projects().flatMap(p => 
      p.milestones?.map(m => ({
        date: new Date(m.date),
        title: m.name,
        type: 'milestone',
        projectId: p.id
      } as CalendarEvent)) ?? []
    );

    return [...deadlines, ...milestones].sort((a,b) => a.date.getTime() - b.date.getTime());
  });

  calendarDays = computed(() => {
    const date = this.currentMonth();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = firstDayOfMonth;

    const days: (Date | null)[] = Array(startOffset).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }
    return days;
  });

  getEventsForDay(day: Date | null): CalendarEvent[] {
    if (!day) return [];
    return this.calendarEvents().filter(e => 
      e.date.getFullYear() === day.getFullYear() &&
      e.date.getMonth() === day.getMonth() &&
      e.date.getDate() === day.getDate()
    );
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  nextMonth() {
    this.currentMonth.update(d => {
      const newDate = new Date(d);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }

  prevMonth() {
    this.currentMonth.update(d => {
      const newDate = new Date(d);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }

  // --- KPI Computations ---
  activeProjectsCount = computed(() => this.projects().filter(p => p.progress < 100).length);
  totalBudget = computed(() => this.projects().reduce((sum, p) => sum + p.budget.total, 0));
  totalSpent = computed(() => this.projects().reduce((sum, p) => sum + p.budget.spent, 0));
  
  budgetPercentage = computed(() => {
    const total = this.totalBudget();
    return total > 0 ? Math.round((this.totalSpent() / total) * 100) : 0;
  });

  overallProgress = computed(() => {
      const activeProjects = this.projects().filter(p => p.progress < 100);
      if (activeProjects.length === 0) return 100;
      const totalProgress = activeProjects.reduce((sum, p) => sum + p.progress, 0);
      return Math.round(totalProgress / activeProjects.length);
  });
  
  circumference = 2 * Math.PI * 40; // For SVG donut chart

  budgetStrokeOffset = computed(() => this.circumference - (this.budgetPercentage() / 100) * this.circumference);
  progressStrokeOffset = computed(() => this.circumference - (this.overallProgress() / 100) * this.circumference);

  portalTools = computed(() => 
    this.toolService.tools().filter(tool => tool.category === 'إدارة المشاريع المؤسسية')
  );

  setTab(tab: 'overview' | 'calendar' | 'resources' | 'reports') {
    this.activeTab.set(tab);
  }

  setFilterStatus(status: 'all' | 'On Track' | 'At Risk' | 'Off Track') {
    this.filterStatus.set(status);
  }

  handleToolToggle(toolId: string) {
    this.toolService.toggleToolStatus(toolId);
  }

  handleToggleFavorite(toolId: string) {
    this.toolService.toggleFavoriteStatus(toolId);
  }

  handleRunTool(tool: Tool) {
    console.log(`Running tool: ${tool.name}`);
  }
}
