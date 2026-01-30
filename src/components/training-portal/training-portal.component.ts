import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolService } from '../../services/tool.service';
import { UserService } from '../../services/user.service';
import { ToolCardComponent } from '../tool-card/tool-card.component';
import { Tool } from '../../models/tool.model';

@Component({
  selector: 'app-training-portal',
  standalone: true,
  imports: [CommonModule, ToolCardComponent],
  templateUrl: './training-portal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrainingPortalComponent {
  private toolService = inject(ToolService);
  userService = inject(UserService);

  user = this.userService.currentUser;

  trainingTools = computed(() => 
    this.toolService.tools().filter(tool => tool.category === 'بوابة التدريب')
  );

  handleToolToggle(toolId: string) {
    this.toolService.toggleToolStatus(toolId);
  }

  handleToggleFavorite(toolId: string) {
    this.toolService.toggleFavoriteStatus(toolId);
  }

  handleRunTool(tool: Tool) {
    // In a real app, this would navigate or open the tool's interface
    console.log(`Running tool: ${tool.name}`);
  }
}
