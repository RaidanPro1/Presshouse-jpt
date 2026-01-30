
import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manifesto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manifesto.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManifestoComponent {
  login = output<void>();
  navigate = output<string>();

  onLogin() {
    this.login.emit();
  }
  
  onNavigate(page: string) {
    this.navigate.emit(page);
  }
}