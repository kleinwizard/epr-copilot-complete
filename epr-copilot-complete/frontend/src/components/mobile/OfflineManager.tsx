
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useMobile } from '@/hooks/useMobile';
import { mobileService } from '@/services/mobileService';
import { OfflineData } from '@/types/mobile';
import { Wifi, WifiOff, RefreshCw, Download, Upload, Clock } from 'lucide-react';

export const OfflineManager = () => {
  const { isOffline, syncData, settings, updateSettings } = useMobile();
  const [offlineData, setOfflineData] = useState<OfflineData[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setOfflineData(mobileService.getOfflineData());
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncData();
      setOfflineData(mobileService.getOfflineData());
    } finally {
      setSyncing(false);
    }
  };

  const unsyncedCount = offlineData.filter(item => !item.synced).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product': return '📦';
      case 'material': return '🔧';
      case 'report': return '📊';
      default: return '📄';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {isOffline ? (
              <WifiOff className="h-5 w-5 mr-2 text-orange-600" />
            ) : (
              <Wifi className="h-5 w-5 mr-2 text-green-600" />
            )}
            Connection Status
          </CardTitle>
          <CardDescription>
            Current network status and offline capabilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium">
                {isOffline ? 'Offline Mode' : 'Online'}
              </h3>
              <p className="text-sm text-gray-600">
                {isOffline 
                  ? 'Working offline - changes will sync when online' 
                  : 'Connected to internet - real-time sync enabled'
                }
              </p>
            </div>
            <Badge variant={isOffline ? "destructive" : "default"}>
              {isOffline ? 'Offline' : 'Online'}
            </Badge>
          </div>

          {unsyncedCount > 0 && (
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div>
                <h3 className="font-medium text-orange-900">Unsynced Changes</h3>
                <p className="text-sm text-orange-700">
                  {unsyncedCount} items waiting to sync
                </p>
              </div>
              <Button onClick={handleSync} disabled={syncing || isOffline}>
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Offline Settings</CardTitle>
          <CardDescription>Configure offline behavior and sync preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Enable Offline Mode</h4>
              <p className="text-sm text-gray-600">Allow working without internet connection</p>
            </div>
            <Switch 
              checked={settings.offlineMode}
              onCheckedChange={(checked) => updateSettings({...settings, offlineMode: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto Sync</h4>
              <p className="text-sm text-gray-600">Sync every {settings.syncFrequency / 60} minutes when online</p>
            </div>
            <Badge variant="outline">{settings.syncFrequency / 60}min</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Offline Data</CardTitle>
          <CardDescription>Data stored locally for offline access</CardDescription>
        </CardHeader>
        <CardContent>
          {offlineData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Download className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No offline data stored</p>
            </div>
          ) : (
            <div className="space-y-3">
              {offlineData.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getTypeIcon(item.type)}</span>
                    <div>
                      <p className="font-medium text-sm capitalize">{item.type}</p>
                      <p className="text-xs text-gray-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {item.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.synced ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Upload className="h-3 w-3 mr-1" />
                        Synced
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {offlineData.length > 5 && (
                <p className="text-sm text-gray-500 text-center mt-3">
                  +{offlineData.length - 5} more items
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
