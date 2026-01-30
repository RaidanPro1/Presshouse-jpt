import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

interface SocialLink {
  platform: 'twitter' | 'facebook' | 'linkedin';
  url: string;
}

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  link: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private userService = inject(UserService);

  // Signals for user data and UI state
  user = this.userService.currentUser;
  isEditMode = signal(false);
  
  // Local editable signals, initialized from user data
  name = signal(this.user()?.name ?? '');
  bio = signal('صحفي استقصائي متخصص في الشؤون اليمنية. أعمل على كشف الحقائق وتوثيق الأحداث لخدمة الجمهور.');
  
  socialLinks = signal<SocialLink[]>([
    { platform: 'twitter', url: 'https://twitter.com/exampleuser' },
    { platform: 'linkedin', url: 'https://linkedin.com/in/exampleuser' }
  ]);
  
  portfolioItems = signal<PortfolioItem[]>([
    { id: 1, title: 'تحقيق: شبكات التهريب عبر السواحل', description: 'تحقيق استمر 6 أشهر لكشف شبكات تهريب الأسلحة والوقود.', link: '#' },
    { id: 2, title: 'تحليل: تأثير انقطاع الإنترنت على التعليم', description: 'تحليل بيانات ورصد ميداني لتأثير الحرب على البنية التحتية الرقمية.', link: '#' }
  ]);
  
  saveStatus = signal<'idle' | 'saving' | 'saved'>('idle');

  toggleEditMode() {
    if (this.isEditMode()) {
      // If was in edit mode, cancel changes
      this.name.set(this.user()?.name ?? '');
      // In a real app, you'd reset other fields too.
    }
    this.isEditMode.update(v => !v);
  }

  saveProfile() {
    this.saveStatus.set('saving');
    
    // In a real app, you would send this data to a backend service.
    // For now, we simulate saving and update the main user service.
    setTimeout(() => {
      const currentUser = this.user();
      if (currentUser) {
        this.userService.currentUser.set({
          ...currentUser,
          name: this.name(),
        });
      }
      this.saveStatus.set('saved');
      this.isEditMode.set(false);
      setTimeout(() => this.saveStatus.set('idle'), 2000);
    }, 1000);
  }

  addPortfolioItem() {
    this.portfolioItems.update(items => [
      ...items,
      { id: Date.now(), title: 'عنوان جديد', description: 'وصف قصير', link: '#' }
    ]);
  }

  removePortfolioItem(id: number) {
    this.portfolioItems.update(items => items.filter(item => item.id !== id));
  }
}
