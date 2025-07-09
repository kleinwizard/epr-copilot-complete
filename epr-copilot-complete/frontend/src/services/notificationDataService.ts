
import { Notification } from '../types/notifications';
import { apiService } from './apiService';

export class NotificationDataService {
  async getNotifications(): Promise<Notification[]> {
    try {
      const data = await apiService.getNotifications();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to load notifications:', error);
      return [];
    }
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    const notifications = await this.getNotifications();
    return notifications.filter(n => n.status === 'unread');
  }

  async getNotificationsByType(type: Notification['type']): Promise<Notification[]> {
    const notifications = await this.getNotifications();
    return notifications.filter(n => n.type === type);
  }

  async markNotificationAsRead(id: string): Promise<void> {
    try {
      await apiService.markNotificationAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  async dismissNotification(id: string): Promise<void> {
    return this.markNotificationAsRead(id);
  }

  async addNotification(notification: Notification): Promise<void> {
    console.warn('addNotification not implemented - requires backend POST endpoint');
  }
}

export const notificationDataService = new NotificationDataService();
