import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

interface EmailUser {
  id: number;
  name: string;
  email: string;
  aliases: string[];
}

@Component({
  selector: 'app-email-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailManagementComponent {
  smtpConfig = signal<SmtpConfig>({
    host: 'smtp.example.com',
    port: 587,
    user: 'user@example.com',
    pass: '************',
  });

  emailUsers = signal<EmailUser[]>([
    { id: 1, name: 'Raidan Al-Huraibi', email: 'raidan@ph-ye.org', aliases: ['root@ph-ye.org'] },
    { id: 2, name: 'Ahmed Khalid', email: 'ahmed.k@ph-ye.org', aliases: [] },
  ]);

  isUserModalOpen = signal(false);
  selectedUser = signal<EmailUser | null>(null);

  saveSettings() {
    // In a real app, this would securely save to a backend
    console.log('Saving SMTP settings (simulation):', this.smtpConfig());
    alert('تم حفظ إعدادات SMTP (محاكاة).');
  }

  openAddUserModal() {
    this.selectedUser.set({ id: Date.now(), name: '', email: '', aliases: [] });
    this.isUserModalOpen.set(true);
  }

  openEditUserModal(user: EmailUser) {
    this.selectedUser.set({ ...user, aliases: [...user.aliases] }); // Deep copy for editing
    this.isUserModalOpen.set(true);
  }

  saveUser() {
    const user = this.selectedUser();
    if (!user) return;
    
    const existing = this.emailUsers().find(u => u.id === user.id);
    if (existing) {
      this.emailUsers.update(users => users.map(u => u.id === user.id ? user : u));
    } else {
      this.emailUsers.update(users => [...users, user]);
    }
    this.closeUserModal();
  }
  
  removeUser(userId: number) {
    this.emailUsers.update(users => users.filter(u => u.id !== userId));
  }

  closeUserModal() {
    this.isUserModalOpen.set(false);
    this.selectedUser.set(null);
  }

  updateAliases(aliasesString: string) {
    this.selectedUser.update(user => {
        if (!user) return null;
        const newAliases = aliasesString.split(',').map(s => s.trim()).filter(s => s);
        return { ...user, aliases: newAliases };
    });
  }
}