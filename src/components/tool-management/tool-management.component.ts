import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToolService } from '../../services/tool.service';
import { Tool } from '../../models/tool.model';
import { UserRole, ROLES, getRoleDisplayName } from '../../services/user.service';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-tool-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tool-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolManagementComponent {
  private toolService = inject(ToolService);
  private confirmationService = inject(ConfirmationService);
  
  allTools = this.toolService.tools;
  
  roles: UserRole[] = ROLES;

  isToolModalOpen = signal(false);
  selectedToolForEdit = signal<Tool | null>(null);

  // Use the centralized role display name function
  getRoleDisplayName = getRoleDisplayName;

  isRoleAllowed(tool: Tool, role: UserRole): boolean {
    return tool.allowedRoles.includes(role);
  }

  onToggleAllowedRole(tool: Tool, role: UserRole) {
    const currentRoles = tool.allowedRoles;
    let newRoles: UserRole[];

    if (currentRoles.includes(role)) {
      // Prevent removing the last role or the admin role if it's the only one left for management
      if (currentRoles.length === 1) return; 
      newRoles = currentRoles.filter(r => r !== role);
    } else {
      newRoles = [...currentRoles, role];
    }
    
    this.toolService.updateTool(tool.id, { allowedRoles: newRoles });
  }

  async onToggleIsActive(tool: Tool) {
    const action = tool.isActive ? 'تعطيل' : 'تفعيل';
    const title = `${action} أداة`;
    const message = `هل أنت متأكد من رغبتك في ${action} أداة "${tool.name}"؟ سيؤثر هذا على وصول المستخدمين إليها.`;
    
    const confirmed = await this.confirmationService.confirm(title, message);

    if (confirmed) {
      this.toolService.updateTool(tool.id, { isActive: !tool.isActive });
    }
  }

  onToggleIsPublic(tool: Tool) {
    this.toolService.updateTool(tool.id, { isVisiblePublicly: !tool.isVisiblePublicly });
  }

  // --- Modal Methods ---
  openToolEditModal(tool: Tool) {
    // Create a deep copy for editing to avoid mutating the original signal value directly
    this.selectedToolForEdit.set(JSON.parse(JSON.stringify(tool)));
    this.isToolModalOpen.set(true);
  }

  closeToolEditModal() {
    this.isToolModalOpen.set(false);
    this.selectedToolForEdit.set(null);
  }

  saveTool() {
    const toolToSave = this.selectedToolForEdit();
    if (toolToSave) {
      // Create a plain object from the signal's value for the update
      const updateData: Partial<Tool> = { 
        name: toolToSave.name,
        description: toolToSave.description,
        iconColor: toolToSave.iconColor,
        iconSvg: toolToSave.iconSvg,
        category: toolToSave.category
      };
      this.toolService.updateTool(toolToSave.id, updateData);
      this.closeToolEditModal();
    }
  }
}
