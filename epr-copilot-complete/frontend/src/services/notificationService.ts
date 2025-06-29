
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
export const getNotifications = () => notificationDataService.getNotifications();
export const getUnreadNotifications = () => notificationDataService.getUnreadNotifications();
export const getNotificationsByType = (type: any) => notificationDataService.getNotificationsByType(type);
export const markNotificationAsRead = (id: string) => notificationDataService.markNotificationAsRead(id);
export const dismissNotification = (id: string) => notificationDataService.dismissNotification(id);

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
