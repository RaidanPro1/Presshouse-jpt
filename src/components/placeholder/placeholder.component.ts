
import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [],
  template: `
    <div class="flex flex-col items-center justify-center h-full text-center bg-base-100 p-8 rounded-xl border border-gray-200">
      <h1 class="text-4xl font-bold text-gray-800">{{ pageTitle() }}</h1>
      <p class="mt-4 text-lg text-gray-600">
        هذه الصفحة قيد التطوير حاليًا. يرجى التحقق مرة أخرى قريبًا!
      </p>
      <div class="mt-8 text-6xl text-gray-300 animate-pulse">
        🚧
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaceholderComponent {
  pageTitle = input.required<string>();
}