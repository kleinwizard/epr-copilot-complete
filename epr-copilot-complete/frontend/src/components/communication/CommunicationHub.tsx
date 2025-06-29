
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { InAppMessaging } from './InAppMessaging';
import { VendorPortal } from './VendorPortal';
import { SharedWorkspaces } from './SharedWorkspaces';
import { KnowledgeBase } from './KnowledgeBase';

export const CommunicationHub = () => {
  const [activeTab, setActiveTab] = useState('messaging');

  const communicationStats = {
    unreadMessages: 12,
    activeVendors: 8,
    sharedWorkspaces: 5,
    knowledgeArticles: 58
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Communication & Collaboration</h1>
          <p className="text-gray-600 mt-2">Connect with your team, vendors, and access knowledge resources</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{communicationStats.unreadMessages}</div>
            <p className="text-xs text-gray-500">unread messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{communicationStats.activeVendors}</div>
            <p className="text-xs text-gray-500">connected vendors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Workspaces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{communicationStats.sharedWorkspaces}</div>
            <p className="text-xs text-gray-500">shared workspaces</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{communicationStats.knowledgeArticles}</div>
            <p className="text-xs text-gray-500">articles available</p>
          </CardContent>
        </Card>
      </div>

      {/* Communication Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Portal</TabsTrigger>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        </TabsList>

        <TabsContent value="messaging" className="mt-6">
          <InAppMessaging />
        </TabsContent>

        <TabsContent value="vendors" className="mt-6">
          <VendorPortal />
        </TabsContent>

        <TabsContent value="workspaces" className="mt-6">
          <SharedWorkspaces />
        </TabsContent>

        <TabsContent value="knowledge" className="mt-6">
          <KnowledgeBase />
        </TabsContent>
      </Tabs>
    </div>
  );
};
