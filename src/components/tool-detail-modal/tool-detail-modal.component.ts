import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tool } from '../../models/tool.model';

@Component({
  selector: 'app-tool-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tool-detail-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolDetailModalComponent {
  tool = input.required<Tool>();
  close = output<void>();
  runTool = output<Tool>();

  onClose() {
    this.close.emit();
  }

  onRunTool() {
    if (this.tool().isActive) {
      this.runTool.emit(this.tool());
    }
  }
}
