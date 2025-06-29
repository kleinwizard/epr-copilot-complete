
import { Notification } from '../types/notifications';

export class NotificationDataService {
  private notifications: Notification[] = [
    {
      id: '1',
      title: 'Q4 2024 Report Due Soon',
      message: 'Your Q4 2024 EPR report submission is due in 5 days. Please review and submit before the deadline.',
      type: 'deadline',
      priority: 'high',
      status: 'unread',
      createdAt: '2024-06-24T09:00:00Z',
      scheduledFor: '2024-06-24T09:00:00Z',
      relatedEntity: {
        type: 'report',
        id: 'q4-2024',
        name: 'Q4 2024 EPR Report'
      },
      actions: [
        {
          id: 'view-report',
          label: 'View Report',
          type: 'primary',
          action: 'navigate',
          target: '/reports/q4-2024'
        },
        {
          id: 'dismiss',
          label: 'Dismiss',
          type: 'secondary',
          action: 'dismiss'
        }
      ]
    },
    {
      id: '2',
      title: 'Compliance Score Below Threshold',
      message: 'Your current compliance score (89%) has dropped below the recommended threshold of 90%. Review your recent submissions.',
      type: 'compliance',
      priority: 'medium',
      status: 'unread',
      createdAt: '2024-06-24T08:30:00Z',
      actions: [
        {
          id: 'view-dashboard',
          label: 'View Dashboard',
          type: 'primary',
          action: 'navigate',
          target: '/dashboard'
        }
      ]
    },
    {
      id: '3',
      title: 'New Team Member Added',
      message: 'Sarah Johnson has been added to the Compliance Team with Manager role.',
      type: 'team',
      priority: 'low',
      status: 'unread',
      createdAt: '2024-06-24T07:15:00Z',
      relatedEntity: {
        type: 'team_member',
        id: 'sarah-johnson',
        name: 'Sarah Johnson'
      },
      actions: [
        {
          id: 'view-team',
          label: 'View Team',
          type: 'primary',
          action: 'navigate',
          target: '/team'
        }
      ]
    }
  ];

  getNotifications(): Notification[] {
    return this.notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => n.status === 'unread');
  }

  getNotificationsByType(type: Notification['type']): Notification[] {
    return this.notifications.filter(n => n.type === type);
  }

  markNotificationAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.status = 'read';
    }
  }

  dismissNotification(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.status = 'dismissed';
    }
  }

  addNotification(notification: Notification): void {
    this.notifications.push(notification);
  }
}

export const notificationDataService = new NotificationDataService();
