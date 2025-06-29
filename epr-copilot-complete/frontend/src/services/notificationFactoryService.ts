
import { Notification } from '../types/notifications';
import { notificationDataService } from './notificationDataService';

export class NotificationFactoryService {
  createDeadlineReminder(
    title: string,
    deadline: Date,
    daysBefore: number,
    relatedEntity?: Notification['relatedEntity']
  ): Notification {
    const reminderDate = new Date(deadline);
    reminderDate.setDate(reminderDate.getDate() - daysBefore);

    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Reminder: ${title}`,
      message: `This is a ${daysBefore}-day reminder for: ${title}. Due date: ${deadline.toLocaleDateString()}`,
      type: 'deadline',
      priority: daysBefore <= 7 ? 'high' : 'medium',
      status: 'unread',
      createdAt: new Date().toISOString(),
      scheduledFor: reminderDate.toISOString(),
      relatedEntity,
      actions: [
        {
          id: 'dismiss',
          label: 'Dismiss',
          type: 'secondary',
          action: 'dismiss'
        }
      ]
    };

    notificationDataService.addNotification(newNotification);
    return newNotification;
  }

  createComplianceAlert(
    title: string,
    message: string,
    priority: Notification['priority'] = 'medium'
  ): Notification {
    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type: 'compliance',
      priority,
      status: 'unread',
      createdAt: new Date().toISOString(),
      actions: [
        {
          id: 'view-dashboard',
          label: 'View Dashboard',
          type: 'primary',
          action: 'navigate',
          target: '/dashboard'
        }
      ]
    };

    notificationDataService.addNotification(newNotification);
    return newNotification;
  }

  createTeamNotification(
    title: string,
    message: string,
    relatedEntity?: Notification['relatedEntity']
  ): Notification {
    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      type: 'team',
      priority: 'low',
      status: 'unread',
      createdAt: new Date().toISOString(),
      relatedEntity,
      actions: [
        {
          id: 'view-team',
          label: 'View Team',
          type: 'primary',
          action: 'navigate',
          target: '/team'
        }
      ]
    };

    notificationDataService.addNotification(newNotification);
    return newNotification;
  }
}

export const notificationFactoryService = new NotificationFactoryService();
