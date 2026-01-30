
import { Component, ChangeDetectionStrategy, computed, inject, signal, effect, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolService } from '../../services/tool.service';
import { UserService } from '../../services/user.service';
import { Tool } from '../../models/tool.model';
import { PlaceholderComponent } from '../placeholder/placeholder.component';
import { AiCoreComponent } from '../ai-core/ai-core.component';
import { SearxngComponent } from '../searxng/searxng.component';
import { ToolStateService } from '../../services/tool-state.service';
import { InvestigationCanvasComponent } from '../investigation-canvas/investigation-canvas.component';
import { ViolationsObservatoryComponent } from '../violations-observatory/violations-observatory.component';
import { TrainingPortalComponent } from '../training-portal/training-portal.component';
import { TechSupportPortalComponent } from '../tech-support-portal/tech-support-portal.component';

interface DashboardTab {
  key: string;
  name: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PlaceholderComponent,
    AiCoreComponent,
    SearxngComponent,
    InvestigationCanvasComponent,
    ViolationsObservatoryComponent,
    TrainingPortalComponent,
    TechSupportPortalComponent
  ],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private toolService = inject(ToolService);
  userService = inject(UserService);
  toolStateService = inject(ToolStateService);

  navigate = output<string>();
  
  user = this.userService.currentUser;
  private allTools = this.toolService.tools;

  dashboardTabs: DashboardTab[] = [
    { key: 'canvas', name: 'لوحة التحقيقات' },
    { key: 'violations-observatory', name: 'مرصد الانتهاكات' },
  ];
  
  activeTabId = signal<string>('canvas');

  constructor() {
    effect(() => {
      const activeTool = this.toolStateService.activeToolId();
      if (activeTool) {
        // If a tool becomes active, make it the active tab
        this.activeTabId.set(activeTool);
      } else if (this.toolStateService.openTools().length === 0) {
        // If there are no more open tools and the current active tab was a tool,
        // revert to the canvas.
        const isCurrentTabATool = !this.dashboardTabs.some(t => t.key === this.activeTabId());
        if (isCurrentTabATool) {
            this.activeTabId.set('canvas');
        }
      }
    });
  }

  selectTab(id: string) {
    this.activeTabId.set(id);
    const isTool = !this.dashboardTabs.some(t => t.key === id);

    if (isTool) {
      this.toolStateService.selectTab(id);
    } else {
      // De-select any active tool if a main tab is chosen
      this.toolStateService.activeToolId.set(null);
    }
  }

  closeToolTab(toolId: string, event: MouseEvent) {
    event.stopPropagation();
    this.toolStateService.closeTab(toolId);
    // The effect will handle switching the active tab.
  }

  getToolById(toolId: string): Tool | undefined {
    return this.allTools().find(t => t.id === toolId);
  }
}