
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BotService {
  name: string;
  status: 'Connected' | 'Disconnected' | 'Initializing';
  channel: string;
  icon: 'whatsapp' | 'telegram' | 'bot';
  url: string;
}

@Component({
  selector: 'app-social-bot-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './social-bot-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialBotManagementComponent {
  bots = signal<BotService[]>([
    {
      name: 'Evolution API',
      status: 'Connected',
      channel: 'قناة بلاغات واتساب',
      icon: 'whatsapp',
      url: 'http://localhost:8093/docs' // Points to the Swagger UI
    },
    {
      name: 'Telegram Bot',
      status: 'Connected',
      channel: 'بوت بلاغات تيليجرام',
      icon: 'telegram',
      url: '#' // No direct UI for the simple bot
    }
  ]);

  readonly chatwootUrl = 'http://localhost:3000';
}
