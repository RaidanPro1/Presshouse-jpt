
import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolService } from '../../services/tool.service';
import { UserService } from '../../services/user.service';
import { ToolCardComponent } from '../tool-card/tool-card.component';

@Component({
  selector: 'app-archiving',
  standalone: true,
  imports: [CommonModule, ToolCardComponent],
  templateUrl: './archiving.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArchivingComponent {
  private toolService = inject(ToolService);
  userService = inject(UserService);
  
  user = this.userService.currentUser;

  archivingTools = computed(() => 
    this.toolService.tools().filter(tool => tool.category === 'الأرشفة والتوثيق الرقمي')
  );

  handleToolToggle(toolId: string) {
    this.toolService.toggleToolStatus(toolId);
  }

  handleToggleFavorite(toolId:string) {
    this.toolService.toggleFavoriteStatus(toolId);
  }
}