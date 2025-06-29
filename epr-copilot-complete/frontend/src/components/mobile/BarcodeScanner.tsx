
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMobile } from '@/hooks/useMobile';
import { BarcodeResult } from '@/types/mobile';
import { Scan, Camera, Check, AlertCircle, Package } from 'lucide-react';

export const BarcodeScanner = () => {
  const { scanBarcode } = useMobile();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<BarcodeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setScanning(true);
    setError(null);
    try {
      const result = await scanBarcode();
      if (result) {
        setScanResult(result);
      } else {
        setError('Camera access denied or scanning failed');
      }
    } catch (err) {
      setError('Failed to start camera');
    } finally {
      setScanning(false);
    }
  };

  const recentScans = [
    { text: '1234567890123', format: 'UPC-A', timestamp: new Date('2024-06-20T10:30:00'), product: 'Plastic Bottle' },
    { text: '9876543210987', format: 'EAN-13', timestamp: new Date('2024-06-20T09:15:00'), product: 'Aluminum Can' },
    { text: '5555666677778', format: 'UPC-A', timestamp: new Date('2024-06-19T16:45:00'), product: 'Glass Jar' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Scan className="h-5 w-5 mr-2" />
            Barcode Scanner
          </CardTitle>
          <CardDescription>
            Scan product barcodes to quickly add them to your catalog
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              {scanning ? (
                <div className="animate-pulse">
                  <Camera className="h-12 w-12 text-blue-600" />
                </div>
              ) : (
                <Scan className="h-12 w-12 text-gray-400" />
              )}
            </div>
            
            <Button 
              onClick={handleScan} 
              disabled={scanning}
              className="w-full"
            >
              <Camera className="h-4 w-4 mr-2" />
              {scanning ? 'Scanning...' : 'Start Barcode Scan'}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {scanResult && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">Scan Successful</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Code: {scanResult.text} ({scanResult.format})
                  </p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {scanResult.format}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Scans</CardTitle>
          <CardDescription>Previously scanned barcodes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentScans.map((scan, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Package className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="font-medium text-sm">{scan.product}</p>
                    <p className="text-xs text-gray-500">{scan.text}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">{scan.format}</Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    {scan.timestamp.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scanner Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto-add to catalog</span>
              <Badge variant="outline" className="text-green-600 border-green-600">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Sound feedback</span>
              <Badge variant="outline" className="text-blue-600 border-blue-600">On</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Flashlight support</span>
              <Badge variant="outline" className="text-gray-600 border-gray-600">Available</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
