
import { notificationDataService } from './notificationDataService';

export class NotificationStatsService {
  async getNotificationStats() {
    const notifications = await notificationDataService.getNotifications();
    return {
      total: notifications.length,
      unread: notifications.filter(n => n.status === 'unread').length,
      highPriority: notifications.filter(n => n.priority === 'high' || n.priority === 'critical').length,
      byType: {
        deadline: notifications.filter(n => n.type === 'deadline').length,
        compliance: notifications.filter(n => n.type === 'compliance').length,
        team: notifications.filter(n => n.type === 'team').length,
        system: notifications.filter(n => n.type === 'system').length
      }
    };
  }
}

export const notificationStatsService = new NotificationStatsService();
