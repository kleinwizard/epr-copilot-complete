
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supplyChainIntegrationService } from '@/services/supplyChainIntegrationService';
import { SupplyChainIntegration } from '@/types/integrations';
import { useToast } from '@/hooks/use-toast';

export const SupplyChainIntegrations = () => {
  const [integrations, setIntegrations] = useState<SupplyChainIntegration[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = () => {
    const data = supplyChainIntegrationService.getIntegrations();
    setIntegrations(data);
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const supplier = formData.get('supplier') as string;
    const type = formData.get('type') as SupplyChainIntegration['type'];
    const apiEndpoint = formData.get('apiEndpoint') as string;
    const dataFormat = formData.get('dataFormat') as SupplyChainIntegration['dataFormat'];
    const certificationsStr = formData.get('certifications') as string;
    const certifications = certificationsStr.split(',').map(c => c.trim()).filter(c => c);

    try {
      await supplyChainIntegrationService.addIntegration({
        supplier,
        type,
        status: 'pending',
        apiEndpoint,
        dataFormat,
        certifications
      });

      toast({
        title: "Integration Added",
        description: `${supplier} integration has been added successfully.`,
      });

      setIsAddDialogOpen(false);
      loadIntegrations();
    } catch (error) {
      toast({
        title: "Failed to Add",
        description: "Failed to add supply chain integration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (integrationId: string) => {
    setIsLoading(true);
    try {
      const result = await supplyChainIntegrationService.syncData(integrationId);
      toast({
        title: "Sync Complete",
        description: `Synced ${result.materialsUpdated} materials and verified ${result.certificationsVerified} certifications.`,
      });
      loadIntegrations();
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync supply chain data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async (integrationId: string) => {
    setIsLoading(true);
    try {
      const success = await supplyChainIntegrationService.testConnection(integrationId);
      if (success) {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to the supplier API.",
        });
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the supplier API.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: SupplyChainIntegration['status']) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTypeIcon = (type: SupplyChainIntegration['type']) => {
    const icons = {
      raw_materials: '🏭',
      packaging: '📦',
      finished_goods: '🎁',
      logistics: '🚛'
    };
    return icons[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Supply Chain Integrations</h2>
          <p className="text-gray-600">Connect with suppliers and track materials throughout the supply chain</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Supplier Integration</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Supply Chain Integration</DialogTitle>
              <DialogDescription>
                Connect with a new supplier or logistics partner.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <Label htmlFor="supplier">Supplier Name</Label>
                <Input
                  id="supplier"
                  name="supplier"
                  placeholder="Green Materials Inc"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Integration Type</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="raw_materials">Raw Materials</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                    <SelectItem value="finished_goods">Finished Goods</SelectItem>
                    <SelectItem value="logistics">Logistics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="apiEndpoint">API Endpoint</Label>
                <Input
                  id="apiEndpoint"
                  name="apiEndpoint"
                  placeholder="https://api.supplier.com/v1"
                  type="url"
                />
              </div>
              <div>
                <Label htmlFor="dataFormat">Data Format</Label>
                <Select name="dataFormat" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="xml">XML</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="edi">EDI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                <Textarea
                  id="certifications"
                  name="certifications"
                  placeholder="FSC, PEFC, Recyclable"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Integration'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(integration.type)}</span>
                  <div>
                    <CardTitle className="text-lg">{integration.supplier}</CardTitle>
                    <CardDescription className="capitalize">
                      {integration.type.replace('_', ' ')}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(integration.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Format:</span> {integration.dataFormat.toUpperCase()}
                </div>

                {integration.certifications.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Certifications:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {integration.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {integration.lastUpdate && (
                  <p className="text-xs text-gray-500">
                    Last update: {new Date(integration.lastUpdate).toLocaleString()}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTest(integration.id)}
                    disabled={isLoading}
                  >
                    Test
                  </Button>
                  {integration.status === 'active' && (
                    <Button
                      size="sm"
                      onClick={() => handleSync(integration.id)}
                      disabled={isLoading}
                    >
                      Sync
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
          <div className="text-6xl mb-4">🏭</div>
          <h3 className="text-lg font-semibold mb-2">No Supply Chain Integrations</h3>
          <p className="text-gray-600 mb-4">Connect with your first supplier to get started</p>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Integration</Button>
            </DialogTrigger>
          </Dialog>
        </div>
      )}
    </div>
  );
};
