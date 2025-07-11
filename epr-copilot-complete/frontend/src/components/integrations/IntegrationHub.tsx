
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cloud, Database, Package, FileText, Settings, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'error';
  category: 'erp' | 'accounting' | 'shipping' | 'other';
  lastSync?: string;
}

export const IntegrationHub = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: '1',
      name: 'SAP ERP',
      description: 'Sync product and material data with SAP',
      icon: <Database className="h-8 w-8" />,
      status: 'connected',
      category: 'erp',
      lastSync: '2024-01-20 14:30'
    },
    {
      id: '2',
      name: 'QuickBooks',
      description: 'Export fee calculations and reports',
      icon: <FileText className="h-8 w-8" />,
      status: 'disconnected',
      category: 'accounting'
    },
    {
      id: '3',
      name: 'Salesforce',
      description: 'Import customer and product information',
      icon: <Cloud className="h-8 w-8" />,
      status: 'connected',
      category: 'other',
      lastSync: '2024-01-19 09:15'
    },
    {
      id: '4',
      name: 'FedEx Ship Manager',
      description: 'Track shipments and packaging data',
      icon: <Package className="h-8 w-8" />,
      status: 'error',
      category: 'shipping'
    }
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === id) {
        const newStatus = integration.status === 'connected' ? 'disconnected' : 'connected';
        toast({
          title: newStatus === 'connected' ? 'Integration Connected' : 'Integration Disconnected',
          description: `${integration.name} has been ${newStatus === 'connected' ? 'connected' : 'disconnected'}.`,
        });
        return {
          ...integration,
          status: newStatus,
          lastSync: newStatus === 'connected' ? new Date().toLocaleString() : integration.lastSync
        };
      }
      return integration;
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-gray-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="secondary">Disconnected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };

  const filterIntegrationsByCategory = (category: string) => {
    if (category === 'all') return integrations;
    return integrations.filter(integration => integration.category === category);
  };

  const renderIntegrationCards = (filteredIntegrations: Integration[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredIntegrations.map((integration) => (
        <Card key={integration.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {integration.icon}
                <div>
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  {getStatusBadge(integration.status)}
                </div>
              </div>
              {getStatusIcon(integration.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>{integration.description}</CardDescription>
            {integration.lastSync && (
              <p className="text-sm text-muted-foreground">
                Last sync: {integration.lastSync}
              </p>
            )}
            <div className="flex items-center justify-between">
              <Switch
                checked={integration.status === 'connected'}
                onCheckedChange={() => handleToggleIntegration(integration.id)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedIntegration(integration);
                  setShowConfigDialog(true);
                }}
              >
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integration Hub</h1>
        <p className="text-muted-foreground">Connect your EPR system with external services and platforms</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Integrations</TabsTrigger>
          <TabsTrigger value="erp">ERP Systems</TabsTrigger>
          <TabsTrigger value="accounting">Accounting</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {renderIntegrationCards(filterIntegrationsByCategory('all'))}
        </TabsContent>

        <TabsContent value="erp" className="space-y-4">
          {renderIntegrationCards(filterIntegrationsByCategory('erp'))}
        </TabsContent>

        <TabsContent value="accounting" className="space-y-4">
          {renderIntegrationCards(filterIntegrationsByCategory('accounting'))}
        </TabsContent>

        <TabsContent value="shipping" className="space-y-4">
          {renderIntegrationCards(filterIntegrationsByCategory('shipping'))}
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          {renderIntegrationCards(filterIntegrationsByCategory('other'))}
        </TabsContent>
      </Tabs>

      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configure {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Update your integration settings and credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="api-key" className="text-right">
                API Key
              </Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter API key"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endpoint" className="text-right">
                Endpoint
              </Label>
              <Input
                id="endpoint"
                placeholder="https://api.example.com"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => {
              toast({
                title: "Configuration Saved",
                description: "Integration settings have been updated.",
              });
              setShowConfigDialog(false);
            }}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
