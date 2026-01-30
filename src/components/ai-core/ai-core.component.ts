import { Component, ChangeDetectionStrategy, signal, inject, computed, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ImageAnalysisComponent } from '../image-analysis/image-analysis.component';
import { GeminiService } from '../../services/gemini.service';
import { SettingsService } from '../../services/settings.service';
import { UserService } from '../../services/user.service';
import { Content, GenerateContentResponse, Tool as GeminiTool, Type, Part } from '@google/genai';
import { ToolStateService } from '../../services/tool-state.service';
import { ToolService } from '../../services/tool.service';
import { LoggerService } from '../../services/logger.service';

interface Message {
  id: number;
  text: string;
  from: 'user' | 'ai' | 'system';
  timestamp: Date;
  toolUsed?: string;
  isError?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  date: Date;
}

@Component({
  selector: 'app-ai-core',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageAnalysisComponent],
  templateUrl: './ai-core.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiCoreComponent {
  private geminiService = inject(GeminiService);
  private settingsService = inject(SettingsService);
  private userService = inject(UserService);
  private toolStateService = inject(ToolStateService);
  private toolService = inject(ToolService);
  private logger = inject(LoggerService);
  
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  user = this.userService.currentUser;
  currentAiProvider = this.settingsService.aiProvider;

  // UI State
  isSidebarOpen = signal(true);
  messages = signal<Message[]>([]);
  currentInput = signal('');
  isGenerating = signal(false);
  
  // Chat History
  chatHistory = signal<ChatSession[]>([
    { id: '1', title: 'تحليل بيانات الميناء', date: new Date() },
    { id: '2', title: 'ملخص تقرير الأمم المتحدة', date: new Date(Date.now() - 86400000) },
    { id: '3', title: 'البحث عن حسابات تويتر', date: new Date(Date.now() - 172800000) },
  ]);

  // Available Models
  availableModels = [
    { id: 'gemini-pro', name: 'YemenJPT-Cloud (Pro 1.5)', icon: '✨', provider: 'google' },
    { id: 'gemini-flash', name: 'YemenJPT-Cloud (Flash)', icon: '⚡', provider: 'google' },
    { id: 'local-falcon', name: 'Local Falcon-3 (Offline)', icon: '🔒', provider: 'local' }
  ];
  selectedModel = signal(this.availableModels[0]);

  // --- Tool Definitions (Model Context Protocol - Client Side) ---
  private getAllToolsForAI = computed(() => {
    const user = this.user();
    if (!user) return [];
    // Only return tools that are executable via CLI for now
    const executableTools = ['sherlock-maigret', 'spiderfoot'];
    return this.toolService.tools().filter(tool => {
        if (!tool.isActive || !executableTools.includes(tool.id)) return false;
        if (user.role === 'super-admin') return true;
        return tool.allowedRoles.includes(user.role);
    });
  });

  // Dynamically generate the Tool Schema for Gemini based on user permissions
  geminiTools = computed((): GeminiTool[] | undefined => {
    const allowedTools = this.getAllToolsForAI();
    if (!allowedTools.length || this.currentAiProvider() === 'local') return undefined;

    const functionDeclarations = allowedTools.map(tool => {
        let parameters: any = { type: Type.OBJECT, properties: {}, required: [] };
        if (tool.id === 'sherlock-maigret') {
            parameters.properties.username = { type: Type.STRING, description: "The username to search for across social media." };
            parameters.required.push('username');
        }
        if (tool.id === 'spiderfoot') {
             parameters.properties.target = { type: Type.STRING, description: "The target to scan (domain, IP address, or email)." };
             parameters.required.push('target');
        }

        return {
            name: tool.id,
            description: tool.description,
            parameters: parameters
        };
    }).filter(fd => Object.keys(fd.parameters.properties).length > 0);

    if (functionDeclarations.length === 0) return undefined;

    return [{ functionDeclarations }];
  });


  constructor() {
    this.startNewChat();
    // Auto-scroll effect
    effect(() => {
      this.messages();
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  startNewChat() {
    this.messages.set([
      { 
        id: Date.now(), 
        text: `مرحباً ${this.user()?.name || 'يا صديقي'} 👋\nأنا مساعدك الذكي في منصة بيت الصحافة. يمكنني مساعدتك في البحث، التحليل، أو استخدام أدوات المنصة نيابة عنك.`, 
        from: 'ai', 
        timestamp: new Date() 
      }
    ]);
  }

  selectModel(model: any) {
    this.selectedModel.set(model);
    this.settingsService.aiProvider.set(model.provider as 'google' | 'local');
  }

  async sendMessage() {
    if (!this.currentInput().trim() || this.isGenerating()) return;

    const userText = this.currentInput();
    this.currentInput.set('');

    this.addMessage(userText, 'user');
    this.isGenerating.set(true);

    try {
        let history: Content[] = this.messages()
            .filter(m => m.from !== 'system' && !m.isError)
            .map(msg => ({
                role: msg.from === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

        // Initial call to Gemini
        const initialResponse = await this.geminiService.getChatResponse(history.slice(0, -1), userText, this.geminiTools());
        
        const functionCallParts = initialResponse.candidates?.[0]?.content?.parts?.filter(p => !!p.functionCall);
        const functionCall = functionCallParts?.[0]?.functionCall;

        if (functionCall) {
            // --- Tool Execution Flow ---
            const toolId = functionCall.name;
            const args = functionCall.args;

            this.addMessage(`جارٍ استخدام أداة: ${toolId}...`, 'system', false, toolId);
            
            const modelTurn: Content = { role: 'model', parts: [{ functionCall }] };
            
            try {
                const toolResult = await firstValueFrom(this.geminiService.executeTool(toolId, args));
                
                const toolResponsePart: Part = {
                    functionResponse: { name: toolId, response: { output: toolResult.output } }
                };
                
                const historyForNextCall: Content[] = [...history, modelTurn, { role: 'user', parts: [toolResponsePart] }];
                
                const finalResponse = await this.geminiService.getChatResponse(historyForNextCall, '');
                this.addMessage(finalResponse.text, 'ai');

            } catch (toolError: any) {
                const errorMessage = toolError?.error?.error || toolError.message || 'فشل تشغيل الأداة.';
                this.addMessage(`خطأ أثناء تشغيل أداة ${toolId}: ${errorMessage}`, 'ai', true);
            }

        } else {
            // --- Simple Text Response Flow ---
            const responseText = initialResponse.text;
            if (responseText) {
                this.addMessage(responseText, 'ai');
            } else {
                 this.addMessage('عذراً، لم أتمكن من معالجة الطلب. يرجى المحاولة مرة أخرى.', 'ai', true);
            }
        }

    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في الاتصال بالشبكة العصبية.';
        this.addMessage(errorMessage, 'ai', true);
    } finally {
        this.isGenerating.set(false);
    }
  }

  private addMessage(text: string, from: 'user' | 'ai' | 'system', isError = false, toolUsed?: string) {
    this.messages.update(msgs => [...msgs, {
      id: Date.now(),
      text,
      from,
      timestamp: new Date(),
      isError,
      toolUsed
    }]);
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom() {
    if(this.scrollContainer) {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    }
  }
}
