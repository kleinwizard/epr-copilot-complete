
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Zap, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Play,
  RefreshCw
} from 'lucide-react';
import { 
  getERPSystems, 
  getSyncHistory, 
  triggerSync, 
  testConnection, 
  getERPStats,
  type ERPSystem 
} from '@/services/erpIntegrationService';
import { useToast } from '@/hooks/use-toast';

export function ERPIntegration() {
  const [erpSystems, setERPSystems] = useState(getERPSystems());
  const [syncHistory, setSyncHistory] = useState(getSyncHistory());
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const stats = getERPStats();

  const getStatusIcon = (status: ERPSystem['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ERPSystem['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSync = async (systemId: string) => {
    setLoading(systemId);
    try {
      const result = await triggerSync(systemId);
      setSyncHistory(getSyncHistory());
      setERPSystems(getERPSystems());
      
      toast({
        title: "Sync Completed",
        description: `Successfully processed ${result.recordsProcessed} records in ${result.duration}s`,
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleTestConnection = async (systemId: string) => {
    setLoading(`test-${systemId}`);
    try {
      const success = await testConnection(systemId);
      setERPSystems(getERPSystems());
      
      toast({
        title: success ? "Connection Successful" : "Connection Failed",
        description: success 
          ? "ERP system is properly connected and responding"
          : "Unable to establish connection to ERP system",
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">ERP Integration</h2>
          <p className="text-muted-foreground">
            Connect and sync data with your enterprise resource planning systems
          </p>
        </div>
        
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalSystems}</p>
                <p className="text-sm text-muted-foreground">Total Systems</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.connectedSystems}</p>
                <p className="text-sm text-muted-foreground">Connected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalRecordsToday.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Records Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="systems" className="space-y-6">
        <TabsList>
          <TabsTrigger value="systems">ERP Systems</TabsTrigger>
          <TabsTrigger value="sync-history">Sync History</TabsTrigger>
          <TabsTrigger value="mapping">Data Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="systems">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {erpSystems.map((system) => (
              <Card key={system.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(system.status)}
                      <CardTitle className="text-lg">{system.name}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(system.status)}>
                      {system.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {system.type.toUpperCase()} • Sync: {system.syncFrequency}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Data Types:</p>
                    <div className="flex flex-wrap gap-1">
                      {system.dataTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {system.lastSync && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Last sync: {new Date(system.lastSync).toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleSync(system.id)}
                      disabled={system.status !== 'connected' || loading === system.id}
                      className="flex-1"
                    >
                      {loading === system.id ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Sync Now
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(system.id)}
                      disabled={loading === `test-${system.id}`}
                    >
                      {loading === `test-${system.id}` ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sync-history">
          <Card>
            <CardHeader>
              <CardTitle>Synchronization History</CardTitle>
              <CardDescription>
                Recent data synchronization results and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncHistory.map((sync) => {
                  const system = erpSystems.find(s => s.id === sync.erpSystemId);
                  const successRate = (sync.recordsSuccessful / sync.recordsProcessed) * 100;
                  
                  return (
                    <div key={sync.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{system?.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(sync.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge className={
                          sync.status === 'success' 
                            ? 'bg-green-100 text-green-800'
                            : sync.status === 'partial'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }>
                          {sync.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                        <div>
                          <p className="font-medium">{sync.recordsProcessed}</p>
                          <p className="text-muted-foreground">Processed</p>
                        </div>
                        <div>
                          <p className="font-medium text-green-600">{sync.recordsSuccessful}</p>
                          <p className="text-muted-foreground">Successful</p>
                        </div>
                        <div>
                          <p className="font-medium text-red-600">{sync.recordsFailed}</p>
                          <p className="text-muted-foreground">Failed</p>
                        </div>
                        <div>
                          <p className="font-medium">{sync.duration}s</p>
                          <p className="text-muted-foreground">Duration</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Success Rate</span>
                          <span>{successRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={successRate} className="h-2" />
                      </div>

                      {sync.errors && sync.errors.length > 0 && (
                        <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                          <p className="text-sm font-medium text-red-800 mb-1">Errors:</p>
                          <ul className="text-sm text-red-700 list-disc list-inside">
                            {sync.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping">
          <Card>
            <CardHeader>
              <CardTitle>Data Field Mapping</CardTitle>
              <CardDescription>
                Configure how data fields map between ERP systems and compliance platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Data mapping configuration will be available here
                </p>
                <Button variant="outline" className="mt-4">
                  Configure Mappings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
