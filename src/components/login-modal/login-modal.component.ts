
import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginModalComponent {
  login = output<void>();
  close = output<void>();
  navigate = output<string>();

  onLogin() {
    this.login.emit();
  }

  onClose() {
    this.close.emit();
  }

  onNavigate(page: string) {
    this.navigate.emit(page);
  }
}
