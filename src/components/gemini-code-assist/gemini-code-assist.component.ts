
import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-gemini-code-assist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gemini-code-assist.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeminiCodeAssistComponent {
  private geminiService = inject(GeminiService);

  prompt = signal<string>('Write a bash script to check server disk space and send an alert via a webhook if usage is over 85%.');
  language = signal<string>('Bash');
  isLoading = signal<boolean>(false);
  result = signal<string>('');
  error = signal<string>('');
  copySuccess = signal<boolean>(false);

  languages: string[] = ['Bash', 'Python', 'SQL', 'Dockerfile', 'Nginx Config', 'JavaScript'];

  async generateCode() {
    if (!this.prompt() || !this.language()) {
      this.error.set('يرجى إدخال وصف ولغة البرمجة المطلوبة.');
      return;
    }

    this.isLoading.set(true);
    this.result.set('');
    this.error.set('');
    this.copySuccess.set(false);

    const fullPrompt = `
      You are an expert developer and system administrator for the YemenJPT platform.
      Your task is to generate a clean, production-ready, and well-commented code snippet.

      Language: ${this.language()}
      Request: ${this.prompt()}

      Please only output the code itself, enclosed in a single markdown code block for the specified language. Do not include any explanatory text before or after the code block.
    `;

    try {
      const response = await this.geminiService.quickResponse(fullPrompt);
      // Clean the response to get only the code inside the markdown block
      const codeBlockRegex = /```(?:\w+\n)?([\s\S]+)```/;
      const match = response.match(codeBlockRegex);
      this.result.set(match ? match[1].trim() : response.trim());
    } catch (e) {
      console.error(e);
      this.error.set('حدث خطأ أثناء إنشاء الكود. يرجى المحاولة مرة أخرى.');
    } finally {
      this.isLoading.set(false);
    }
  }

  copyCode() {
    if (!this.result()) return;
    navigator.clipboard.writeText(this.result()).then(() => {
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 2000);
    });
  }
}
