
import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolService } from '../../services/tool.service';
import { UserService } from '../../services/user.service';
import { ToolCardComponent } from '../tool-card/tool-card.component';

@Component({
  selector: 'app-social-media-analysis',
  standalone: true,
  imports: [CommonModule, ToolCardComponent],
  templateUrl: './social-media-analysis.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialMediaAnalysisComponent {
  private toolService = inject(ToolService);
  userService = inject(UserService);
  
  user = this.userService.currentUser;

  socialTools = computed(() => 
    this.toolService.tools().filter(tool => tool.category === 'تحليل الإعلام الاجتماعي')
  );

  handleToolToggle(toolId: string) {
    this.toolService.toggleToolStatus(toolId);
  }

  handleToggleFavorite(toolId:string) {
    this.toolService.toggleFavoriteStatus(toolId);
  }
}
