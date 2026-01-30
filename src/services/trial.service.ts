import { Injectable, signal, computed } from '@angular/core';

const TRIAL_LIMIT = 3;

@Injectable({
  providedIn: 'root',
})
export class TrialService {
  trialClicks = signal(0);
  showLoginModal = signal(false);
  
  remainingClicks = computed(() => TRIAL_LIMIT - this.trialClicks());
  isTrialOver = computed(() => this.trialClicks() >= TRIAL_LIMIT);

  recordInteraction() {
    if (!this.isTrialOver()) {
      this.trialClicks.update(c => c + 1);
    }
    
    if (this.isTrialOver()) {
      this.showLoginModal.set(true);
    }
  }

  closeModal() {
    this.showLoginModal.set(false);
  }
}
