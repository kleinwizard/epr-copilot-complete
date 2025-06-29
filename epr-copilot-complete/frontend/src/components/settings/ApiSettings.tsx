
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Key, Copy, Eye, EyeOff, Plus, Trash2, RefreshCw, Zap } from 'lucide-react';
import { useState } from 'react';

export function ApiSettings() {
  const [showApiKey, setShowApiKey] = useState(false);

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
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Key className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Production API Key</p>
                  <p className="text-sm text-muted-foreground">
                    Created on March 15, 2024
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex space-x-2">
                <Input
                  id="api-key"
                  type={showApiKey ? 'text' : 'password'}
                  value="epr_live_sk_12345abcdef67890"
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
                <Button variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Generate New API Key
          </Button>
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
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Report Submission Webhook</p>
                <p className="text-sm text-muted-foreground font-mono">
                  https://api.company.com/webhooks/epr-reports
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
                <Button variant="outline" size="sm">
                  Test
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Fee Updates Webhook</p>
                <p className="text-sm text-muted-foreground font-mono">
                  https://api.company.com/webhooks/fee-updates
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  Inactive
                </Badge>
                <Button variant="outline" size="sm">
                  Test
                </Button>
              </div>
            </div>
          </div>

          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Webhook
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Third-Party Integrations</CardTitle>
          <CardDescription>
            Connect with external platforms and services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <h4 className="font-medium">Zapier</h4>
                </div>
                <Switch defaultChecked />
              </div>
              <p className="text-sm text-muted-foreground">
                Automate workflows with 5000+ apps
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Configure
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-blue-600 rounded"></div>
                  <h4 className="font-medium">Salesforce</h4>
                </div>
                <Switch />
              </div>
              <p className="text-sm text-muted-foreground">
                Sync data with your CRM system
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Connect
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-green-600 rounded"></div>
                  <h4 className="font-medium">QuickBooks</h4>
                </div>
                <Switch />
              </div>
              <p className="text-sm text-muted-foreground">
                Sync fee data with accounting
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Connect
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-orange-600 rounded"></div>
                  <h4 className="font-medium">Slack</h4>
                </div>
                <Switch defaultChecked />
              </div>
              <p className="text-sm text-muted-foreground">
                Get notifications in your workspace
              </p>
              <Button variant="outline" size="sm" className="w-full">
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
              <p className="text-2xl font-bold text-blue-600">1,247</p>
              <p className="text-sm text-muted-foreground">Requests Today</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-green-600">98.5%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-purple-600">24ms</p>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Rate Limit</span>
            <Badge variant="outline">1,000 requests/hour</Badge>
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
