import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolService } from '../../services/tool.service';
import { UserService } from '../../services/user.service';
import { ToolCardComponent } from '../tool-card/tool-card.component';
import { Tool } from '../../models/tool.model';

@Component({
  selector: 'app-newsroom',
  standalone: true,
  imports: [CommonModule, ToolCardComponent],
  templateUrl: './newsroom.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsroomComponent {
  private toolService = inject(ToolService);
  userService = inject(UserService);

  user = this.userService.currentUser;

  newsroomTools = computed(() => 
    this.toolService.tools().filter(tool => tool.category === 'إدارة غرفة الأخبار والنشر')
  );

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
