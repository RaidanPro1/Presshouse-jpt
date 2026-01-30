
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecuritySettingsComponent } from '../security-settings/security-settings.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, SecuritySettingsComponent],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  // Component logic will go here
}
