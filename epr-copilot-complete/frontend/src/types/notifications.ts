
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'compliance' | 'team' | 'system' | 'warning' | 'info';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'unread' | 'read' | 'dismissed';
  createdAt: string;
  scheduledFor?: string;
  relatedEntity?: {
    type: 'product' | 'report' | 'fee' | 'calendar_event' | 'team_member';
    id: string;
    name: string;
  };
  actions?: NotificationAction[];
  userId?: string;
  teamId?: string;
}

export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: 'navigate' | 'api_call' | 'dismiss';
  target?: string;
  apiEndpoint?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  browserNotifications: boolean;
  deadlineReminders: {
    enabled: boolean;
    daysBefore: number[];
  };
  complianceAlerts: {
    enabled: boolean;
    types: string[];
  };
  teamNotifications: {
    enabled: boolean;
    types: string[];
  };
}
