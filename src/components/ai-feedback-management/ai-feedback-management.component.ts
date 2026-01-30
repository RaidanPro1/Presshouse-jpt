import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggerService } from '../../services/logger.service';
import { UserService } from '../../services/user.service';

interface AiFeedback {
  id: number;
  prompt: string;
  response: string;
  rating: 'good' | 'bad';
  user: string;
  timestamp: string;
}

@Component({
  selector: 'app-ai-feedback-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-feedback-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiFeedbackManagementComponent {
  private logger = inject(LoggerService);
  private userService = inject(UserService);

  feedbackEntries = signal<AiFeedback[]>([
    { 
      id: 1, 
      prompt: 'لخص المقال التالي عن الوضع في مأرب...', 
      response: 'الوضع في مأرب يتضمن توترات عسكرية متزايدة و...', 
      rating: 'good', 
      user: 'أحمد خالد', 
      timestamp: '2024-07-20 10:30' 
    },
    { 
      id: 2, 
      prompt: 'ما هي آخر التطورات في عدن؟', 
      response: 'عذراً، لا يمكنني الوصول إلى معلومات آنية...', 
      rating: 'bad', 
      user: 'فاطمة علي', 
      timestamp: '2024-07-19 15:45' 
    }
  ]);

  archiveFeedback(id: number) {
    const entry = this.feedbackEntries().find(e => e.id === id);
    if (!entry) return;

    this.feedbackEntries.update(entries => entries.filter(e => e.id !== id));
    
    const currentUser = this.userService.currentUser();
    this.logger.logEvent(
        'أرشفة تقييم AI',
        `تمت أرشفة تقييم (${entry.rating}) من المستخدم "${entry.user}" بخصوص السؤال: "${entry.prompt.substring(0, 30)}..."`,
        currentUser?.name,
        currentUser?.role === 'super-admin'
    );

    // In a real app, this would mark the feedback as archived or send it to a training pipeline.
    console.log(`Archiving feedback ID: ${id}`);
  }
}