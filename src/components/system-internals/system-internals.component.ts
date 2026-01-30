import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserRole } from '../../services/user.service';

interface Service {
  name: string;
  description: string;
  url: string;
  icon: string;
}

interface ServiceCategory {
  name: string;
  color: string;
  services: Service[];
}

@Component({
  selector: 'app-system-internals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-internals.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemInternalsComponent {
  private userService = inject(UserService);

  isRoot = computed(() => this.userService.currentUser()?.role === 'super-admin');
  isEditMode = signal(false);

  architecture = signal<ServiceCategory[]>([
    {
      name: 'الخدمات الأساسية',
      color: 'indigo',
      services: [
        { name: 'YemenJPT App', description: 'واجهة المستخدم الرئيسية للمنصة', url: 'http://localhost:8080', icon: '💻' },
        { name: 'PostgreSQL DB', description: 'قاعدة البيانات الأساسية للمنصة', url: '', icon: '🗃️' },
        { name: 'Ollama (Local AI)', description: 'محرك الذكاء الاصطناعي المحلي', url: '', icon: '🧠' },
      ],
    },
    {
      name: 'خدمات الإدارة',
      color: 'yellow',
      services: [
        { name: 'Portainer', description: 'إدارة حاويات Docker', url: 'http://localhost:9000', icon: '🐳' },
        { name: 'Glances', description: 'مراقبة أداء الخادم اللحظي', url: 'http://localhost:61208', icon: '📊' },
        { name: 'Uptime Kuma', description: 'مراقبة حالة عمل الخدمات', url: 'http://localhost:3001', icon: '❤️‍🩹' },
      ],
    },
    {
      name: 'أدوات متخصصة',
      color: 'purple',
      services: [
        { name: 'n8n (Automation)', description: 'أتمتة سير العمل', url: 'http://localhost:5678', icon: '🤖' },
        { name: 'Gitea (Code)', description: 'مستودع الكود الخاص', url: 'http://localhost:3002', icon: '📁' },
        { name: 'SearXNG, Spiderfoot, ...etc', description: 'مجموعة أدوات التقصي المفتوح المصدر', url: '', icon: '🔍' },
      ],
    },
  ]);

  // A separate signal to hold edits without affecting the original until saved
  editedArchitecture = signal<ServiceCategory[]>([]);

  toggleEditMode() {
    this.isEditMode.update(v => !v);
    if (this.isEditMode()) {
      // Deep copy the current architecture to the editable version
      this.editedArchitecture.set(JSON.parse(JSON.stringify(this.architecture())));
    }
  }

  saveChanges() {
    // In a real app, this would send an update to a backend.
    // Here, we just simulate by updating the main signal.
    this.architecture.set(this.editedArchitecture());
    this.isEditMode.set(false);
  }

  cancelEdit() {
    this.isEditMode.set(false);
  }
}