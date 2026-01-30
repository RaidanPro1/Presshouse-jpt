import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tool } from '../../models/tool.model';
import { UserRole } from '../../services/user.service';

@Component({
  selector: 'app-tool-card-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tool-card-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolCardListComponent {
  tool = input.required<Tool>();
  userRole = input.required<UserRole>();
  mode = input<'guest' | 'user'>('user');

  toggleStatus = output<string>();
  toggleFavorite = output<string>();
  runTool = output<Tool>();
  viewDetails = output<Tool>();

  onToggle(event: Event) {
    event.stopPropagation();
    this.toggleStatus.emit(this.tool().id);
  }

  onToggleFavorite(event: Event) {
    event.stopPropagation();
    if (this.mode() === 'guest') return;
    this.toggleFavorite.emit(this.tool().id);
  }

  onRunTool(event: Event) {
    event.stopPropagation();
    if (this.tool().isActive) {
      this.runTool.emit(this.tool());
    }
  }

  onViewDetails() {
    this.viewDetails.emit(this.tool());
  }
}
