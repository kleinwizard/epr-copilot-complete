
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { InAppMessaging } from './InAppMessaging';
import { VendorPortal } from './VendorPortal';
import { SharedWorkspaces } from './SharedWorkspaces';

export const CommunicationHub = () => {
  const [activeTab, setActiveTab] = useState('messaging');
  const [communicationStats, setCommunicationStats] = useState({
    unreadMessages: 0,
    activeVendors: 0,
    sharedWorkspaces: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCommunicationStats = async () => {
      try {
        setIsLoading(true);
        
        setCommunicationStats({
          unreadMessages: 0,
          activeVendors: 0,
          sharedWorkspaces: 0
        });
      } catch (error) {
        console.error('Failed to load communication stats:', error);
        setCommunicationStats({
          unreadMessages: 0,
          activeVendors: 0,
          sharedWorkspaces: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCommunicationStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Communication &amp; Collaboration</h1>
          <p className="text-gray-600 mt-2">Connect with your team, vendors, and access knowledge resources</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? '...' : communicationStats.unreadMessages}
            </div>
            <p className="text-xs text-gray-500">unread messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? '...' : communicationStats.activeVendors}
            </div>
            <p className="text-xs text-gray-500">connected vendors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Workspaces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {isLoading ? '...' : communicationStats.sharedWorkspaces}
            </div>
            <p className="text-xs text-gray-500">shared workspaces</p>
          </CardContent>
        </Card>

      </div>

      {/* Communication Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Portal</TabsTrigger>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
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

      </Tabs>
    </div>
  );
};
