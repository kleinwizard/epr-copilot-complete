
// Re-export types for backward compatibility
export type { Notification, NotificationAction, NotificationSettings } from '../types/notifications';

// Import and re-export all services
export { notificationDataService } from './notificationDataService';
export { notificationFactoryService } from './notificationFactoryService';
export { notificationStatsService } from './notificationStatsService';

// Import services for local use
import { notificationDataService } from './notificationDataService';
import { notificationFactoryService } from './notificationFactoryService';
import { notificationStatsService } from './notificationStatsService';

// Re-export service methods for backward compatibility
export const getNotifications = async () => await notificationDataService.getNotifications();
export const getUnreadNotifications = async () => await notificationDataService.getUnreadNotifications();
export const getNotificationsByType = async (type: any) => await notificationDataService.getNotificationsByType(type);
export const markNotificationAsRead = async (id: string) => await notificationDataService.markNotificationAsRead(id);
export const dismissNotification = async (id: string) => await notificationDataService.dismissNotification(id);

export const createDeadlineReminder = (
  title: string,
  deadline: Date,
  daysBefore: number,
  relatedEntity?: any
) => notificationFactoryService.createDeadlineReminder(title, deadline, daysBefore, relatedEntity);

export const createComplianceAlert = (
  title: string,
  message: string,
  priority?: any
) => notificationFactoryService.createComplianceAlert(title, message, priority);

export const createTeamNotification = (
  title: string,
  message: string,
  relatedEntity?: any
) => notificationFactoryService.createTeamNotification(title, message, relatedEntity);

export const getNotificationStats = () => notificationStatsService.getNotificationStats();
