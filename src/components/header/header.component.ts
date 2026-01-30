import { Component, ChangeDetectionStrategy, inject, output, input, signal, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { SearchService } from '../../services/search.service';
import { User, UserRole, getRoleDisplayName } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { SettingsService } from '../../services/settings.service';

interface PortalLink {
  key: string;
  name: string;
  icon: string;
  allowedRoles: UserRole[];
}

interface PublicNavLink {
  key: string;
  name: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnDestroy {
  searchService = inject(SearchService);
  notificationService = inject(NotificationService);
  settingsService = inject(SettingsService);
  
  isAuthenticated = input.required<boolean>();
  user = input<User | null>();

  toggleSidebar = output<void>();
  logout = output<void>();
  login = output<void>();
  navigate = output<string>();

  isDropdownOpen = signal(false);
  isNotificationDropdownOpen = signal(false);
  isPortalDropdownOpen = signal(false);

  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription;
  
  portalLinks: PortalLink[] = [
    { key: 'project-management', name: 'إدارة المشاريع', icon: 'briefcase', allowedRoles: ['editor-in-chief', 'super-admin'] },
    { key: 'violations-observatory', name: 'مرصد الانتهاكات', icon: 'shield-exclamation', allowedRoles: ['investigative-journalist', 'editor-in-chief'] },
  ];

  publicNavLinks: PublicNavLink[] = [
    { key: 'home', name: 'الرئيسية' },
    { key: 'about', name: 'من نحن' },
    { key: 'platform-overview', name: 'عن المنصة' },
    { key: 'manifesto', name: 'المبادئ' },
    { key: 'news-public', name: 'الأخبار' },
    { key: 'violations-observatory-public', name: 'مرصد الانتهاكات' },
  ];

  // Use the centralized role display name function
  getRoleDisplayName = getRoleDisplayName;

  constructor() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300), // wait 300ms after the last keystroke before emitting
      distinctUntilChanged() // only emit if the value has changed
    ).subscribe(searchTerm => {
      this.searchService.searchTerm.set(searchTerm);
    });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  isRoleSufficient(allowedRoles: UserRole[]): boolean {
    const currentRole = this.user()?.role;
    if (!currentRole) return false;
    return allowedRoles.includes(currentRole);
  }

  handleSearch(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchSubject.next(inputElement.value);
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  onLogout() {
    this.logout.emit();
    this.isDropdownOpen.set(false);
  }

  onLogin() {
    this.login.emit();
  }

  onNavigate(page: string) {
    this.closeDropdown();
    this.closeNotificationDropdown();
    this.closePortalDropdown();
    this.navigate.emit(page);
  }

  toggleDropdown() {
    this.isDropdownOpen.update(value => !value);
    if (this.isDropdownOpen()) {
      this.isNotificationDropdownOpen.set(false);
      this.isPortalDropdownOpen.set(false);
    }
  }

  closeDropdown() {
    this.isDropdownOpen.set(false);
  }
  
  toggleNotificationDropdown() {
    this.isNotificationDropdownOpen.update(value => !value);
    if (this.isNotificationDropdownOpen()) {
      this.isDropdownOpen.set(false);
      this.isPortalDropdownOpen.set(false);
    }
  }

  closeNotificationDropdown() {
    this.isNotificationDropdownOpen.set(false);
  }

  togglePortalDropdown() {
    this.isPortalDropdownOpen.update(value => !value);
    if (this.isPortalDropdownOpen()) {
      this.isDropdownOpen.set(false);
      this.isNotificationDropdownOpen.set(false);
    }
  }

  closePortalDropdown() {
    this.isPortalDropdownOpen.set(false);
  }

  markAllNotificationsAsRead() {
    this.notificationService.markAllAsRead();
  }

  toggleLowBandwidthMode() {
    this.settingsService.isLowBandwidthMode.update(v => !v);
  }

  timeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `قبل ${Math.floor(interval)} سنة`;
    interval = seconds / 2592000;
    if (interval > 1) return `قبل ${Math.floor(interval)} شهر`;
    interval = seconds / 86400;
    if (interval > 1) return `قبل ${Math.floor(interval)} يوم`;
    interval = seconds / 3600;
    if (interval > 1) return `قبل ${Math.floor(interval)} ساعة`;
    interval = seconds / 60;
    if (interval > 1) return `قبل ${Math.floor(interval)} دقيقة`;
    return 'الآن';
  }
}
