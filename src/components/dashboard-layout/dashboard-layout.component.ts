
import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderComponent } from '../header/header.component';
import { NavRailComponent } from '../nav-rail/nav-rail.component';
import { FooterComponent } from '../footer/footer.component';
import { PlaceholderComponent } from '../placeholder/placeholder.component';

import { User } from '../../services/user.service';

// Import all possible page components that can be rendered in the main content area
import { DashboardComponent } from '../dashboard/dashboard.component';
import { JournalistWorkspaceComponent } from '../journalist-workspace/journalist-workspace.component';
import { EditorialHubComponent } from '../editorial-hub/editorial-hub.component';
import { CommandCenterComponent } from '../command-center/command-center.component';
import { NewsroomComponent } from '../newsroom/newsroom.component';
import { AiCoreComponent } from '../ai-core/ai-core.component';
import { SocialMediaAnalysisComponent } from '../social-media-analysis/social-media-analysis.component';
import { CollaborationComponent } from '../collaboration/collaboration.component';
import { AdminComponent } from '../admin/admin.component';
import { IndilabComponent } from '../indilab/indilab.component';
import { MapsComponent } from '../maps/maps.component';
import { ArchivingComponent } from '../archiving/archiving.component';
import { UserManagementComponent } from '../user-management/user-management.component';
import { SettingsComponent } from '../settings/settings.component';
import { AutomationComponent } from '../automation/automation.component';
import { ProfileComponent } from '../profile/profile.component';
import { SystemInternalsComponent } from '../system-internals/system-internals.component';
import { CrmComponent } from '../crm/crm.component';
import { ProjectManagementPortalComponent } from '../project-management-portal/project-management-portal.component';
import { ViolationsObservatoryComponent } from '../violations-observatory/violations-observatory.component';
import { PrivacyPolicyComponent } from '../privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from '../terms-of-service/terms-of-service.component';
import { CookiePolicyComponent } from '../cookie-policy/cookie-policy.component';
import { DisclaimerComponent } from '../disclaimer/disclaimer.component';
import { InvestigationCanvasComponent } from '../investigation-canvas/investigation-canvas.component';
import { ForensicLabComponent } from '../forensic-lab/forensic-lab.component';
import { ErpComponent } from '../erp/erp.component';
import { DastoorMeterComponent } from '../dastoor-meter/dastoor-meter.component';


@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    NavRailComponent,
    FooterComponent,
    PlaceholderComponent,
    DashboardComponent,
    JournalistWorkspaceComponent,
    EditorialHubComponent,
    CommandCenterComponent,
    NewsroomComponent,
    AiCoreComponent,
    SocialMediaAnalysisComponent,
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
    ProjectManagementPortalComponent,
    ViolationsObservatoryComponent,
    PrivacyPolicyComponent,
    TermsOfServiceComponent,
    CookiePolicyComponent,
    DisclaimerComponent,
    InvestigationCanvasComponent,
    ForensicLabComponent,
    ErpComponent,
    DastoorMeterComponent
  ],
  templateUrl: './dashboard-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLayoutComponent {
  user = input.required<User | null>();
  currentPage = input.required<string>();

  navigate = output<string>();
  logout = output<void>();

  onNavigate(pageKey: string) {
    this.navigate.emit(pageKey);
  }

  onLogout() {
    this.logout.emit();
  }
}
