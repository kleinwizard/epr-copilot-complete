
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { customApiService } from '@/services/customApiService';
import { CustomAPI, APIParameter } from '@/types/integrations';
import { useToast } from '@/hooks/use-toast';
import { ValidationService } from '@/services/validationService';
import { ValidationMessage } from '@/components/common/ValidationMessage';

export const CustomAPIBuilder = () => {
  const [apis, setApis] = useState<CustomAPI[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [parameters, setParameters] = useState<APIParameter[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadAPIs();
  }, []);

  const loadAPIs = () => {
    const data = customApiService.getAPIs();
    setApis(data);
  };

  const addParameter = () => {
    setParameters([...parameters, {
      name: '',
      type: 'string',
      required: false,
      description: ''
    }]);
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const updateParameter = (index: number, field: keyof APIParameter, value: any) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
  };

  const handleCreateEndpoint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const method = formData.get('method') as string;
    const endpoint = formData.get('endpoint') as string;
    const description = formData.get('description') as string;
    
    const errors: string[] = [];
    
    if (!name?.trim()) {
      errors.push('Endpoint name is required');
    }
    
    if (!endpoint?.trim()) {
      errors.push('Endpoint URL is required');
    } else if (!endpoint.startsWith('/')) {
      errors.push('Endpoint URL must start with /');
    } else if (!/^\/[a-zA-Z0-9\-\/{}:]+$/.test(endpoint)) {
      errors.push('Invalid endpoint URL format');
    }
    
    if (!method) {
      errors.push('HTTP method is required');
    }
    
    for (const param of parameters) {
      if (!param.name.trim()) {
        errors.push(`Parameter name is required`);
        break;
      }
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(param.name)) {
        errors.push(`Invalid parameter name: ${param.name}`);
        break;
      }
    }
    
    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.join('\n'),
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const endpointData = {
        name: name.trim(),
        method: method as CustomAPI['method'],
        endpoint: endpoint.trim(),
        description: description?.trim() || '',
        parameters,
        headers: {},
        authentication: 'api_key' as CustomAPI['authentication'],
        responseSchema: {},
        isActive: true
      };
      
      await customApiService.createAPI(endpointData);
      
      toast({
        title: "Endpoint Created",
        description: `Custom endpoint "${name}" has been created successfully.`,
      });
      
      e.currentTarget.reset();
      setParameters([]);
      setIsCreateDialogOpen(false);
      
      loadAPIs();
    } catch (error) {
      console.error('Failed to create endpoint:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create custom endpoint. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = handleCreateEndpoint;

  const handleTest = async (apiId: string) => {
    setIsLoading(true);
    try {
      const result = await customApiService.testAPI(apiId);
      toast({
        title: "API Test Successful",
        description: `Response time: ${result.responseTime}ms`,
      });
    } catch (error) {
      toast({
        title: "API Test Failed",
        description: "The API test failed. Check your configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (apiId: string, isActive: boolean) => {
    try {
      await customApiService.updateAPI(apiId, { isActive });
      toast({
        title: isActive ? "API Activated" : "API Deactivated",
        description: `The API has been ${isActive ? 'activated' : 'deactivated'}.`,
      });
      loadAPIs();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update API status.",
        variant: "destructive",
      });
    }
  };

  const getMethodBadge = (method: CustomAPI['method']) => {
    const variants = {
      GET: 'bg-blue-100 text-blue-800',
      POST: 'bg-green-100 text-green-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      PATCH: 'bg-purple-100 text-purple-800'
    };

    return (
      <Badge className={variants[method]}>
        {method}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Custom API Builder</h2>
          <p className="text-gray-600">Create and manage custom API integrations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New API</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Custom API</DialogTitle>
              <DialogDescription>
                Build a custom API integration for your specific needs.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">API Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Material Lookup API"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="method">HTTP Method</Label>
                  <Select name="method" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe what this API does..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="endpoint">API Endpoint</Label>
                <Input
                  id="endpoint"
                  name="endpoint"
                  placeholder="https://api.example.com/v1/materials"
                  type="url"
                  required
                />
              </div>

              <div>
                <Label htmlFor="authentication">Authentication</Label>
                <Select name="authentication" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select authentication" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="api_key">API Key</SelectItem>
                    <SelectItem value="oauth">OAuth</SelectItem>
                    <SelectItem value="basic">Basic Auth</SelectItem>
                  </SelectContent>
                </Select>
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

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Parameters</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addParameter}>
                    Add Parameter
                  </Button>
                </div>
                {parameters.map((param, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                    <Input
                      placeholder="Name"
                      value={param.name}
                      onChange={(e) => updateParameter(index, 'name', e.target.value)}
                      className="col-span-3"
                    />
                    <Select
                      value={param.type}
                      onValueChange={(value) => updateParameter(index, 'type', value)}
                    >
                      <SelectTrigger className="col-span-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="array">Array</SelectItem>
                        <SelectItem value="object">Object</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Description"
                      value={param.description}
                      onChange={(e) => updateParameter(index, 'description', e.target.value)}
                      className="col-span-5"
                    />
                    <div className="col-span-1 flex items-center">
                      <Switch
                        checked={param.required}
                        onCheckedChange={(checked) => updateParameter(index, 'required', checked)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeParameter(index)}
                      className="col-span-1"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setParameters([]);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create API'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apis.map((api) => (
          <Card key={api.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{api.name}</CardTitle>
                  <CardDescription className="mt-1">{api.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getMethodBadge(api.method)}
                  <Switch
                    checked={api.isActive}
                    onCheckedChange={(checked) => handleToggleActive(api.id, checked)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Endpoint:</span>
                  <div className="text-gray-600 truncate">{api.endpoint}</div>
                </div>

                <div className="text-sm">
                  <span className="font-medium">Authentication:</span> {api.authentication}
                </div>

                <div className="text-sm">
                  <span className="font-medium">Parameters:</span> {api.parameters.length}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Usage:</span>
                    <div className="text-blue-600">{api.usage.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <div className={api.isActive ? 'text-green-600' : 'text-gray-500'}>
                      {api.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>

                {api.lastUsed && (
                  <p className="text-xs text-gray-500">
                    Last used: {new Date(api.lastUsed).toLocaleString()}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTest(api.id)}
                    disabled={isLoading || !api.isActive}
                  >
                    Test
                  </Button>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {apis.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔧</div>
          <h3 className="text-lg font-semibold mb-2">No Custom APIs</h3>
          <p className="text-gray-600 mb-4">Create your first custom API integration</p>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create API</Button>
            </DialogTrigger>
          </Dialog>
        </div>
      )}
    </div>
  );
};
