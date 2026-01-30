import { Injectable, signal, inject } from '@angular/core';
import { LoggerService } from './logger.service';

export type UserRole = 'super-admin' | 'editor-in-chief' | 'investigative-journalist' | 'public';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: UserStatus;
  joinedDate: string;
}

// Centralized role definitions
export const ROLES: UserRole[] = ['super-admin', 'editor-in-chief', 'investigative-journalist'];

export const ROLE_DISPLAY_NAMES: { [key in UserRole]: string } = {
  'super-admin': 'مدير عام',
  'editor-in-chief': 'مدير التحرير',
  'investigative-journalist': 'صحفي استقصائي',
  'public': 'زائر'
};

/**
 * Returns the display name for a given user role.
 * @param role The user role key.
 * @returns The Arabic display name for the role.
 */
export function getRoleDisplayName(role: UserRole): string {
  return ROLE_DISPLAY_NAMES[role] || role;
}

const pagePermissions: Record<string, UserRole[]> = {
    'dashboard': ['super-admin', 'editor-in-chief', 'investigative-journalist'],
    'newsroom': ['super-admin', 'editor-in-chief'],
    'ai-core': ['investigative-journalist', 'editor-in-chief', 'super-admin'],
    'social-media': ['investigative-journalist', 'editor-in-chief', 'super-admin'],
    'collaboration': ['investigative-journalist', 'editor-in-chief', 'super-admin'],
    'admin': ['super-admin', 'editor-in-chief'],
    'indilab': ['investigative-journalist', 'editor-in-chief', 'super-admin'],
    'maps': ['investigative-journalist', 'editor-in-chief', 'super-admin'],
    'archiving': ['investigative-journalist', 'editor-in-chief', 'super-admin'],
    'users': ['super-admin'],
    'documentation': ['super-admin', 'editor-in-chief', 'investigative-journalist'],
    'settings': ['super-admin', 'editor-in-chief', 'investigative-journalist'],
    'automation': ['super-admin'],
    'profile': ['super-admin', 'editor-in-chief', 'investigative-journalist'],
    'system-internals': ['super-admin'],
    'crm': ['super-admin'],
    'project-management': ['super-admin', 'editor-in-chief'],
    'violations-observatory': ['investigative-journalist', 'editor-in-chief', 'super-admin'],
    'training': ['investigative-journalist', 'editor-in-chief', 'super-admin'],
    'tech-support': ['super-admin', 'editor-in-chief', 'investigative-journalist'],
};


@Injectable({
  providedIn: 'root',
})
export class UserService {
  private logger = inject(LoggerService);

  isAuthenticated = signal<boolean>(false);
  currentUser = signal<User | null>(null);
  
  // All possible users for simulation
  private users: User[] = [
     { id: 1, name: 'مستخدم الجذر', email: 'root@ph-ye.org', role: 'super-admin', avatar: 'assets/team/mohammed-alharibi.jpg', status: 'active', joinedDate: '2024-01-01' },
  ];

  login(role: UserRole = 'super-admin') {
    const user = this.users.find(u => u.role === role) ?? this.users[0];
    
    this.currentUser.set(user);
    this.isAuthenticated.set(true);

    this.logger.logEvent(
      'تسجيل دخول', 
      `تم تفعيل الجلسة بدور: ${getRoleDisplayName(user.role)}.`, 
      user.name,
      user.role === 'super-admin'
    );
  }

  logout() {
    const loggedOutUser = this.currentUser();
    if (loggedOutUser) {
        this.logger.logEvent(
            'تسجيل خروج',
            `قام المستخدم بتسجيل الخروج.`,
            loggedOutUser.name,
            loggedOutUser.role === 'super-admin'
        );
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }
  
  hasPermission(pageKey: string): boolean {
    const userRole = this.currentUser()?.role;
    if (!userRole) {
      return false; // Not logged in
    }
    const allowedRoles = pagePermissions[pageKey];
    if (!allowedRoles) {
      return true; // Assume public page if not in map
    }
    return allowedRoles.includes(userRole);
  }
}