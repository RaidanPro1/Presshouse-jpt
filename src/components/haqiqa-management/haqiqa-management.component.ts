import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-haqiqa-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './haqiqa-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HaqiqaManagementComponent {
  settingsService = inject(SettingsService);
  userService = inject(UserService);

  // Example for spiderfoot toggle
  isSpiderFootEnabled = signal(true);
}
