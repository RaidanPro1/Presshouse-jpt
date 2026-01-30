import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tool } from '../../models/tool.model';
import { UserRole } from '../../services/user.service';

@Component({
  selector: 'app-tool-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tool-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolCardComponent {
  tool = input.required<Tool>();
  userRole = input.required<UserRole | undefined>();
  mode = input<'guest' | 'user'>('user');

  toggleStatus = output<string>();
  toggleFavorite = output<string>();
  trialClick = output<void>();
  runTool = output<Tool>();
  viewDetails = output<Tool>();
  
  isRunning = signal(false);

  onToggle(event: Event) {
    event.stopPropagation();
    this.toggleStatus.emit(this.tool().id);
  }

  onToggleFavorite(event: Event) {
    event.stopPropagation();
    if (this.mode() === 'guest') return;
    this.toggleFavorite.emit(this.tool().id);
  }
  
  onTrialClick(event: Event) {
    event.stopPropagation();
    this.trialClick.emit();
  }

  onRunTool(event: Event) {
    event.stopPropagation();
    if (this.tool().isActive) {
      this.isRunning.set(true);
      this.runTool.emit(this.tool());
      setTimeout(() => this.isRunning.set(false), 500); // Reset after animation
    }
  }

  onViewDetails() {
    this.viewDetails.emit(this.tool());
  }
}
