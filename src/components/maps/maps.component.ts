import { Component, ChangeDetectionStrategy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolService } from '../../services/tool.service';
import { UserService } from '../../services/user.service';
import { ToolCardComponent } from '../tool-card/tool-card.component';

type MapTab = 'ushahidi' | 'kepler' | 'earth-engine' | 'live';

@Component({
  selector: 'app-maps',
  standalone: true,
  imports: [CommonModule, ToolCardComponent],
  templateUrl: './maps.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapsComponent {
  private toolService = inject(ToolService);
  userService = inject(UserService);
  
  user = this.userService.currentUser;
  activeTab = signal<MapTab>('ushahidi');

  mapTools = computed(() => 
    this.toolService.tools().filter(tool => tool.category === 'الخرائط والرصد الجغرافي')
  );

  setTab(tab: MapTab) {
    this.activeTab.set(tab);
  }

  handleToolToggle(toolId: string) {
    this.toolService.toggleToolStatus(toolId);
  }

  handleToggleFavorite(toolId:string) {
    this.toolService.toggleFavoriteStatus(toolId);
  }
}
