import { Injectable, signal, computed } from '@angular/core';

export type NotificationType = 'task' | 'system' | 'mention';

export interface Notification {
  id: number;
  message: string;
  read: boolean;
  type: NotificationType;
  timestamp: Date;
  link?: string; // e.g., to navigate to the relevant task/project
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  notifications = signal<Notification[]>([
    {
      id: 1,
      message: 'مرحباً بك في YemenJPT! تفقد لوحة التحكم للبدء.',
      read: true,
      type: 'system',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      id: 2,
      message: 'تم تحديث أداة InVID للتحقق من الفيديو.',
      read: false,
      type: 'system',
      timestamp: new Date()
    }
  ]);

  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

  addNotification(message: string, type: NotificationType, link?: string) {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      read: false,
      type,
      timestamp: new Date(),
      link
    };
    this.notifications.update(notifications => [newNotification, ...notifications]);
  }

  markAsRead(id: number) {
    this.notifications.update(notifications => 
      notifications.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllAsRead() {
    this.notifications.update(notifications => 
      notifications.map(n => ({ ...n, read: true }))
    );
  }

  clearNotifications() {
    this.notifications.set([]);
  }
}
