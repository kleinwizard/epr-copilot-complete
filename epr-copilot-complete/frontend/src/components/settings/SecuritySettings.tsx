
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Lock, Smartphone, Key, AlertTriangle, Eye, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import { pdfExportService } from '@/services/pdfExportService';

interface SecurityEvent {
  id: string;
  type: 'login' | 'password_change' | 'failed_login' | 'api_access';
  description: string;
  timestamp: string;
  ipAddress: string;
  status: 'success' | 'warning' | 'error';
}

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export function SecuritySettings() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isBackupCodesModalOpen, setIsBackupCodesModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      const [events, sessionData] = await Promise.all([
        apiService.get('/api/security/events'),
        apiService.get('/api/security/sessions')
      ]);
      
      setSecurityEvents(events || []);
      setSessions(sessionData || []);
    } catch (error) {
      console.error('Failed to load security data:', error);
    }
  };

  const handleViewBackupCodes = async () => {
    setIsLoading(true);
    try {
      const codes = await apiService.get('/api/security/backup-codes');
      setBackupCodes(codes || []);
      setIsBackupCodesModalOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to retrieve backup codes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateCodes = async () => {
    setIsLoading(true);
    try {
      const newCodes = await apiService.post('/api/security/backup-codes/regenerate', {});
      setBackupCodes(newCodes || []);
      
      toast({
        title: "Backup Codes Regenerated",
        description: "New backup codes have been generated. Make sure to save them securely.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate backup codes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await apiService.delete(`/api/security/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      toast({
        title: "Session Revoked",
        description: "The session has been successfully revoked.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadAuditLog = async () => {
    try {
      const mockAuditData = {
        company: {
          name: "Sample Company Inc.",
          jurisdiction: "",
          reportingPeriod: ""
        },
        dateRange: `${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
        events: securityEvents.length > 0 ? securityEvents.map(event => ({
          timestamp: new Date(event.timestamp).toLocaleString(),
          userEmail: 'user@example.com',
          action: event.description,
          ipAddress: event.ipAddress,
          status: event.status === 'success' ? 'Success' : event.status === 'warning' ? 'Warning' : 'Error'
        })) : [
          {
            timestamp: '2025-07-03 17:30:01',
            userEmail: 'user@example.com',
            action: 'User Login',
            ipAddress: '78.10.22.3',
            status: 'Success'
          },
          {
            timestamp: '2025-07-03 16:45:22',
            userEmail: 'user@example.com',
            action: 'Password Change',
            ipAddress: '78.10.22.3',
            status: 'Success'
          },
          {
            timestamp: '2025-07-03 14:20:15',
            userEmail: 'admin@example.com',
            action: 'API Key Generated',
            ipAddress: '192.168.1.100',
            status: 'Success'
          }
        ]
      };

      const blob = await pdfExportService.generateSecurityAuditLog(mockAuditData);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security_audit_log_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Security audit log download has started.",
      });
    } catch (error) {
      console.error('Audit log download error:', error);
      toast({
        title: "Error",
        description: "Failed to download audit log. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <Shield className="h-4 w-4 text-green-600" />;
      case 'password_change': return <Key className="h-4 w-4 text-blue-600" />;
      case 'failed_login': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventBadgeColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-50 text-green-700 border-green-200';
      case 'warning': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'error': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Password & Authentication</CardTitle>
          <CardDescription>
            Manage your password and authentication settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
            <Button>Update Password</Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-green-600" />
                <div>
                  <Label>Two-Factor Authentication (2FA)</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Enabled
                </Badge>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="pl-8 space-y-3">
              <p className="text-sm text-muted-foreground">
                2FA is currently enabled using your authenticator app.
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handleViewBackupCodes} disabled={isLoading}>
                  View Backup Codes
                </Button>
                <Button variant="outline" size="sm" onClick={handleRegenerateCodes} disabled={isLoading}>
                  Regenerate Codes
                </Button>
              </div>
            </div>

            <Dialog open={isBackupCodesModalOpen} onOpenChange={setIsBackupCodesModalOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Two-Factor Authentication Backup Codes</DialogTitle>
                  <DialogDescription>
                    Save these backup codes in a secure location. Each code can only be used once to access your account if you lose your authenticator device.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2 py-4">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded font-mono text-center">
                      {code}
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBackupCodesModalOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={handleRegenerateCodes} disabled={isLoading}>
                    {isLoading ? 'Regenerating...' : 'Regenerate Codes'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Management</CardTitle>
          <CardDescription>
            Monitor and manage your active sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active sessions found.
              </div>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`h-2 w-2 rounded-full ${session.isCurrent ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div>
                      <p className="text-sm font-medium">{session.device}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.browser} • {session.location} • {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {session.isCurrent ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Current
                    </Badge>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleRevokeSession(session.id)}>
                      Revoke
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>

          <Button variant="destructive" size="sm">
            Revoke All Sessions
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Control how your data is used and shared
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Analytics & Usage Data</Label>
                <p className="text-sm text-muted-foreground">
                  Help improve the platform by sharing usage data
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Marketing Communications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive product updates and industry insights
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Data Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Share anonymized data for research purposes
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Audit</CardTitle>
          <CardDescription>
            Review security events and download audit logs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {securityEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No security events recorded yet.
              </div>
            ) : (
              securityEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getEventIcon(event.type)}
                    <div>
                      <p className="text-sm font-medium">{event.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString()} from {event.ipAddress}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getEventBadgeColor(event.status)}>
                    {event.status === 'success' ? 'Success' : event.status === 'warning' ? 'Warning' : 'Error'}
                  </Badge>
                </div>
              ))
            )}
          </div>

          <div className="flex space-x-2">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View All Events
            </Button>
            <Button variant="outline" onClick={handleDownloadAuditLog}>
              <Download className="h-4 w-4 mr-2" />
              Download Audit Log
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-red-700">Delete Account</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive">
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
