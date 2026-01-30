
import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutService, RoleLayout, JOURNALIST_WIDGETS, Widget } from '../../services/dashboard-layout.service';
import { UserRole, ROLES, getRoleDisplayName } from '../../services/user.service';

@Component({
  selector: 'app-dashboard-customization',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-customization.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCustomizationComponent {
  private layoutService = inject(DashboardLayoutService);
  
  // Exclude super-admin as they have a different dashboard (Command Center) and public users.
  customizableRoles: UserRole[] = ROLES.filter(r => r !== 'super-admin' && r !== 'public') as UserRole[];
  selectedRole = signal<UserRole>(this.customizableRoles[0]);
  
  // All possible widgets for the journalist dashboard
  allWidgets: Widget[] = JOURNALIST_WIDGETS;

  currentLayout = signal<RoleLayout>(this.layoutService.getLayout(this.selectedRole()));
  
  visibleWidgets = computed(() => {
    const layout = this.currentLayout();
    return layout.orderedWidgets
      .filter(key => !layout.hiddenWidgets.includes(key))
      .map(key => this.allWidgets.find(w => w.key === key))
      .filter((w): w is Widget => !!w);
  });

  hiddenWidgets = computed(() => {
    const layout = this.currentLayout();
    return this.allWidgets.filter(w => layout.hiddenWidgets.includes(w.key));
  });

  getRoleDisplayName = getRoleDisplayName;
  
  private draggedWidgetKey = signal<string | null>(null);

  constructor() {
    // Effect to update layout when role changes
    effect(() => {
      this.currentLayout.set(this.layoutService.getLayout(this.selectedRole()));
    });
  }
  
  selectRole(event: Event) {
    this.selectedRole.set((event.target as HTMLSelectElement).value as UserRole);
  }

  toggleWidgetVisibility(widgetKey: string, isVisible: boolean) {
    this.currentLayout.update(layout => {
      const newHidden = isVisible 
        ? layout.hiddenWidgets.filter(key => key !== widgetKey)
        : [...layout.hiddenWidgets, widgetKey];
      
      let newOrdered = [...layout.orderedWidgets];
      if (isVisible && !newOrdered.includes(widgetKey)) {
        // if making it visible, add it to the end of the order
        newOrdered.push(widgetKey);
      }
      
      return {
        orderedWidgets: newOrdered,
        hiddenWidgets: newHidden
      };
    });
  }

  saveLayout() {
    this.layoutService.updateLayout(this.selectedRole(), this.currentLayout());
    alert('تم حفظ تخطيط لوحة التحكم!');
  }
  
  // Drag and Drop
  onDragStart(widgetKey: string) {
    this.draggedWidgetKey.set(widgetKey);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, dropTargetKey: string) {
    event.preventDefault();
    const draggedKey = this.draggedWidgetKey();
    if (!draggedKey || draggedKey === dropTargetKey) return;

    this.currentLayout.update(layout => {
      const oldIndex = layout.orderedWidgets.indexOf(draggedKey);
      const newIndex = layout.orderedWidgets.indexOf(dropTargetKey);
      
      const newOrderedWidgets = [...layout.orderedWidgets];
      // remove from old position
      newOrderedWidgets.splice(oldIndex, 1);
      // insert at new position
      newOrderedWidgets.splice(newIndex, 0, draggedKey);
      
      return { ...layout, orderedWidgets: newOrderedWidgets };
    });
    this.draggedWidgetKey.set(null);
  }
  
  onDragEnd() {
    this.draggedWidgetKey.set(null);
  }
}
