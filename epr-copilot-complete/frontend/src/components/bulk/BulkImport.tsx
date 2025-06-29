
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle,
  X,
  Eye,
  RefreshCw
} from 'lucide-react';
import { ImportPreview } from './ImportPreview';
import { ImportHistory } from './ImportHistory';

interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ row: number; error: string; data: any }>;
}

export function BulkImport() {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'products' | 'materials'>('products');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      // Simulate CSV parsing
      const mockData = [
        { name: 'Organic Pasta Sauce', sku: 'OPS-001', category: 'Food & Beverage', weight: 680 },
        { name: 'Premium Shampoo', sku: 'PS-200', category: 'Personal Care', weight: 400 }
      ];
      setPreviewData(mockData);
    }
  };

  const downloadTemplate = (type: 'products' | 'materials') => {
    const templates = {
      products: [
        ['name', 'sku', 'category', 'weight', 'description', 'upc', 'manufacturer'],
        ['Example Product', 'EX-001', 'Food & Beverage', '500', 'Sample description', '123456789', 'Sample Corp']
      ],
      materials: [
        ['name', 'category', 'type', 'recyclable', 'eprRate', 'sustainabilityScore', 'description'],
        ['PET Plastic', 'Plastic', 'Container', 'true', '0.0034', '65', 'Recyclable plastic container']
      ]
    };

    const csvContent = templates[type].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const processImport = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);

    // Simulate processing
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setImportResult({
            total: previewData.length,
            successful: previewData.length - 1,
            failed: 1,
            errors: [{ row: 2, error: 'Invalid category', data: previewData[1] }]
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const resetImport = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setImportResult(null);
    setProgress(0);
    setShowPreview(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bulk Import</h2>
          <p className="text-muted-foreground">Import products and materials in bulk using CSV files</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => downloadTemplate('products')}>
            <Download className="h-4 w-4 mr-2" />
            Products Template
          </Button>
          <Button variant="outline" onClick={() => downloadTemplate('materials')}>
            <Download className="h-4 w-4 mr-2" />
            Materials Template
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upload">Upload & Import</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {!importResult ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>File Upload</span>
                </CardTitle>
                <CardDescription>
                  Upload a CSV file to import products or materials. Download our template to ensure proper formatting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Import Type</Label>
                    <div className="flex space-x-4">
                      <Button
                        variant={importType === 'products' ? 'default' : 'outline'}
                        onClick={() => setImportType('products')}
                      >
                        Products
                      </Button>
                      <Button
                        variant={importType === 'materials' ? 'default' : 'outline'}
                        onClick={() => setImportType('materials')}
                      >
                        Materials
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="csvFile">CSV File</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <Input
                            id="csvFile"
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Label htmlFor="csvFile" className="cursor-pointer">
                            <Button variant="outline" className="mt-2">
                              Choose CSV File
                            </Button>
                          </Label>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Maximum file size: 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedFile && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">{selectedFile.name}</span>
                          <Badge variant="outline">{(selectedFile.size / 1024).toFixed(1)} KB</Badge>
                        </div>
                        <Button variant="ghost" size="sm" onClick={resetImport}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {selectedFile && previewData.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Preview ({previewData.length} rows)</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {showPreview ? 'Hide' : 'Show'} Preview
                      </Button>
                    </div>

                    {showPreview && (
                      <ImportPreview data={previewData} type={importType} />
                    )}

                    {isProcessing ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Processing...</span>
                          <span className="text-sm text-gray-500">{progress}%</span>
                        </div>
                        <Progress value={progress} className="w-full" />
                      </div>
                    ) : (
                      <Button onClick={processImport} className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Import {importType}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Import Complete</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-700">{importResult.total}</p>
                    <p className="text-sm text-blue-600">Total Records</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-700">{importResult.successful}</p>
                    <p className="text-sm text-green-600">Successful</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-700">{importResult.failed}</p>
                    <p className="text-sm text-red-600">Failed</p>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span>Import Errors</span>
                    </h4>
                    <div className="space-y-2">
                      {importResult.errors.map((error, index) => (
                        <div key={index} className="p-3 bg-red-50 rounded border-l-4 border-red-400">
                          <p className="text-sm font-medium text-red-800">
                            Row {error.row}: {error.error}
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            Data: {JSON.stringify(error.data)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button onClick={resetImport}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Import Another File
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab('history')}>
                    View Import History
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <ImportHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
