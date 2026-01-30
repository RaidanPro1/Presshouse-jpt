import { Injectable, inject } from '@angular/core';
import { GoogleGenAI, Content, GenerateContentResponse, Part, Tool as GeminiTool, Type, GenerateContentParameters } from '@google/genai';
import { SettingsService } from './settings.service';
import { TranslationService } from './translation.service'; // Import translation service

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private settingsService = inject(SettingsService);
  private translationService = inject(TranslationService); // Inject it
  private ai: GoogleGenAI | null = null;

  // Lazy-loaded AI instance
  private getAiInstance(): GoogleGenAI | null {
    // If instance exists, return it
    if (this.ai) {
      return this.ai;
    }

    // If provider is not google, no need to initialize
    if (this.settingsService.aiProvider() !== 'google') {
      return null;
    }

    // Check for API key and create instance
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      try {
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        return this.ai;
      } catch (e) {
        console.error("Failed to initialize GoogleGenAI:", e);
        this.ai = null; // Ensure it's null on failure
        return null;
      }
    } else {
      console.warn("API_KEY environment variable not found. Google Gemini features will be disabled.");
      return null;
    }
  }

  // --- Local AI Simulation Methods ---

  private async getLocalChatResponse(newMessage: string): Promise<GenerateContentResponse> {
    await simulateDelay(1200);
    const lowerMessage = newMessage.toLowerCase();
    let text: string;
    if (lowerMessage.includes('مرحبا') || lowerMessage.includes('أهلا')) {
      text = 'أهلاً بك! أنا نموذج الذكاء الاصطناعي المحلي. كيف يمكنني خدمتك اليوم؟';
    } else {
      text = `هذا رد محلي تمت محاكاته بخصوص: "${newMessage}". في نظام حقيقي، سأقوم بتحليل هذا الطلب بعمق.`;
    }
    // Mock the response structure
    return {
      text,
      functionCalls: () => undefined
    } as unknown as GenerateContentResponse;
  }

  private async analyzeLocalImage(prompt: string): Promise<string> {
     await simulateDelay(2000);
    return `هذا تحليل محلي للصورة. بناءً على سؤالك: "${prompt}", الصورة تبدو واضحة وتحتوي على عناصر مثيرة للاهتمام.`;
  }

  private async getLocalQuickResponse(prompt: string): Promise<string> {
    await simulateDelay(500);
    const shortPrompt = prompt.length > 70 ? prompt.substring(0, 70) + '...' : prompt;
    return `ملخص محلي سريع للنص الذي يبدأ بـ: "${shortPrompt}"`;
  }
  
  // --- Public Methods with Provider-Switching Logic ---

  async getChatResponse(history: Content[], newMessage: string, tools?: GeminiTool[], systemInstruction?: string): Promise<GenerateContentResponse> {
    if (this.settingsService.aiProvider() === 'local') {
      return this.getLocalChatResponse(newMessage);
    }
    
    const ai = this.getAiInstance();
    if (!ai) {
      return {
        text: this.translationService.translate('gemini_not_configured'),
        functionCalls: () => undefined
      } as unknown as GenerateContentResponse;
    }

    try {
      const contents: Content[] = [...history, { role: 'user', parts: [{ text: newMessage }] }];
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: { 
          tools: tools,
          systemInstruction: systemInstruction
        },
      });
      return response;
    } catch (e) {
      console.error("Gemini chat error:", e);
      throw new Error(this.translationService.translate('gemini_connection_error'));
    }
  }

  async analyzeImage(prompt: string, imageBase64: string, mimeType: string): Promise<string> {
     if (this.settingsService.aiProvider() === 'local') {
      return this.analyzeLocalImage(prompt);
    }
    
    const ai = this.getAiInstance();
    if (!ai) {
      return this.translationService.translate('gemini_not_configured');
    }

    const imagePart: Part = {
      inlineData: {
        mimeType: mimeType,
        data: imageBase64,
      },
    };
    const textPart: Part = { text: prompt };

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
      });
      return response.text;
    } catch(e) {
        console.error("Gemini image analysis error:", e);
        throw new Error(this.translationService.translate('gemini_image_analysis_error'));
    }
  }
  
  async quickResponse(prompt: string): Promise<string> {
    if (this.settingsService.aiProvider() === 'local') {
      return this.getLocalQuickResponse(prompt);
    }
    
    const ai = this.getAiInstance();
    if (!ai) {
      return this.translationService.translate('gemini_not_configured');
    }

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch(e) {
        console.error("Gemini quick response error:", e);
        throw new Error(this.translationService.translate('gemini_quick_response_error'));
    }
  }

  async translateText(text: string, to: 'en' | 'ar'): Promise<string> {
    // This is a simple simulation, but we can internationalize its failure case
    await simulateDelay(700);
    // In a real app, you'd call Gemini here for translation.
    if (Math.random() > 0.95) { // Simulate a failure
      throw new Error("Translation service failed");
    }

    if (to === 'en') {
      return `(Translated) ${text}`;
    } else {
      return `(مترجم) ${text}`;
    }
  }
  
  async generateStructuredResponse(prompt: string, schema: GenerateContentParameters['config']['responseSchema'], systemInstruction: string): Promise<any> {
    if (this.settingsService.aiProvider() === 'local') {
      await simulateDelay(1500);
      if (prompt.includes('بصمة') || prompt.includes('sherlock')) {
        return { toolIds: ['sherlock-maigret', 'social-analyzer'] };
      }
      if (prompt.includes('ارشف')) {
        return { toolIds: ['searxng', 'archivebox'] };
      }
      return { toolIds: ['searxng'] };
    }

    const ai = this.getAiInstance();
    if (!ai) {
      throw new Error(this.translationService.translate('gemini_not_configured'));
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: schema,
        }
      });
      
      const jsonText = response.text.trim();
      const cleanedJson = jsonText.replace(/^```json\s*/, '').replace(/```$/, '');
      return JSON.parse(cleanedJson);

    } catch (e) {
      console.error("Gemini structured response error:", e);
      throw new Error(this.translationService.translate('gemini_error'));
    }
  }
}