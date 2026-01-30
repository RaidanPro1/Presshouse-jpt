import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolService } from '../../services/tool.service';
import { UserService } from '../../services/user.service';
import { ToolCardComponent } from '../tool-card/tool-card.component';
import { Tool } from '../../models/tool.model';
import { DocumentationComponent } from '../documentation/documentation.component';

@Component({
  selector: 'app-tech-support-portal',
  standalone: true,
  imports: [CommonModule, ToolCardComponent, DocumentationComponent],
  templateUrl: './tech-support-portal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TechSupportPortalComponent {
  private toolService = inject(ToolService);
  userService = inject(UserService);

  user = this.userService.currentUser;

  portalTools = computed(() => 
    this.toolService.tools().filter(tool => tool.category === 'الدعم الفني')
  );
}
