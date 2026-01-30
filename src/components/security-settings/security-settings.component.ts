import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from '../../services/confirmation.service';
import { LoggerService } from '../../services/logger.service';
import { UserService } from '../../services/user.service';

interface TrustedDevice {
  id: number;
  browser: string;
  os: string;
  location: string;
  lastLogin: string;
  isCurrent: boolean;
}

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, NgOptimizedImage],
  templateUrl: './security-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecuritySettingsComponent {
  private confirmationService = inject(ConfirmationService);
  private logger = inject(LoggerService);
  private userService = inject(UserService);

  // --- 2FA State ---
  is2faEnabled = signal(false);
  show2faSetup = signal(false);
  verificationCode = signal('');
  recoveryCodes = signal(['abcd-1234', 'efgh-5678', 'ijkl-9012']);

  // --- Trusted Devices State ---
  trustedDevices = signal<TrustedDevice[]>([
    { id: 1, browser: 'Chrome', os: 'Windows', location: 'Sana\'a, YE', lastLogin: 'الآن', isCurrent: true },
    { id: 2, browser: 'Safari', os: 'macOS', location: 'Aden, YE', lastLogin: 'منذ 3 أيام', isCurrent: false },
    { id: 3, browser: 'Chrome', os: 'Android', location: 'Taiz, YE', lastLogin: 'منذ أسبوع', isCurrent: false },
  ]);
  
  // --- Password Change State ---
  passwordData = signal({ current: '', new: '', confirm: '' });
  passwordChangeStatus = signal<'idle' | 'success' | 'error'>('idle');

  toggle2fa() {
    if (this.is2faEnabled()) {
      // Logic to disable 2FA
      this.is2faEnabled.set(false);
      this.show2faSetup.set(false);
    } else {
      // Start the setup process
      this.show2faSetup.set(true);
    }
  }

  verify2fa() {
    // In a real app, you'd verify the code against a backend service
    if (this.verificationCode() === '123456') { // Simulate correct code
      this.is2faEnabled.set(true);
      this.show2faSetup.set(false);
      this.verificationCode.set('');
      this.logger.logEvent('تفعيل المصادقة الثنائية', 'تم تفعيل 2FA بنجاح.', this.userService.currentUser()?.name);
    } else {
      alert('رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.');
    }
  }

  cancel2faSetup() {
    this.show2faSetup.set(false);
    this.verificationCode.set('');
  }

  async revokeDevice(deviceId: number) {
    const device = this.trustedDevices().find(d => d.id === deviceId);
    if (!device) return;

    const confirmed = await this.confirmationService.confirm(
      'إلغاء وثوقية الجهاز',
      `هل أنت متأكد من رغبتك في إلغاء وثوقية هذا الجهاز (${device.browser} on ${device.os})؟ سيتم تسجيل الخروج منه فوراً.`
    );

    if (confirmed) {
      this.trustedDevices.update(devices => devices.filter(d => d.id !== deviceId));
      this.logger.logEvent('إلغاء وثوقية جهاز', `تم إلغاء وثوقية الجهاز: ${device.browser} on ${device.os}`, this.userService.currentUser()?.name);
    }
  }

  changePassword() {
    const passwords = this.passwordData();
    if (passwords.new !== passwords.confirm || !passwords.new) {
        this.passwordChangeStatus.set('error');
        return;
    }
    // Simulate backend call
    this.passwordChangeStatus.set('success');
    this.logger.logEvent('تغيير كلمة المرور', 'تم تغيير كلمة المرور بنجاح.', this.userService.currentUser()?.name);
    
    // Reset form after a delay
    setTimeout(() => {
        this.passwordChangeStatus.set('idle');
        this.passwordData.set({ current: '', new: '', confirm: '' });
    }, 3000);
  }
}
