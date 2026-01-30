import { Component, ChangeDetectionStrategy, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../services/navigation.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-nav-rail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-rail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavRailComponent {
  activePage = input.required<string>();
  navigate = output<string>();

  navigationService = inject(NavigationService);
  userService = inject(UserService);

  navLinks = this.navigationService.navRailLinks;
  
  roleSpecificHome = computed(() => {
     const role = this.userService.currentUser()?.role;
     if (!role) return 'dashboard';
     switch(role) {
       case 'investigative-journalist': return 'workspace';
       case 'editor-in-chief': return 'editorial';
       case 'super-admin': return 'command-center';
       default: return 'dashboard';
     }
  });

  onNavigate(pageKey: string) {
    if (pageKey === 'role-home') {
      this.navigate.emit(this.roleSpecificHome());
    } else {
      this.navigate.emit(pageKey);
    }
  }

  isLinkActive(key: string): boolean {
    if (key === 'role-home') {
      return this.activePage() === this.roleSpecificHome();
    }
    return this.activePage() === key;
  }
}
