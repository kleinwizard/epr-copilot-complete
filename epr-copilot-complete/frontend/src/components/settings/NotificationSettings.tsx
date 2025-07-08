
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, MessageSquare, Calendar, AlertTriangle, FileText } from 'lucide-react';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  deadline_reminders: boolean;
  compliance_alerts: boolean;
  team_notifications: boolean;
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    deadline_reminders: true,
    compliance_alerts: true,
    team_notifications: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get('/api/notifications/preferences');
      if (response) {
        setSettings(response);
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    try {
      setIsSaving(true);
      await apiService.put('/api/notifications/preferences', settings);
      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to save notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Choose what email notifications you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <Label htmlFor="deadline-alerts">Deadline Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders about upcoming compliance deadlines
                  </p>
                </div>
              </div>
              <Switch 
                id="deadline-alerts" 
                checked={settings.deadline_reminders}
                onCheckedChange={(checked) => updateSetting('deadline_reminders', checked)}
                disabled={isLoading}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <Label htmlFor="report-status">Report Status Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when reports are submitted or approved
                  </p>
                </div>
              </div>
              <Switch 
                id="report-status" 
                checked={settings.compliance_alerts}
                onCheckedChange={(checked) => updateSetting('compliance_alerts', checked)}
                disabled={isLoading}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <Label htmlFor="fee-changes">Fee Changes</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications about fee structure updates
                  </p>
                </div>
              </div>
              <Switch 
                id="fee-changes" 
                checked={settings.email_notifications}
                onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
                disabled={isLoading}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <div>
                  <Label htmlFor="team-updates">Team Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    New team member invitations and role changes
                  </p>
                </div>
              </div>
              <Switch 
                id="team-updates" 
                checked={settings.team_notifications}
                onCheckedChange={(checked) => updateSetting('team_notifications', checked)}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>In-App Notifications</CardTitle>
          <CardDescription>
            Manage your in-platform notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-blue-600" />
              <div>
                <Label htmlFor="browser-notifications">Browser Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show desktop notifications for important updates
                </p>
              </div>
            </div>
            <Switch 
              id="browser-notifications" 
              checked={settings.push_notifications}
              onCheckedChange={(checked) => updateSetting('push_notifications', checked)}
              disabled={isLoading}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              <div>
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive SMS alerts for critical updates
                </p>
              </div>
            </div>
            <Switch 
              id="sms-notifications" 
              checked={settings.sms_notifications}
              onCheckedChange={(checked) => updateSetting('sms_notifications', checked)}
              disabled={isLoading}
            />
          </div>
          
          <div className="pt-4">
            <Button onClick={saveNotificationSettings} disabled={isLoading || isSaving}>
              {isSaving ? 'Saving...' : 'Save Notification Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
          <CardDescription>
            Recent notifications and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Q1 2024 Report Due</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <Badge variant="outline">Sent</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Report Approved</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <Badge variant="outline">Delivered</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Fee Rate Update</p>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
              <Badge variant="outline">Read</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
