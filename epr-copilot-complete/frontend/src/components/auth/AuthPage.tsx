
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { PasswordManagement } from './PasswordManagement';
import { MFASetup } from './MFASetup';
import { UserManagement } from './UserManagement';
import { SSOConfiguration } from './SSOConfiguration';
import { Shield, Users, Key, Settings } from 'lucide-react';

export const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');

  const authStats = {
    totalUsers: 47,
    activeUsers: 42,
    mfaEnabled: 28,
    ssoConnections: 3
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Authentication & Security</h1>
          <p className="text-gray-600 mt-2">Manage user authentication, security settings, and access control</p>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{authStats.totalUsers}</div>
            <p className="text-xs text-gray-500">registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{authStats.activeUsers}</div>
            <p className="text-xs text-gray-500">last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Key className="h-4 w-4 mr-2" />
              MFA Enabled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{authStats.mfaEnabled}</div>
            <p className="text-xs text-gray-500">users with 2FA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              SSO Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{authStats.ssoConnections}</div>
            <p className="text-xs text-gray-500">active providers</p>
          </CardContent>
        </Card>
      </div>

      {/* Authentication Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="mfa">MFA Setup</TabsTrigger>
          <TabsTrigger value="passwords">Passwords</TabsTrigger>
          <TabsTrigger value="sso">SSO Config</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-6">
          <LoginForm />
        </TabsContent>

        <TabsContent value="register" className="mt-6">
          <RegisterForm />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="mfa" className="mt-6">
          <MFASetup />
        </TabsContent>

        <TabsContent value="passwords" className="mt-6">
          <PasswordManagement />
        </TabsContent>

        <TabsContent value="sso" className="mt-6">
          <SSOConfiguration />
        </TabsContent>
      </Tabs>
    </div>
  );
};
