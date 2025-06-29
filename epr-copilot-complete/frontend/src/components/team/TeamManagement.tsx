
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamOverview } from './TeamOverview';
import { TeamMembersList } from './TeamMembersList';
import { TeamInvitations } from './TeamInvitations';
import { RolePermissions } from './RolePermissions';

export function TeamManagement() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Team Management</h1>
        <p className="text-muted-foreground">
          Manage team members, roles, and permissions for your organization.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="permissions">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <TeamOverview />
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <TeamMembersList />
        </TabsContent>

        <TabsContent value="invitations" className="space-y-6">
          <TeamInvitations />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <RolePermissions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
