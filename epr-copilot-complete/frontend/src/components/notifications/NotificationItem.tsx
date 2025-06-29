
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Bell, Calendar, Users, Check, X, ExternalLink } from 'lucide-react';
import { type Notification } from '@/services/notificationService';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDismiss }: NotificationItemProps) {
  const getTypeIcon = () => {
    switch (notification.type) {
      case 'deadline':
        return <Calendar className="h-4 w-4 text-orange-600" />;
      case 'compliance':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'team':
        return <Users className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAction = (action: any) => {
    switch (action.action) {
      case 'dismiss':
        onDismiss(notification.id);
        break;
      case 'navigate':
        if (action.target) {
          window.location.href = action.target;
        }
        break;
      case 'api_call':
        if (action.apiEndpoint) {
          // Handle API call
          console.log('API call to:', action.apiEndpoint);
        }
        break;
    }
  };

  return (
    <Card className={`transition-all duration-200 ${
      notification.status === 'unread' 
        ? 'border-l-4 border-l-blue-500 bg-blue-50/50' 
        : 'border-l-4 border-l-gray-200'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between space-x-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className="mt-1">
              {getTypeIcon()}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-sm">{notification.title}</h4>
                <Badge variant="outline" className={getPriorityColor()}>
                  {notification.priority}
                </Badge>
                {notification.status === 'unread' && (
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    New
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                {notification.message}
              </p>
              
              {notification.relatedEntity && (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>Related to:</span>
                  <Badge variant="outline" className="text-xs">
                    {notification.relatedEntity.name}
                  </Badge>
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{new Date(notification.createdAt).toLocaleString()}</span>
                {notification.scheduledFor && (
                  <>
                    <span>•</span>
                    <span>Scheduled: {new Date(notification.scheduledFor).toLocaleString()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {notification.status === 'unread' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
                className="h-8 w-8 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(notification.id)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {notification.actions && notification.actions.length > 0 && (
          <div className="mt-3 flex items-center space-x-2">
            {notification.actions.map((action) => (
              <Button
                key={action.id}
                variant={action.type === 'primary' ? 'default' : action.type === 'danger' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => handleAction(action)}
                className="text-xs"
              >
                {action.action === 'navigate' && <ExternalLink className="h-3 w-3 mr-1" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
