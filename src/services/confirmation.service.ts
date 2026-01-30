import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  isOpen = signal(false);
  title = signal('');
  message = signal('');
  
  private resolveFn?: (value: boolean) => void;

  confirm(title: string, message: string): Promise<boolean> {
    this.title.set(title);
    this.message.set(message);
    this.isOpen.set(true);

    return new Promise<boolean>((resolve) => {
      this.resolveFn = resolve;
    });
  }

  onConfirm() {
    this.isOpen.set(false);
    if (this.resolveFn) {
      this.resolveFn(true);
    }
  }

  onCancel() {
    this.isOpen.set(false);
    if (this.resolveFn) {
      this.resolveFn(false);
    }
  }
}
