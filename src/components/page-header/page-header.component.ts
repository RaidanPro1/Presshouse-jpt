import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="bg-base-200 py-12 md:py-16">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-5xl font-extrabold text-ph-blue">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="mt-4 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{{ subtitle() }}</p>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string | undefined>();
}