
import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolService } from '../../services/tool.service';
import { UserService } from '../../services/user.service';
import { ViolationsService } from '../../services/violations.service';
import { ToolCardComponent } from '../tool-card/tool-card.component';
import { Tool } from '../../models/tool.model';
import { ViolationReportFormComponent } from '../violation-report-form/violation-report-form.component';

@Component({
  selector: 'app-violations-observatory',
  standalone: true,
  imports: [CommonModule, ToolCardComponent, ViolationReportFormComponent],
  templateUrl: './violations-observatory.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViolationsObservatoryComponent {
  private toolService = inject(ToolService);
  private violationsService = inject(ViolationsService);
  userService = inject(UserService);

  user = this.userService.currentUser;
  activeTab = signal<'dashboard' | 'database' | 'map' | 'report'>('dashboard');

  // Connect to Service
  violationsData = this.violationsService.violations;
  
  stats = computed(() => ({
    total: this.violationsService.totalViolations(),
    thisMonth: this.violationsService.violationsThisMonth(),
    mostDangerous: this.violationsService.mostDangerousGovernorate()
  }));

  violationsByType = this.violationsService.statsByType;
  violationsByGovernorate = this.violationsService.statsByGovernorate;
  
  // Static for demo (Yearly stats usually require more complex date processing)
  violationsByYear = [
    { year: 2021, count: 86 },
    { year: 2022, count: 92 },
    { year: 2023, count: 54 },
    { year: 2024, count: 35 },
  ];

  perpetratorChartData = computed(() => {
    const data = this.violationsService.statsByPerpetrator();
    const total = this.violationsService.totalViolations();
    if (total === 0) return [];

    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    let cumulativePercentage = 0;

    return data.map(item => {
      const percentage = (item.count / total) * 100;
      const rotation = -90 + (cumulativePercentage / 100) * 360;
      
      const segmentData = {
        ...item,
        percentage: percentage.toFixed(1),
        strokeDasharray: `${circumference}`,
        strokeDashoffset: circumference - (percentage / 100) * circumference,
        rotation,
      };
      cumulativePercentage += percentage;
      return segmentData;
    });
  });

  filteredViolations = computed(() => this.violationsData());

  portalTools = computed(() => 
    this.toolService.tools().filter(tool => tool.category === 'مرصد الانتهاكات الصحفية')
  );

  setTab(tab: 'dashboard' | 'database' | 'map' | 'report') {
    this.activeTab.set(tab);
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
