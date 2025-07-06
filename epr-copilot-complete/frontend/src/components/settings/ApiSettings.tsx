
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Key, Copy, Eye, EyeOff, Plus, Trash2, RefreshCw, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

interface ApiUsage {
  requestsToday: number;
  successRate: number;
  avgResponse: number;
  rateLimit: string;
}

export function ApiSettings() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [apiUsage, setApiUsage] = useState<ApiUsage>({
    requestsToday: 0,
    successRate: 0,
    avgResponse: 0,
    rateLimit: '1,000 requests/hour'
  });
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddWebhookModalOpen, setIsAddWebhookModalOpen] = useState(false);
  const [webhookData, setWebhookData] = useState({
    name: '',
    url: '',
    events: [] as string[]
  });
  const [webhooks, setWebhooks] = useState([
    {
      id: '1',
      name: 'Report Submission Webhook',
      url: 'https://api.company.com/webhooks/epr-reports',
      status: 'active' as const,
      events: ['report.submitted', 'report.approved']
    },
    {
      id: '2',
      name: 'Fee Updates Webhook',
      url: 'https://api.company.com/webhooks/fee-updates',
      status: 'inactive' as const,
      events: ['fee.updated', 'fee.calculated']
    }
  ]);
  const { toast } = useToast();

  useEffect(() => {
    loadApiData();
  }, []);

  const loadApiData = async () => {
    try {
      const [keys, usage] = await Promise.all([
        apiService.get('/api/settings/api-keys'),
        apiService.get('/api/settings/api-usage')
      ]);
      
      setApiKeys(keys || []);
      setApiUsage(usage || {
        requestsToday: 0,
        successRate: 0,
        avgResponse: 0,
        rateLimit: '1,000 requests/hour'
      });
    } catch (error) {
      console.error('Failed to load API data:', error);
    }
  };

  const handleGenerateApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for the API key.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const newKey = await apiService.post('/api/settings/api-keys', {
        name: newKeyName
      });
      
      setApiKeys(prev => [...prev, newKey]);
      setNewKeyName('');
      setIsGenerateModalOpen(false);
      
      toast({
        title: "API Key Generated",
        description: "Your new API key has been generated. Make sure to copy it now as it won't be shown again.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyApiKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      toast({
        title: "Copied",
        description: "API key copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy API key.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      await apiService.delete(`/api/settings/api-keys/${keyId}`);
      setApiKeys(prev => prev.filter(k => k.id !== keyId));
      
      toast({
        title: "API Key Deleted",
        description: "The API key has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddWebhook = async () => {
    if (!webhookData.name.trim() || !webhookData.url.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a name and URL for the webhook.",
        variant: "destructive",
      });
      return;
    }

    if (!webhookData.url.startsWith('https://')) {
      toast({
        title: "Invalid URL",
        description: "Webhook URL must use HTTPS for security.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const newWebhook = await apiService.post('/api/settings/webhooks', {
        name: webhookData.name,
        url: webhookData.url,
        events: webhookData.events
      });
      
      setWebhooks(prev => [...prev, newWebhook]);
      setWebhookData({ name: '', url: '', events: [] });
      setIsAddWebhookModalOpen(false);
      
      toast({
        title: "Webhook Added",
        description: "Your webhook has been successfully configured.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add webhook. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    try {
      await apiService.post(`/api/settings/webhooks/${webhookId}/test`, {});
      toast({
        title: "Test Sent",
        description: "A test payload has been sent to your webhook endpoint.",
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to send test webhook. Please check your endpoint.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage API keys for integrating with external systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {apiKeys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No API keys generated yet. Create your first API key below.
              </div>
            ) : (
              apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Key className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{apiKey.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Created on {new Date(apiKey.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={apiKey.status === 'active' ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
                        {apiKey.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => handleCopyApiKey(apiKey.key)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteApiKey(apiKey.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`api-key-${apiKey.id}`}>API Key</Label>
                    <div className="flex space-x-2">
                      <Input
                        id={`api-key-${apiKey.id}`}
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey.key}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleCopyApiKey(apiKey.key)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Separator />

          <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate New API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Generate New API Key</DialogTitle>
                <DialogDescription>
                  Create a new API key for integrating with external systems. Make sure to copy it after generation as it won't be shown again.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">API Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g., Production Integration"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGenerateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerateApiKey} disabled={isLoading}>
                  {isLoading ? 'Generating...' : 'Generate Key'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Endpoints</CardTitle>
          <CardDescription>
            Configure webhooks to receive real-time notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {webhooks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No webhooks configured yet. Add your first webhook below.
              </div>
            ) : (
              webhooks.map((webhook) => (
                <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{webhook.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {webhook.url}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={webhook.status === 'active' ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
                      {webhook.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => handleTestWebhook(webhook.id)}>
                      Test
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <Dialog open={isAddWebhookModalOpen} onOpenChange={setIsAddWebhookModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Webhook</DialogTitle>
                <DialogDescription>
                  Configure a webhook endpoint to receive real-time notifications about EPR events.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-name">Webhook Name</Label>
                  <Input
                    id="webhook-name"
                    placeholder="e.g., Production Notifications"
                    value={webhookData.name}
                    onChange={(e) => setWebhookData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://your-domain.com/webhook"
                    value={webhookData.url}
                    onChange={(e) => setWebhookData(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Events to Subscribe</Label>
                  <div className="space-y-2">
                    {['report.submitted', 'report.approved', 'fee.updated', 'fee.calculated', 'compliance.deadline'].map((event) => (
                      <div key={event} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={event}
                          checked={webhookData.events.includes(event)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setWebhookData(prev => ({ ...prev, events: [...prev.events, event] }));
                            } else {
                              setWebhookData(prev => ({ ...prev, events: prev.events.filter(e => e !== event) }));
                            }
                          }}
                        />
                        <Label htmlFor={event} className="text-sm">{event}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddWebhookModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddWebhook} disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Webhook'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card className="opacity-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Third-Party Integrations</span>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
          <CardDescription>
            Connect with external platforms and services (feature in development)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 space-y-3 opacity-60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <h4 className="font-medium">Zapier</h4>
                </div>
                <Switch disabled />
              </div>
              <p className="text-sm text-muted-foreground">
                Automate workflows with 5000+ apps
              </p>
              <Button variant="outline" size="sm" className="w-full" disabled>
                Configure
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-3 opacity-60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-blue-600 rounded"></div>
                  <h4 className="font-medium">Salesforce</h4>
                </div>
                <Switch disabled />
              </div>
              <p className="text-sm text-muted-foreground">
                Sync data with your CRM system
              </p>
              <Button variant="outline" size="sm" className="w-full" disabled>
                Connect
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-3 opacity-60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-green-600 rounded"></div>
                  <h4 className="font-medium">QuickBooks</h4>
                </div>
                <Switch disabled />
              </div>
              <p className="text-sm text-muted-foreground">
                Sync fee data with accounting
              </p>
              <Button variant="outline" size="sm" className="w-full" disabled>
                Connect
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-3 opacity-60">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-orange-600 rounded"></div>
                  <h4 className="font-medium">Slack</h4>
                </div>
                <Switch disabled />
              </div>
              <p className="text-sm text-muted-foreground">
                Get notifications in your workspace
              </p>
              <Button variant="outline" size="sm" className="w-full" disabled>
                Configure
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
          <CardDescription>
            Monitor your API usage and rate limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <p className="text-2xl font-bold text-blue-600">{apiUsage.requestsToday.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Requests Today</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-green-600">{apiUsage.successRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-purple-600">{apiUsage.avgResponse}ms</p>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Rate Limit</span>
            <Badge variant="outline">{apiUsage.rateLimit}</Badge>
          </div>

          <Button variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            View API Documentation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
