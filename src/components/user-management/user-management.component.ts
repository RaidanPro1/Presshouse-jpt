import { Component, ChangeDetectionStrategy, signal, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { User, UserRole, UserStatus, ROLES, getRoleDisplayName, UserService } from '../../services/user.service';
import { ConfirmationService } from '../../services/confirmation.service';
import { LoggerService } from '../../services/logger.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementComponent {
  private confirmationService = inject(ConfirmationService);
  private userService = inject(UserService);
  private logger = inject(LoggerService);
  navigate = output<string>();

  users = signal<User[]>([
    { id: 1, name: 'مستخدم الجذر', email: 'root@ph-ye.org', role: 'super-admin', avatar: 'assets/team/mohammed-alharibi.jpg', status: 'active', joinedDate: '2024-01-01' },
  ]);

  private roles: UserRole[] = ROLES;
  statuses: UserStatus[] = ['active', 'suspended'];
  
  isModalOpen = signal(false);
  isEditMode = signal(false);
  selectedUser = signal<User | null>(null);

  // Search and Pagination
  searchTerm = signal('');
  currentPage = signal(1);
  itemsPerPage = 5;

  // Filter available roles based on current user's role
  assignableRoles = computed(() => {
    const currentUserRole = this.userService.currentUser()?.role;
    if (currentUserRole === 'super-admin') return this.roles;
    // Add more logic here if other roles can manage users
    return [];
  });

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return this.users();
    }
    return this.users().filter(user => 
      user.name.toLowerCase().includes(term) || 
      user.email.toLowerCase().includes(term)
    );
  });

  totalPages = computed(() => Math.ceil(this.filteredUsers().length / this.itemsPerPage));

  paginatedUsers = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredUsers().slice(startIndex, startIndex + this.itemsPerPage);
  });
  
  // Use the centralized role display name function
  getRoleDisplayName = getRoleDisplayName;

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1); // Reset to first page on new search
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  openAddModal() {
    this.isEditMode.set(false);
    this.selectedUser.set({ 
      id: Date.now(), 
      name: '', 
      email: '',
      role: 'investigative-journalist', 
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0]
    });
    this.isModalOpen.set(true);
  }

  openEditModal(user: User) {
    this.isEditMode.set(true);
    this.selectedUser.set({ ...user }); // Create a copy for editing
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedUser.set(null);
  }

  async saveUser(user: User | null) {
    if (!user || !user.name || !user.email) return;
    const adminUser = this.userService.currentUser();

    if (this.isEditMode()) {
      const originalUser = this.users().find(u => u.id === user.id);
      if (originalUser && originalUser.role !== user.role) {
        const confirmed = await this.confirmationService.confirm(
          'تغيير دور المستخدم',
          `هل أنت متأكد من تغيير دور المستخدم "${user.name}" من "${getRoleDisplayName(originalUser.role)}" إلى "${getRoleDisplayName(user.role)}"?`
        );
        if (!confirmed) return;
        
        this.logger.logEvent(
          'تحديث صلاحيات مستخدم',
          `تم تغيير دور المستخدم "${user.name}" من "${getRoleDisplayName(originalUser.role)}" إلى "${getRoleDisplayName(user.role)}".`,
          adminUser?.name,
          adminUser?.role === 'super-admin'
        );
      }
      // Update existing user
      this.users.update(users => users.map(u => u.id === user.id ? user : u));
    } else {
      // Add new user
      this.users.update(users => [user, ...users]);
      this.logger.logEvent(
          'إضافة مستخدم جديد',
          `تم إنشاء حساب جديد للمستخدم "${user.name}" بدور "${getRoleDisplayName(user.role)}".`,
          adminUser?.name,
          adminUser?.role === 'super-admin'
      );
    }
    this.closeModal();
  }

  async deleteUser(userId: number) {
    const user = this.users().find(u => u.id === userId);
    if (!user) return;

    const title = 'حذف مستخدم';
    const message = `هل أنت متأكد من رغبتك في حذف المستخدم "${user.name}"؟ لا يمكن التراجع عن هذا الإجراء.`;

    const confirmed = await this.confirmationService.confirm(title, message);
    
    if (confirmed) {
      this.users.update(users => users.filter(u => u.id !== userId));
      const adminUser = this.userService.currentUser();
      this.logger.logEvent(
          'حذف مستخدم',
          `تم حذف حساب المستخدم "${user.name}".`,
          adminUser?.name,
          adminUser?.role === 'super-admin'
      );
    }
  }

  viewProfile(userId: number) {
    // In a real app, you might navigate to a route like /profile/userId
    // For this simulation, we'll just navigate to the generic profile page.
    this.navigate.emit('profile');
  }
}