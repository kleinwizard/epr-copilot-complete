
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { systemAdminService } from '@/services/systemAdminService';
import { SystemSettings, SystemUser, AuditLog } from '@/types/admin';

export const SystemAdministration = () => {
  const [settings, setSettings] = useState<SystemSettings[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('general');

  useEffect(() => {
    loadSettings();
    loadUsers();
    loadAuditLogs();
  }, []);

  const loadSettings = () => {
    setSettings(systemAdminService.getSettings());
  };

  const loadUsers = () => {
    setUsers(systemAdminService.getUsers());
  };

  const loadAuditLogs = () => {
    setAuditLogs(systemAdminService.getAuditLogs(50));
  };

  const handleSettingUpdate = async (settingId: string, value: any) => {
    const success = await systemAdminService.updateSetting(settingId, value, 'admin@company.com');
    if (success) {
      loadSettings();
      loadAuditLogs();
    }
  };

  const filteredSettings = settings.filter(setting => setting.category === selectedCategory);

  const settingCategories = [
    { value: 'general', label: 'General' },
    { value: 'security', label: 'Security' },
    { value: 'notifications', label: 'Notifications' },
    { value: 'integrations', label: 'Integrations' },
    { value: 'compliance', label: 'Compliance' }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Manage system-wide settings and configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-6">
                {settingCategories.map(category => (
                  <Button
                    key={category.value}
                    variant={selectedCategory === category.value ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    {category.label}
                  </Button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredSettings.map(setting => (
                  <div key={setting.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Label className="font-medium">{setting.name}</Label>
                        <p className="text-sm text-gray-500">{setting.description}</p>
                      </div>
                      {setting.isRequired && (
                        <Badge variant="secondary">Required</Badge>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      {setting.type === 'boolean' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={setting.value}
                            onChange={(e) => handleSettingUpdate(setting.id, e.target.checked)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">{setting.value ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      ) : (
                        <Input
                          type={setting.type === 'number' ? 'number' : 'text'}
                          value={setting.value}
                          onChange={(e) => {
                            const value = setting.type === 'number' ? 
                              parseInt(e.target.value) : e.target.value;
                            handleSettingUpdate(setting.id, value);
                          }}
                          placeholder={`Enter ${setting.name.toLowerCase()}`}
                        />
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-400 mt-2">
                      Last updated by {setting.updatedBy} on {new Date(setting.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage system users and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map(user => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={user.isActive ? 'default' : 'secondary'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">{user.role}</Badge>
                          {user.department && (
                            <Badge variant="outline">{user.department}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</div>
                        <div>Created: {new Date(user.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>View system activity and security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map(log => (
                  <div key={log.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{log.action}</div>
                        <div className="text-sm text-gray-600">
                          {log.userEmail} performed {log.action} on {log.entityType}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Badge 
                        variant={
                          log.severity === 'critical' ? 'destructive' :
                          log.severity === 'high' ? 'default' :
                          log.severity === 'medium' ? 'secondary' : 'outline'
                        }
                      >
                        {log.severity}
                      </Badge>
                    </div>
                    {Object.keys(log.details).length > 0 && (
                      <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                        <pre>{JSON.stringify(log.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
