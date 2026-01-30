

import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { SystemStatsComponent } from '../system-stats/system-stats.component';
import { ToolManagementComponent } from '../tool-management/tool-management.component';
import { SeoManagementComponent } from '../seo-management/seo-management.component';
import { ApiKeyManagementComponent } from '../api-key-management/api-key-management.component';
import { AiFeedbackManagementComponent } from '../ai-feedback-management/ai-feedback-management.component';
import { SecurityManagementComponent } from '../security-management/security-management.component';
import { AutomationComponent } from '../automation/automation.component';
import { ContentManagementComponent } from '../content-management/content-management.component';
import { SocialBotManagementComponent } from '../social-bot-management/social-bot-management.component';
import { UserService } from '../../services/user.service';
import { ThemeManagementComponent } from '../theme-management/theme-management.component';
import { NewsletterManagementComponent } from '../newsletter-management/newsletter-management.component';

// New Admin Dashboard components
import { AiManagementComponent } from '../ai-management/ai-management.component';
import { EmailManagementComponent } from '../email-management/email-management.component';
import { AuditLogComponent } from '../audit-log/audit-log.component';
import { UserManagementComponent } from '../user-management/user-management.component';
import { HaqiqaManagementComponent } from '../haqiqa-management/haqiqa-management.component';
import { DashboardCustomizationComponent } from '../dashboard-customization/dashboard-customization.component';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SystemStatsComponent,
    ToolManagementComponent,
    SeoManagementComponent,
    ApiKeyManagementComponent,
    AiFeedbackManagementComponent,
    SecurityManagementComponent,
    AutomationComponent,
    ContentManagementComponent,
    SocialBotManagementComponent,
    ThemeManagementComponent,
    NewsletterManagementComponent,
    AiManagementComponent,
    EmailManagementComponent,
    AuditLogComponent,
    UserManagementComponent,
    HaqiqaManagementComponent,
    DashboardCustomizationComponent,
  ],
  templateUrl: './admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {
  settingsService = inject(SettingsService);
  userService = inject(UserService);

  isRoot = computed(() => this.userService.currentUser()?.role === 'super-admin');
  activeTab = signal<'general' | 'users' | 'tools' | 'content' | 'layout' | 'haqiqa' | 'ai-ops' | 'email' | 'logs' | 'security'>('general');

}
