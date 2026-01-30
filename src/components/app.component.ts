
import { Component, ChangeDetectionStrategy, signal, effect, Renderer2, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

// FIX: Corrected import paths for components from './components/*' to './*'
import { HeaderComponent } from './header/header.component';
import { PlaceholderComponent } from './placeholder/placeholder.component';
import { HomeComponent } from './home/home.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { RegisterComponent } from './register/register.component';
import { FooterComponent } from './footer/footer.component';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { CookiePolicyComponent } from './cookie-policy/cookie-policy.component';
import { DisclaimerComponent } from './disclaimer/disclaimer.component';

// New Dashboard
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';

// Role-based components
import { JournalistWorkspaceComponent } from './journalist-workspace/journalist-workspace.component';
import { EditorialHubComponent } from './editorial-hub/editorial-hub.component';
import { CommandCenterComponent } from './command-center/command-center.component';
import { AiCoreComponent } from './ai-core/ai-core.component';
import { CollaborationComponent } from './collaboration/collaboration.component';
import { AdminComponent } from './admin/admin.component';
import { IndilabComponent } from './indilab/indilab.component';
import { MapsComponent } from './maps/maps.component';
import { ArchivingComponent } from './archiving/archiving.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { DocumentationComponent } from './documentation/documentation.component';
import { SettingsComponent } from './settings/settings.component';
import { AutomationComponent } from './automation/automation.component';
import { ProfileComponent } from './profile/profile.component';
import { SystemInternalsComponent } from './system-internals/system-internals.component';
import { CrmComponent } from './crm/crm.component';
import { SocialMediaAnalysisComponent } from './social-media-analysis/social-media-analysis.component';
import { ProjectManagementPortalComponent } from './project-management-portal/project-management-portal.component';
import { ViolationsObservatoryComponent } from './violations-observatory/violations-observatory.component';
import { TrainingPortalComponent } from './training-portal/training-portal.component';
import { TechSupportPortalComponent } from './tech-support-portal/tech-support-portal.component';
import { NewsroomComponent } from './newsroom/newsroom.component';
import { GeminiCodeAssistComponent } from './gemini-code-assist/gemini-code-assist.component';
import { WebrtcCallComponent } from './webrtc-call/webrtc-call.component';
import { ForensicLabComponent } from './forensic-lab/forensic-lab.component';
import { ErpComponent } from './erp/erp.component';
import { PublicDefenderComponent } from './public-defender/public-defender.component';
import { DastoorMeterComponent } from './dastoor-meter/dastoor-meter.component';

// New public portal pages
import { ViolationsObservatoryPublicComponent } from './violations-observatory-public/violations-observatory-public.component';
import { TrainingPortalPublicComponent } from './training-portal-public/training-portal-public.component';
import { TechSupportPublicComponent } from './tech-support-public/tech-support-public.component';
import { NewsPublicComponent } from './news-public/news-public.component';
import { ProjectsPublicComponent } from './projects-public/projects-public.component';
import { LoginModalComponent } from './login-modal/login-modal.component';
import { PlatformOverviewComponent } from './platform-overview/platform-overview.component';

// New Admin components
import { ThemeManagementComponent } from './theme-management/theme-management.component';
import { NewsletterManagementComponent } from './newsletter-management/newsletter-management.component';
import { AiManagementComponent } from './ai-management/ai-management.component';
import { EmailManagementComponent } from './email-management/email-management.component';
import { AuditLogComponent } from './audit-log/audit-log.component';
import { HaqiqaManagementComponent } from './haqiqa-management/haqiqa-management.component';

// FIX: Corrected import paths for services from './services/*' to '../services/*'
import { UserService, UserRole } from '../services/user.service';
import { SeoService } from '../services/seo.service';
import { SettingsService } from '../services/settings.service';
import { LoggerService } from '../services/logger.service';
import { TrialService } from '../services/trial.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
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
    DocumentationComponent,
    SettingsComponent,
    AutomationComponent,
    ProfileComponent,
    SystemInternalsComponent,
    CrmComponent,
    SocialMediaAnalysisComponent,
    ProjectManagementPortalComponent,
    ViolationsObservatoryComponent,
    TrainingPortalComponent,
    TechSupportPortalComponent,
    NewsroomComponent,
    GeminiCodeAssistComponent,
    WebrtcCallComponent,
    ForensicLabComponent,
    ErpComponent,
    PublicDefenderComponent,
    DastoorMeterComponent,
    // New Public Portal Pages
    ViolationsObservatoryPublicComponent,
    TrainingPortalPublicComponent,
    TechSupportPublicComponent,
    NewsPublicComponent,
    ProjectsPublicComponent,
    LoginModalComponent,
    PlatformOverviewComponent,
    // Newly added admin components
    ThemeManagementComponent,
    NewsletterManagementComponent,
    AiManagementComponent,
    EmailManagementComponent,
    AuditLogComponent,
    HaqiqaManagementComponent,
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
