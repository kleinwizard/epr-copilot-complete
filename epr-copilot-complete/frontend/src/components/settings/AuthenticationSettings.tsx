
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MFASetup } from '@/components/auth/MFASetup';
import { SSOConfiguration } from '@/components/auth/SSOConfiguration';
import { PasswordManagement } from '@/components/auth/PasswordManagement';
import { UserManagement } from '@/components/auth/UserManagement';

export function AuthenticationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Authentication & Security</h2>
        <p className="text-muted-foreground">
          Manage authentication methods and security settings for your organization
        </p>
      </div>

      <Tabs defaultValue="password" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="mfa">Multi-Factor Auth</TabsTrigger>
          <TabsTrigger value="sso">Single Sign-On</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <PasswordManagement />
        </TabsContent>

        <TabsContent value="mfa">
          <MFASetup />
        </TabsContent>

        <TabsContent value="sso">
          <SSOConfiguration />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
