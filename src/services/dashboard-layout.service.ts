
import { Injectable, signal, effect } from '@angular/core';
import { UserRole } from './user.service';

export interface Widget {
  key: string;
  name: string;
  defaultOrder: number;
}

export interface RoleLayout {
  orderedWidgets: string[];
  hiddenWidgets: string[];
}

// Define widgets for the Journalist Workspace that can be customized.
export const JOURNALIST_WIDGETS: Widget[] = [
  { key: 'quick-access', name: 'أدوات الوصول السريع', defaultOrder: 1 },
  { key: 'investigations', name: 'تحقيقاتي', defaultOrder: 2 },
  { key: 'services', name: 'حالة خدمات غرفة الأخبار', defaultOrder: 3 },
  { key: 'knowledge', name: 'من قاعدة المعرفة', defaultOrder: 4 },
  { key: 'alerts', name: 'الإنذار المبكر (IndiLab)', defaultOrder: 5 },
  { key: 'activity', name: 'آخر النشاطات', defaultOrder: 6 },
];

const DEFAULT_JOURNALIST_LAYOUT: RoleLayout = {
  orderedWidgets: JOURNALIST_WIDGETS.sort((a, b) => a.defaultOrder - b.defaultOrder).map(w => w.key),
  hiddenWidgets: [],
};

@Injectable({
  providedIn: 'root',
})
export class DashboardLayoutService {
  layouts = signal<Record<string, RoleLayout>>({
    'investigative-journalist': { ...DEFAULT_JOURNALIST_LAYOUT },
    'editor-in-chief': { ...DEFAULT_JOURNALIST_LAYOUT },
  });

  constructor() {
    this.loadLayouts();
    effect(() => {
      this.saveLayouts();
    });
  }

  getLayout(role: UserRole): RoleLayout {
    return this.layouts()[role] || DEFAULT_JOURNALIST_LAYOUT;
  }

  updateLayout(role: UserRole, layout: RoleLayout) {
    this.layouts.update(layouts => ({
      ...layouts,
      [role]: layout,
    }));
  }

  private loadLayouts() {
    const savedLayouts = localStorage.getItem('dashboard-layouts');
    if (savedLayouts) {
      try {
        const parsed = JSON.parse(savedLayouts);
        if (parsed['investigative-journalist']) {
          this.layouts.set(parsed);
        }
      } catch (e) {
        console.error('Failed to load dashboard layouts from localStorage', e);
        this.saveLayouts();
      }
    }
  }

  private saveLayouts() {
    localStorage.setItem('dashboard-layouts', JSON.stringify(this.layouts()));
  }
}
