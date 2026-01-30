import { Injectable, signal } from '@angular/core';
import { ar } from '../i18n/ar';
import { en } from '../i18n/en';

type Language = 'ar' | 'en';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private language = signal<Language>('ar'); // Default to Arabic
  private translations: { [key: string]: { [key: string]: string } } = { ar, en };

  // In a real app, this would be tied to user preference
  setLanguage(lang: Language) {
    this.language.set(lang);
  }

  getCurrentLanguage(): Language {
    return this.language();
  }

  translate(key: string): string {
    return this.translations[this.language()][key] || key;
  }
}
