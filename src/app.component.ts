


import { Component, ChangeDetectionStrategy, signal, effect, Renderer2, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

// FIX: Corrected import paths for components to match the actual file structure.
import { HeaderComponent } from './components/header/header.component';
import { PlaceholderComponent } from './components/placeholder/placeholder.component';
import { HomeComponent } from './components/home/home.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { RegisterComponent } from './components/register/register.component';
import { FooterComponent } from './components/footer/footer.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { TermsOfServiceComponent } from './components/terms-of-service/terms-of-service.component';
import { CookiePolicyComponent } from './components/cookie-policy/cookie-policy.component';
import { DisclaimerComponent } from './components/disclaimer/disclaimer.component';

// New Dashboard
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DashboardLayoutComponent } from './components/dashboard-layout/dashboard-layout.component';

// Role-based components
import { JournalistWorkspaceComponent } from './components/journalist-workspace/journalist-workspace.component';
import { EditorialHubComponent } from './components/editorial-hub/editorial-hub.component';
import { CommandCenterComponent } from './components/command-center/command-center.component';
import { AiCoreComponent } from './components/ai-core/ai-core.component';
import { CollaborationComponent } from './components/collaboration/collaboration.component';
import { AdminComponent } from './components/admin/admin.component';
import { IndilabComponent } from './components/indilab/indilab.component';
import { MapsComponent } from './components/maps/maps.component';
import { ArchivingComponent } from './components/archiving/archiving.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AutomationComponent } from './components/automation/automation.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SystemInternalsComponent } from './components/system-internals/system-internals.component';
import { CrmComponent } from './components/crm/crm.component';
import { SocialMediaAnalysisComponent } from './components/social-media-analysis/social-media-analysis.component';
import { ProjectManagementPortalComponent } from './components/project-management-portal/project-management-portal.component';
import { ViolationsObservatoryComponent } from './components/violations-observatory/violations-observatory.component';
import { NewsroomComponent } from './components/newsroom/newsroom.component';
import { GeminiCodeAssistComponent } from './components/gemini-code-assist/gemini-code-assist.component';
import { WebrtcCallComponent } from './components/webrtc-call/webrtc-call.component';
import { ForensicLabComponent } from './components/forensic-lab/forensic-lab.component';
import { ErpComponent } from './components/erp/erp.component';
import { DastoorMeterComponent } from './components/dastoor-meter/dastoor-meter.component';

// New public portal pages
import { ViolationsObservatoryPublicComponent } from './components/violations-observatory-public/violations-observatory-public.component';
import { NewsPublicComponent } from './components/news-public/news-public.component';
import { ProjectsPublicComponent } from './components/projects-public/projects-public.component';
import { LoginModalComponent } from './components/login-modal/login-modal.component';
import { PlatformOverviewComponent } from './components/platform-overview/platform-overview.component';
import { ManifestoComponent } from './components/manifesto/manifesto.component';

// New Admin components
import { ThemeManagementComponent } from './components/theme-management/theme-management.component';
import { NewsletterManagementComponent } from './components/newsletter-management/newsletter-management.component';
import { AiManagementComponent } from './components/ai-management/ai-management.component';
import { EmailManagementComponent } from './components/email-management/email-management.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { HaqiqaManagementComponent } from './components/haqiqa-management/haqiqa-management.component';
import { DashboardCustomizationComponent } from './components/dashboard-customization/dashboard-customization.component';
import { SecuritySettingsComponent } from './components/security-settings/security-settings.component';

// Services are correctly imported from ./services relative to src/app.component.ts
import { UserService, UserRole } from './services/user.service';
import { SeoService } from './services/seo.service';
import { SettingsService } from './services/settings.service';
import { LoggerService } from './services/logger.service';
import { TrialService } from './services/trial.service';


