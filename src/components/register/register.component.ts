import { Component, ChangeDetectionStrategy, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type RegistrationMethod = 'email' | 'social';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  register = output<void>();
  navigate = output<string>();

  step = signal<1 | 2>(1);
  method = signal<RegistrationMethod>('email');

  // Form fields
  name = signal('');
  email = signal('');
  password = signal('');
  phone = signal('');
  whatsapp = signal('');
  agreedToTerms = signal<boolean>(false);
  
  // Dummy social user data
  socialUser = {
    name: 'Ahmed Khalid',
    email: 'ahmed.k@provider.com'
  };

  handleSocialRegister(provider: string) {
    // In a real app, this would trigger the OAuth flow.
    // For this simulation, we'll just move to step 2.
    console.log(`Registering with ${provider}`);
    this.method.set('social');
    this.name.set(this.socialUser.name);
    this.email.set(this.socialUser.email);
    this.step.set(2);
  }

  handleEmailRegister() {
    if (!this.name() || !this.email() || !this.password()) {
      return; // Add proper validation feedback in a real app
    }
    this.method.set('email');
    this.step.set(2);
  }

  completeRegistration() {
    // Here you would send all the data to your backend
    const registrationData = {
      name: this.name(),
      email: this.email(),
      password: this.method() === 'email' ? this.password() : undefined,
      phone: this.phone(),
      whatsapp: this.whatsapp(),
      method: this.method()
    };
    console.log('Completing Registration with data:', registrationData);
    
    // On success, emit the register event
    this.register.emit();
  }
}