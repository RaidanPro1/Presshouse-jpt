import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService, Theme } from '../../services/theme.service';

@Component({
  selector: 'app-theme-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './theme-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeManagementComponent {
  themeService = inject(ThemeService);
  
  editableTheme = signal<Theme>(this.themeService.theme());
  
  fonts = [
    { name: 'Cairo (Default)', value: "'Cairo', sans-serif" },
    { name: 'Tajawal', value: "'Tajawal', sans-serif" },
    { name: 'IBM Plex Sans Arabic', value: "'IBM Plex Sans Arabic', sans-serif" },
  ];
  
  saveStatus = signal<'idle' | 'saving' | 'saved'>('idle');

  saveTheme() {
    this.saveStatus.set('saving');
    this.themeService.saveTheme(this.editableTheme());
    setTimeout(() => {
      this.saveStatus.set('saved');
      setTimeout(() => this.saveStatus.set('idle'), 2000);
    }, 1000);
  }

  handleLogoUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editableTheme.update(theme => ({ ...theme, logoUrl: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  }

  updatePrimaryColor(color: string) {
    this.editableTheme.update(t => ({...t, primaryColor: color}));
  }

  updateFontFamily(font: string) {
    this.editableTheme.update(t => ({...t, fontFamily: font}));
  }
}
