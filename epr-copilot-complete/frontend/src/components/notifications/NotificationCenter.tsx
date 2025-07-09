
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, AlertTriangle, Users, Calendar, Check, X } from 'lucide-react';
import { 
  getNotifications, 
  getNotificationsByType, 
  markNotificationAsRead, 
  dismissNotification,
  getNotificationStats,
  type Notification 
} from '@/services/notificationService';
import { NotificationItem } from './NotificationItem';
import { NotificationFilters } from './NotificationFilters';

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedTab, setSelectedTab] = useState('all');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    type: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    highPriority: 0,
    byType: {
      deadline: 0,
      compliance: 0,
      team: 0,
      system: 0
    }
  });

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const data = await getNotifications();
        setNotifications(Array.isArray(data) ? data : []);
        
        const statsData = await getNotificationStats();
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      const updatedNotifications = await getNotifications();
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await dismissNotification(id);
      const updatedNotifications = await getNotifications();
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.status === 'unread');
      await Promise.all(
        unreadNotifications.map(notification => markNotificationAsRead(notification.id))
      );
      const updatedNotifications = await getNotifications();
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    if (selectedTab !== 'all') {
      filtered = filtered.filter(n => n.type === selectedTab);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(n => n.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }

    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();

  const getTabIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <Calendar className="h-4 w-4" />;
      case 'compliance':
        return <AlertTriangle className="h-4 w-4" />;
      case 'team':
        return <Users className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notification Center</h2>
          <p className="text-muted-foreground">
            Stay updated with deadlines, compliance alerts, and team notifications
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {stats.unread} unread
          </Badge>
          {stats.unread > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.byType.deadline}</p>
                <p className="text-sm text-muted-foreground">Deadlines</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.byType.compliance}</p>
                <p className="text-sm text-muted-foreground">Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.byType.team}</p>
                <p className="text-sm text-muted-foreground">Team</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <NotificationFilters filters={filters} onFiltersChange={setFilters} />

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            View and manage your notifications by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>All</span>
              </TabsTrigger>
              <TabsTrigger value="deadline" className="flex items-center space-x-2">
                {getTabIcon('deadline')}
                <span>Deadlines</span>
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center space-x-2">
                {getTabIcon('compliance')}
                <span>Compliance</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="flex items-center space-x-2">
                {getTabIcon('team')}
                <span>Team</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>System</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                      <p className="text-muted-foreground">Loading notifications...</p>
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No notifications found</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDismiss={handleDismiss}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