@Component({
  selector: 'app-root',
  templateUrl: 'src/app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule, 
    HeaderComponent, 
    PlaceholderComponent,
    HomeComponent,
    AboutUsComponent,
    PrivacyPolicyComponent,
    RegisterComponent,
    FooterComponent,
    OnboardingComponent,
    ConfirmationModalComponent,
    TermsOfServiceComponent,
    CookiePolicyComponent,
    DisclaimerComponent,
    // New Dashboard Layout
    DashboardLayoutComponent,
    // New Dashboard
    DashboardComponent,
    // Role Dashboards
    JournalistWorkspaceComponent,
    EditorialHubComponent,
    CommandCenterComponent,
    // Other Pages
    AiCoreComponent,
    CollaborationComponent,
    AdminComponent,
    IndilabComponent,
    MapsComponent,
    ArchivingComponent,
    UserManagementComponent,
    SettingsComponent,
    AutomationComponent,
    ProfileComponent,
    SystemInternalsComponent,
    CrmComponent,
    SocialMediaAnalysisComponent,
    ProjectManagementPortalComponent,
    ViolationsObservatoryComponent,
    NewsroomComponent,
    GeminiCodeAssistComponent,
    WebrtcCallComponent,
    ForensicLabComponent,
    ErpComponent,
    DastoorMeterComponent,
    // New public portal pages
    ViolationsObservatoryPublicComponent,
    NewsPublicComponent,
    ProjectsPublicComponent,
    LoginModalComponent,
    PlatformOverviewComponent,
    ManifestoComponent,
    // Newly added admin components
    ThemeManagementComponent,
    NewsletterManagementComponent,
    AiManagementComponent,
    EmailManagementComponent,
    AuditLogComponent,
    HaqiqaManagementComponent,
    DashboardCustomizationComponent,
    SecuritySettingsComponent,
  ],
})
export class AppComponent {
  private seoService = inject(SeoService);
  private settingsService = inject(SettingsService);
  private loggerService = inject(LoggerService);
  userService = inject(UserService);
  trialService = inject(TrialService);

  currentPage = signal<string>('home'); // Default to home page
  showOnboarding = signal<boolean>(false);
  
  showGeminiAssist = signal(false);

  constructor() {
    // Effect to update SEO tags when they change in the service
    effect(() => {
      this.seoService.updateTitle(this.seoService.pageTitle());
      this.seoService.updateMetaTag('description', this.seoService.metaDescription());
      this.seoService.updateMetaTag('keywords', this.seoService.metaKeywords());
    });
    
    // Dark mode has been disabled by user request.

    // Global Error Handling for unhandled promises
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      
      const user = this.userService.currentUser();
      const userName = user?.name ?? 'Anonymous';
      const isRoot = user?.role === 'super-admin';
      
      let errorDetails = 'An unknown error occurred in a promise.';
      if (event.reason instanceof Error) {
        errorDetails = `${event.reason.message}\n${event.reason.stack}`;
      } else if (typeof event.reason === 'string') {
        errorDetails = event.reason;
      } else {
        try {
          errorDetails = JSON.stringify(event.reason);
        } catch {
          errorDetails = 'Could not stringify the promise rejection reason.';
        }
      }
      
      this.loggerService.logEvent(
        'Global Error: Unhandled Promise Rejection',
        errorDetails,
        userName,
        isRoot
      );
    });
  }
  
  private getDefaultPageForRole(role: UserRole | undefined): string {
    // Post-login, all users are directed to the main dashboard.
    // The concept of a role-specific default page is now handled by the NavRail component.
    return 'dashboard';
  }

  handleNavigation(pageKey: string) {
     if (pageKey === 'dashboard_redirect') {
      this.currentPage.set(this.getDefaultPageForRole(this.userService.currentUser()?.role));
      return;
    }
    
    if (this.userService.isAuthenticated() && !this.userService.hasPermission(pageKey)) {
        console.warn(`Access denied for role "${this.userService.currentUser()?.role}" to page "${pageKey}"`);
        this.currentPage.set(this.getDefaultPageForRole(this.userService.currentUser()?.role));
        return;
    }
    this.currentPage.set(pageKey);
  }
  
  toggleGeminiAssist() {
    this.showGeminiAssist.update(v => !v);
  }

  handleLogin() {
    this.trialService.closeModal();
    this.userService.login('investigative-journalist');
    this.currentPage.set(this.getDefaultPageForRole('investigative-journalist'));

    // Onboarding logic
    const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
    if (!onboardingComplete && this.settingsService.isOnboardingEnabled()) {
      this.showOnboarding.set(true);
    }
  }

  switchUser(role: UserRole) {
    this.userService.login(role);
    this.currentPage.set(this.getDefaultPageForRole(role));
  }
  
  handleRegister() {
    this.userService.login('investigative-journalist'); 
    this.currentPage.set(this.getDefaultPageForRole('investigative-journalist'));
  }

  handleLogout() {
    this.userService.logout();
    this.currentPage.set('home'); // Go to home page on logout
  }

  handleFinishOnboarding() {
    this.showOnboarding.set(false);
  }
}