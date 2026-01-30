
import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolService } from '../../services/tool.service';
import { UserService } from '../../services/user.service';
import { ToolCardComponent } from '../tool-card/tool-card.component';

@Component({
  selector: 'app-automation',
  standalone: true,
  imports: [CommonModule, ToolCardComponent],
  templateUrl: './automation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutomationComponent {
  private toolService = inject(ToolService);
  userService = inject(UserService);
  
  user = this.userService.currentUser;

  automationTools = computed(() => 
    this.toolService.tools().filter(tool => tool.category === 'الأتمتة وسير العمل')
  );

  handleToolToggle(toolId: string) {
    this.toolService.toggleToolStatus(toolId);
  }

  handleToggleFavorite(toolId:string) {
    this.toolService.toggleFavoriteStatus(toolId);
  }
}
