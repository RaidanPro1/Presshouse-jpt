import { Injectable, signal, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private titleService: Title = inject(Title);
  private metaService: Meta = inject(Meta);

  // Default SEO values
  pageTitle = signal<string>('بيت الصحافة | Press House');
  metaDescription = signal<string>('Yemen Journalist Pre-trained Transformer (YemenJPT): A comprehensive OSINT platform for journalists, providing a suite of tools for data collection, verification, analysis, and collaboration, powered by Press House Yemen.');
  metaKeywords = signal<string>('OSINT, Yemen, Journalism, Investigation, Press House, الصحافة, اليمن, تحقيق, استقصاء, بيت الصحافة');

  constructor() { }

  updateTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  updateMetaTag(name: string, content: string) {
    const selector = `name='${name}'`;
    let tag = this.metaService.getTag(selector);
    if (tag) {
      this.metaService.updateTag({ name, content });
    } else {
      this.metaService.addTag({ name, content });
    }
  }
}
