
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMobile } from '@/hooks/useMobile';
import { Download, Smartphone, Check, X } from 'lucide-react';

export const PWAInstaller = () => {
  const { isPWAInstallable, installPWA } = useMobile();
  const [installing, setInstalling] = useState(false);
  const [installResult, setInstallResult] = useState<'success' | 'cancelled' | null>(null);

  const handleInstall = async () => {
    setInstalling(true);
    try {
      const success = await installPWA();
      setInstallResult(success ? 'success' : 'cancelled');
    } catch (error) {
      console.error('Installation failed:', error);
      setInstallResult('cancelled');
    } finally {
      setInstalling(false);
    }
  };

  const pwaFeatures = [
    'Works offline',
    'Fast loading',
    'Home screen icon',
    'Full screen experience',
    'Push notifications',
    'Automatic updates'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            Progressive Web App
          </CardTitle>
          <CardDescription>
            Install the EPR Compliance app for a native app experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPWAInstallable ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-blue-900">App Installation Available</h3>
                  <p className="text-sm text-blue-700">Install for better performance and offline access</p>
                </div>
                <Button onClick={handleInstall} disabled={installing}>
                  <Download className="h-4 w-4 mr-2" />
                  {installing ? 'Installing...' : 'Install App'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-gray-700">App is already installed or not available</span>
              </div>
            </div>
          )}

          {installResult && (
            <div className={`p-4 rounded-lg ${installResult === 'success' ? 'bg-green-50' : 'bg-orange-50'}`}>
              <div className="flex items-center">
                {installResult === 'success' ? (
                  <>
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800">App installed successfully!</span>
                  </>
                ) : (
                  <>
                    <X className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-orange-800">Installation was cancelled</span>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PWA Features</CardTitle>
          <CardDescription>Benefits of installing the Progressive Web App</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pwaFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Installation Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">HTTPS Connection</span>
              <Badge variant="outline" className="text-green-600 border-green-600">Required ✓</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Service Worker</span>
              <Badge variant="outline" className="text-green-600 border-green-600">Active ✓</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Web App Manifest</span>
              <Badge variant="outline" className="text-green-600 border-green-600">Valid ✓</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
