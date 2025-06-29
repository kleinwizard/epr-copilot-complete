
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ecommerceIntegrationService } from '@/services/ecommerceIntegrationService';
import { EcommerceIntegration } from '@/types/integrations';
import { useToast } from '@/hooks/use-toast';

export const EcommerceIntegrations = () => {
  const [integrations, setIntegrations] = useState<EcommerceIntegration[]>([]);
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = () => {
    const data = ecommerceIntegrationService.getIntegrations();
    setIntegrations(data);
  };

  const handleConnect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const platform = formData.get('platform') as EcommerceIntegration['platform'];
    const name = formData.get('name') as string;
    const storeUrl = formData.get('storeUrl') as string;
    const apiKey = formData.get('apiKey') as string;

    try {
      await ecommerceIntegrationService.connectIntegration({
        platform,
        name,
        storeUrl,
        apiKey,
        syncFrequency: 'hourly',
        dataTypes: ['products', 'orders', 'inventory']
      });

      toast({
        title: "Integration Added",
        description: `${name} integration is being connected...`,
      });

      setIsConnectDialogOpen(false);
      loadIntegrations();
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect integration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (integrationId: string) => {
    setIsLoading(true);
    try {
      await ecommerceIntegrationService.syncIntegration(integrationId);
      toast({
        title: "Sync Complete",
        description: "Integration data has been synchronized.",
      });
      loadIntegrations();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync integration data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = (integrationId: string) => {
    ecommerceIntegrationService.disconnectIntegration(integrationId);
    toast({
      title: "Integration Disconnected",
      description: "The integration has been disconnected.",
    });
    loadIntegrations();
  };

  const getStatusBadge = (status: EcommerceIntegration['status']) => {
    const variants = {
      connected: 'bg-green-100 text-green-800',
      disconnected: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPlatformLogo = (platform: EcommerceIntegration['platform']) => {
    const logos = {
      shopify: '🛍️',
      amazon: '📦',
      ebay: '🏷️',
      woocommerce: '🛒',
      magento: '🎯',
      bigcommerce: '🏪'
    };
    return logos[platform];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">E-commerce Integrations</h2>
          <p className="text-gray-600">Connect your online stores and marketplaces</p>
        </div>
        <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
          <DialogTrigger asChild>
            <Button>Connect New Platform</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect E-commerce Platform</DialogTitle>
              <DialogDescription>
                Add a new e-commerce integration to sync your product and order data.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleConnect} className="space-y-4">
              <div>
                <Label htmlFor="platform">Platform</Label>
                <Select name="platform" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shopify">Shopify</SelectItem>
                    <SelectItem value="amazon">Amazon</SelectItem>
                    <SelectItem value="ebay">eBay</SelectItem>
                    <SelectItem value="woocommerce">WooCommerce</SelectItem>
                    <SelectItem value="magento">Magento</SelectItem>
                    <SelectItem value="bigcommerce">BigCommerce</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Integration Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="My Store"
                  required
                />
              </div>
              <div>
                <Label htmlFor="storeUrl">Store URL</Label>
                <Input
                  id="storeUrl"
                  name="storeUrl"
                  placeholder="https://mystore.com"
                  type="url"
                />
              </div>
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  name="apiKey"
                  placeholder="Enter your API key"
                  type="password"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Connecting...' : 'Connect'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getPlatformLogo(integration.platform)}</span>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <CardDescription className="capitalize">{integration.platform}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(integration.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {integration.storeUrl && (
                  <p className="text-sm text-gray-600 truncate">{integration.storeUrl}</p>
                )}
                
                {integration.status === 'connected' && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Products:</span>
                      <div className="text-blue-600">{integration.productCount?.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="font-medium">Orders:</span>
                      <div className="text-green-600">{integration.orderCount?.toLocaleString()}</div>
                    </div>
                  </div>
                )}

                {integration.lastSync && (
                  <p className="text-xs text-gray-500">
                    Last sync: {new Date(integration.lastSync).toLocaleString()}
                  </p>
                )}

                <div className="flex gap-2">
                  {integration.status === 'connected' ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSync(integration.id)}
                        disabled={isLoading}
                      >
                        Sync Now
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDisconnect(integration.id)}
                      >
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleSync(integration.id)}
                      disabled={isLoading}
                    >
                      Reconnect
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {integrations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="text-lg font-semibold mb-2">No E-commerce Integrations</h3>
          <p className="text-gray-600 mb-4">Connect your first e-commerce platform to get started</p>
          <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
            <DialogTrigger asChild>
              <Button>Connect Platform</Button>
            </DialogTrigger>
          </Dialog>
        </div>
      )}
    </div>
  );
};
