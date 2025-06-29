
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { webhookService } from '@/services/webhookService';
import { Webhook, WebhookLog } from '@/types/integrations';
import { useToast } from '@/hooks/use-toast';

export const WebhookManager = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadWebhooks();
  }, []);

  useEffect(() => {
    if (selectedWebhook) {
      loadLogs(selectedWebhook);
    }
  }, [selectedWebhook]);

  const loadWebhooks = () => {
    const data = webhookService.getWebhooks();
    setWebhooks(data);
    if (data.length > 0 && !selectedWebhook) {
      setSelectedWebhook(data[0].id);
    }
  };

  const loadLogs = (webhookId: string) => {
    const webhookLogs = webhookService.getWebhookLogs(webhookId);
    setLogs(webhookLogs);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const url = formData.get('url') as string;
    const eventsStr = formData.get('events') as string;
    const secret = formData.get('secret') as string;
    const headersStr = formData.get('headers') as string;
    const retryCount = parseInt(formData.get('retryCount') as string) || 3;

    const events = eventsStr.split(',').map(e => e.trim()).filter(e => e);
    
    let headers: Record<string, string> = {};
    try {
      headers = headersStr ? JSON.parse(headersStr) : {};
    } catch (error) {
      toast({
        title: "Invalid Headers",
        description: "Headers must be valid JSON format.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      await webhookService.createWebhook({
        name,
        url,
        events,
        secret: secret || undefined,
        isActive: true,
        retryCount,
        headers
      });

      toast({
        title: "Webhook Created",
        description: `${name} webhook has been created successfully.`,
      });

      setIsCreateDialogOpen(false);
      loadWebhooks();
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create webhook.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async (webhookId: string) => {
    setIsLoading(true);
    try {
      const success = await webhookService.testWebhook(webhookId);
      if (success) {
        toast({
          title: "Webhook Test Successful",
          description: "Test payload delivered successfully.",
        });
      } else {
        throw new Error('Test failed');
      }
      loadLogs(webhookId);
    } catch (error) {
      toast({
        title: "Webhook Test Failed",
        description: "Failed to deliver test payload.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (webhookId: string, isActive: boolean) => {
    try {
      await webhookService.updateWebhook(webhookId, { isActive });
      toast({
        title: isActive ? "Webhook Activated" : "Webhook Deactivated",
        description: `The webhook has been ${isActive ? 'activated' : 'deactivated'}.`,
      });
      loadWebhooks();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update webhook status.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: WebhookLog['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Webhook Manager</h2>
          <p className="text-gray-600">Manage webhooks for real-time event notifications</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Webhook</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Webhook</DialogTitle>
              <DialogDescription>
                Set up a new webhook to receive real-time notifications.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Webhook Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Product Update Webhook"
                  required
                />
              </div>

              <div>
                <Label htmlFor="url">Webhook URL</Label>
                <Input
                  id="url"
                  name="url"
                  placeholder="https://api.example.com/webhooks"
                  type="url"
                  required
                />
              </div>

              <div>
                <Label htmlFor="events">Events (comma-separated)</Label>
                <Textarea
                  id="events"
                  name="events"
                  placeholder="product.created, product.updated, product.deleted"
                  rows={2}
                  required
                />
              </div>

              <div>
                <Label htmlFor="secret">Secret (optional)</Label>
                <Input
                  id="secret"
                  name="secret"
                  placeholder="webhook_secret_key"
                  type="password"
                />
              </div>

              <div>
                <Label htmlFor="retryCount">Retry Count</Label>
                <Input
                  id="retryCount"
                  name="retryCount"
                  type="number"
                  defaultValue="3"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <Label htmlFor="headers">Headers (JSON format)</Label>
                <Textarea
                  id="headers"
                  name="headers"
                  placeholder='{"Content-Type": "application/json"}'
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Webhook'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="webhooks" className="w-full">
        <TabsList>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{webhook.name}</CardTitle>
                      <CardDescription className="mt-1 truncate">{webhook.url}</CardDescription>
                    </div>
                    <Switch
                      checked={webhook.isActive}
                      onCheckedChange={(checked) => handleToggleActive(webhook.id, checked)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="font-medium">Events:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {webhook.events.slice(0, 3).map((event, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                        {webhook.events.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{webhook.events.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Success Rate:</span>
                        <div className="text-green-600">{webhook.successRate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="font-medium">Retries:</span>
                        <div className="text-blue-600">{webhook.retryCount}</div>
                      </div>
                    </div>

                    {webhook.lastTriggered && (
                      <p className="text-xs text-gray-500">
                        Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTest(webhook.id)}
                        disabled={isLoading || !webhook.isActive}
                      >
                        Test
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedWebhook(webhook.id)}
                      >
                        View Logs
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {webhooks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔗</div>
              <h3 className="text-lg font-semibold mb-2">No Webhooks</h3>
              <p className="text-gray-600 mb-4">Create your first webhook to get started</p>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Create Webhook</Button>
                </DialogTrigger>
              </Dialog>
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          {selectedWebhook && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Delivery Logs for {webhooks.find(w => w.id === selectedWebhook)?.name}
              </h3>
              <div className="space-y-2">
                {logs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{log.event}</Badge>
                            {getStatusBadge(log.status)}
                            {log.retryCount > 0 && (
                              <Badge variant="outline" className="text-xs">
                                Retry {log.retryCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                          {log.response && (
                            <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                              {typeof log.response === 'object' ? JSON.stringify(log.response) : log.response}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {logs.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No delivery logs yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
