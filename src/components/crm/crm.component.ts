import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-crm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crm.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrmComponent {
  private sanitizer: DomSanitizer = inject(DomSanitizer);
  
  // This URL points to the public domain managed by Cloudflare Tunnel.
  crmUrl = signal<string>('http://localhost:8085'); 
  safeUrl: SafeResourceUrl;
  isLoading = signal(true);

  constructor() {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.crmUrl());
  }

  onFrameLoad() {
    this.isLoading.set(false);
  }
}