
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EcommerceIntegrations } from './EcommerceIntegrations';
import { SupplyChainIntegrations } from './SupplyChainIntegrations';
import { CustomAPIBuilder } from './CustomAPIBuilder';
import { WebhookManager } from './WebhookManager';

export const IntegrationHub = () => {
  const [activeTab, setActiveTab] = useState('ecommerce');

  const [integrationStats, setIntegrationStats] = useState({
    ecommerce: { connected: 0, total: 0 },
    supplyChain: { connected: 0, total: 0 },
    apis: { active: 0, total: 0 },
    webhooks: { active: 0, total: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadIntegrationStats = async () => {
      try {
        setIsLoading(true);
        
        setIntegrationStats({
          ecommerce: { connected: 0, total: 0 },
          supplyChain: { connected: 0, total: 0 },
          apis: { active: 0, total: 0 },
          webhooks: { active: 0, total: 0 }
        });
      } catch (error) {
        console.error('Failed to load integration stats:', error);
        setIntegrationStats({
          ecommerce: { connected: 0, total: 0 },
          supplyChain: { connected: 0, total: 0 },
          apis: { active: 0, total: 0 },
          webhooks: { active: 0, total: 0 }
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadIntegrationStats();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Integration Hub</h1>
          <p className="text-gray-600 mt-2">Connect and manage all your external integrations</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">E-commerce</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? '...' : integrationStats.ecommerce.connected}
            </div>
            <p className="text-xs text-gray-500">of {integrationStats.ecommerce.total} connected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Supply Chain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? '...' : integrationStats.supplyChain.connected}
            </div>
            <p className="text-xs text-gray-500">of {integrationStats.supplyChain.total} connected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Custom APIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {isLoading ? '...' : integrationStats.apis.active}
            </div>
            <p className="text-xs text-gray-500">of {integrationStats.apis.total} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {isLoading ? '...' : integrationStats.webhooks.active}
            </div>
            <p className="text-xs text-gray-500">of {integrationStats.webhooks.total} active</p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
          <TabsTrigger value="supply-chain">Supply Chain</TabsTrigger>
          <TabsTrigger value="custom-apis">Custom APIs</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="ecommerce" className="mt-6">
          <EcommerceIntegrations />
        </TabsContent>

        <TabsContent value="supply-chain" className="mt-6">
          {/* DISABLED: SupplyChainIntegrations disabled for initial launch */}
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Feature Temporarily Disabled</h3>
              <p className="text-gray-500">Supply Chain Integrations are currently disabled for the initial launch.</p>
              <p className="text-gray-500">This feature will be available in a future release.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="custom-apis" className="mt-6">
          <CustomAPIBuilder />
        </TabsContent>

        <TabsContent value="webhooks" className="mt-6">
          <WebhookManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
