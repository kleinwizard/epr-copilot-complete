
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PWAInstaller } from './PWAInstaller';
import { BarcodeScanner } from './BarcodeScanner';
import { OfflineManager } from './OfflineManager';
import { TouchOptimization } from './TouchOptimization';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Wifi, WifiOff, Download, Scan } from 'lucide-react';

export const MobileFramework = () => {
  const [activeTab, setActiveTab] = useState('pwa');

  const mobileStats = {
    pwaInstalls: 1250,
    offlineActions: 340,
    barcodeScans: 890,
    touchInteractions: 5600
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mobile & Progressive Web App</h1>
          <p className="text-gray-600 mt-2">Mobile-optimized features and offline capabilities</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Smartphone className="h-3 w-3 mr-1" />
          Mobile Ready
        </Badge>
      </div>

      {/* Mobile Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Download className="h-4 w-4 mr-2" />
              PWA Installs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{mobileStats.pwaInstalls}</div>
            <p className="text-xs text-gray-500">total installations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <WifiOff className="h-4 w-4 mr-2" />
              Offline Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{mobileStats.offlineActions}</div>
            <p className="text-xs text-gray-500">performed offline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Scan className="h-4 w-4 mr-2" />
              Barcode Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mobileStats.barcodeScans}</div>
            <p className="text-xs text-gray-500">successful scans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Smartphone className="h-4 w-4 mr-2" />
              Touch Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{mobileStats.touchInteractions}</div>
            <p className="text-xs text-gray-500">touch interactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Features Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pwa">PWA</TabsTrigger>
          <TabsTrigger value="barcode">Barcode Scanner</TabsTrigger>
          <TabsTrigger value="offline">Offline</TabsTrigger>
          <TabsTrigger value="touch">Touch</TabsTrigger>
        </TabsList>

        <TabsContent value="pwa" className="mt-6">
          <PWAInstaller />
        </TabsContent>

        <TabsContent value="barcode" className="mt-6">
          <BarcodeScanner />
        </TabsContent>

        <TabsContent value="offline" className="mt-6">
          <OfflineManager />
        </TabsContent>

        <TabsContent value="touch" className="mt-6">
          <TouchOptimization />
        </TabsContent>
      </Tabs>
    </div>
  );
};
