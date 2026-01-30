import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export interface Theme {
  primaryColor: string;
  fontFamily: string;
  logoUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private document: Document = inject(DOCUMENT);

  theme = signal<Theme>({
    primaryColor: '#0D2B6B', // Default ph-blue
    fontFamily: "'Cairo', sans-serif",
    logoUrl: 'assets/logos/press-house-logo.png',
  });

  constructor() {
    this.loadTheme();
    effect(() => this.applyTheme(this.theme()));
  }

  private applyTheme(theme: Theme) {
    const styleTag = this.document.getElementById('app-theme');
    if (styleTag) {
      // Convert hex to RGB for transparent colors
      const r = parseInt(theme.primaryColor.slice(1, 3), 16);
      const g = parseInt(theme.primaryColor.slice(3, 5), 16);
      const b = parseInt(theme.primaryColor.slice(5, 7), 16);

      styleTag.innerHTML = `
        :root {
          --primary-color: ${theme.primaryColor};
          --primary-color-dark: ${this.adjustColor(theme.primaryColor, -20)};
          --primary-color-light-bg: rgba(${r}, ${g}, ${b}, 0.1);
          --app-font-family: ${theme.fontFamily};
        }
        body, h1, h2, h3, h4, h5, h6 {
          font-family: var(--app-font-family);
        }
        /* Overriding Tailwind classes for ph-blue */
        .bg-ph-blue { background-color: var(--primary-color) !important; }
        .text-ph-blue { color: var(--primary-color) !important; }
        .border-ph-blue { border-color: var(--primary-color) !important; }
        .ring-ph-blue { --tw-ring-color: var(--primary-color) !important; }
        .bg-ph-blue-dark { background-color: var(--primary-color-dark) !important; }
        .hover\\:bg-ph-blue-dark:hover { background-color: var(--primary-color-dark) !important; }
        .focus\\:ring-ph-blue:focus { --tw-ring-color: var(--primary-color) !important; }
        .focus\\:border-ph-blue:focus { border-color: var(--primary-color) !important; }
        .text-ph-blue-dark { color: var(--primary-color-dark) !important; }
        .bg-ph-blue-light { background-color: var(--primary-color-light-bg) !important; }
        .from-ph-blue { --tw-gradient-from: var(--primary-color) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      `;
    }
    // Update logos globally
    const logos = this.document.querySelectorAll('img[src*="logo"]');
    logos.forEach(logo => {
        const el = logo as HTMLImageElement;
        // Avoid replacing partner logos or unrelated images
        if(el.src.includes('press-house-logo') || el.src.includes('assets/logo.png')) {
           el.src = theme.logoUrl;
        }
    });
  }

  private loadTheme() {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      try {
        this.theme.set(JSON.parse(savedTheme));
      } catch (e) {
        console.error('Failed to parse saved theme', e);
        localStorage.removeItem('app-theme');
      }
    }
  }

  saveTheme(theme: Theme) {
    this.theme.set(theme);
    localStorage.setItem('app-theme', JSON.stringify(theme));
  }
  
  private adjustColor(color: string, amount: number): string {
    return '#' + color.replace(/^#/, '').replace(/../g, c => ('0'+Math.min(255, Math.max(0, parseInt(c, 16) + amount)).toString(16)).substr(-2));
  }
}
