import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Article {
  id: number;
  title: string;
  author: string;
  submittedAt: string;
  avatar: string;
}

type ArticleStatus = 'ideas' | 'inProgress' | 'review' | 'published';


@Component({
  selector: 'app-editorial-hub',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editorial-hub.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorialHubComponent {

  articles = signal<{ [key in ArticleStatus]: Article[] }>({
    ideas: [
      { id: 1, title: 'تحليل اقتصادي لتأثير الحرب على العملة', author: 'فريق الاقتصاد', submittedAt: '', avatar: 'https://i.pravatar.cc/150?u=econ' },
      { id: 6, title: 'مقترح: قصة حول صيد الأسماك في الساحل الغربي', author: 'قسم الأخبار', submittedAt: '', avatar: 'https://i.pravatar.cc/150?u=news' },
    ],
    inProgress: [
      { id: 2, title: 'تحقيق: شبكات التهريب عبر السواحل', author: 'أحمد خالد', submittedAt: '', avatar: 'https://i.pravatar.cc/150?u=ahmed' },
    ],
    review: [
      { id: 3, title: 'تقرير: حالة التعليم في المناطق النائية', author: 'فاطمة علي', submittedAt: '2024-07-21', avatar: 'https://i.pravatar.cc/150?u=fatima' },
    ],
    published: [
       { id: 4, title: 'خبر: افتتاح مشروع مياه جديد في تعز', author: 'قسم الأخبار', submittedAt: '', avatar: 'https://i.pravatar.cc/150?u=news' },
       { id: 5, title: 'بيان إدانة لاستهداف الصحفيين في مأرب', author: 'بيت الصحافة', submittedAt: '', avatar: 'assets/logo.png' },
    ]
  });

  // Computed stats for the dashboard
  articlesInReviewCount = computed(() => this.articles().review.length);
  publishedThisWeekCount = computed(() => this.articles().published.length); // Simplified for demo
  ideasCount = computed(() => this.articles().ideas.length);
  
  draggedArticleId = signal<number | null>(null);
  dragOverStatus = signal<ArticleStatus | null>(null);

  onDragStart(articleId: number) {
    this.draggedArticleId.set(articleId);
  }

  onDragOver(event: DragEvent, status: ArticleStatus) {
    event.preventDefault();
    this.dragOverStatus.set(status);
  }

  onDragLeave() {
    this.dragOverStatus.set(null);
  }

  onDrop(event: DragEvent, newStatus: ArticleStatus) {
    event.preventDefault();
    const articleId = this.draggedArticleId();
    if (!articleId) return;

    let draggedArticle: Article | undefined;
    let oldStatus: ArticleStatus | undefined;

    // Find article and its old status
    for (const status of Object.keys(this.articles()) as ArticleStatus[]) {
      const article = this.articles()[status].find(a => a.id === articleId);
      if (article) {
        draggedArticle = article;
        oldStatus = status;
        break;
      }
    }

    if (draggedArticle && oldStatus && oldStatus !== newStatus) {
      this.articles.update(articles => {
        const newArticles = { ...articles };
        newArticles[oldStatus!] = newArticles[oldStatus!].filter(a => a.id !== articleId);
        newArticles[newStatus].push(draggedArticle!);
        return newArticles;
      });
    }

    this.draggedArticleId.set(null);
    this.dragOverStatus.set(null);
  }
}