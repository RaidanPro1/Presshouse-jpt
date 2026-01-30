import { Injectable, signal, inject } from '@angular/core';
import { Tool } from '../models/tool.model';
import { ToolService } from './tool.service';

@Injectable({
  providedIn: 'root',
})
export class ToolStateService {
  private toolService = inject(ToolService);

  openTools = signal<Tool[]>([]);
  activeToolId = signal<string | null>(null);

  runTool(toolId: string) {
    const tool = this.toolService.tools().find(t => t.id === toolId);
    if (!tool) {
      console.error(`Tool with id ${toolId} not found.`);
      return;
    }

    if (!this.openTools().find(t => t.id === tool.id)) {
      this.openTools.update(tools => [...tools, tool]);
    }
    this.activeToolId.set(tool.id);
  }

  selectTab(toolId: string) {
    this.activeToolId.set(toolId);
  }

  closeTab(toolId: string) {
    const index = this.openTools().findIndex(t => t.id === toolId);
    if (index === -1) return;

    // If closing the active tab, select a new one
    if (this.activeToolId() === toolId) {
      const currentOpenTools = this.openTools();
      if (currentOpenTools.length > 1) {
        // New logic to find the new active tool before updating the list
        const remainingTools = currentOpenTools.filter(t => t.id !== toolId);
        const newActiveIndex = index > 0 ? index - 1 : 0;
        this.activeToolId.set(remainingTools[newActiveIndex]?.id ?? null);
      } else {
        this.activeToolId.set(null);
      }
    }
    
    this.openTools.update(tools => tools.filter(t => t.id !== toolId));
  }
}
