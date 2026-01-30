import { Component, ChangeDetectionStrategy, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingComponent {
  currentStep = signal(1);
  
  finish = output<void>();

  nextStep() {
    this.currentStep.update(step => step + 1);
  }

  prevStep() {
    this.currentStep.update(step => step - 1);
  }

  finishOnboarding() {
    localStorage.setItem('onboardingComplete', 'true');
    this.finish.emit();
  }
}
