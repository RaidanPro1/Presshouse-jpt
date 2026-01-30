import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { TranslationService } from '../../services/translation.service';

const MAX_IMAGE_PROMPT_LENGTH = 1000;

@Component({
  selector: 'app-image-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-analysis.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageAnalysisComponent {
  private geminiService = inject(GeminiService);
  private translationService = inject(TranslationService);

  imagePreview = signal<string | null>(null);
  private imageFile = signal<File | null>(null);
  prompt = signal<string>('ماذا ترى في هذه الصورة؟');
  analysisResult = signal<string>('');
  isAnalyzing = signal<boolean>(false);
  error = signal<string>('');

  handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.error.set('');
      this.imageFile.set(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async analyzeImage() {
    if (!this.imageFile() || !this.prompt()) {
      this.error.set(this.translationService.translate('image_upload_prompt_error'));
      return;
    }

    // Input Validation
    if (this.prompt().length > MAX_IMAGE_PROMPT_LENGTH) {
      this.error.set(this.translationService.translate('image_prompt_too_long'));
      return;
    }
    if (/<script>/i.test(this.prompt())) {
      this.error.set(this.translationService.translate('image_prompt_invalid_content'));
      return;
    }

    this.isAnalyzing.set(true);
    this.analysisResult.set('');
    this.error.set('');

    try {
      const base64Data = this.imagePreview()?.split(',')[1];
      if (!base64Data) {
        throw new Error('Could not read image data.');
      }
      
      const result = await this.geminiService.analyzeImage(this.prompt(), base64Data, this.imageFile()!.type);
      this.analysisResult.set(result);
    } catch (e) {
      console.error(e);
      this.error.set(this.translationService.translate('image_analysis_error'));
    } finally {
      this.isAnalyzing.set(false);
    }
  }
}
