
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle,
  X,
  Eye,
  RefreshCw,
  FileText
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
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      
      try {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSV file must contain at least a header row and one data row');
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = { _rowIndex: index + 2 };
          
          headers.forEach((header, i) => {
            row[header] = values[i] || '';
          });
          
          return row;
        });
        
        setPreviewData(data.slice(0, 10)); // Show first 10 rows for preview
      } catch (error) {
        console.error('Error parsing CSV:', error);
        setSelectedFile(null);
        toast({
          title: "CSV Parse Error",
          description: error instanceof Error ? error.message : "Failed to parse CSV file",
          variant: "destructive",
        });
      }
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

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', importType);

      const endpoint = `/api/bulk/import/${importType}`;
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`);
      }

      const result = await response.json();
      setImportResult(result);
      setIsProcessing(false);
      
    } catch (error) {
      console.error('Import failed:', error);
      setIsProcessing(false);
      setImportResult({
        total: previewData.length,
        successful: 0,
        failed: previewData.length,
        errors: [{ row: 1, error: error instanceof Error ? error.message : 'Unknown error', data: {} }]
      });
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import CSV file",
        variant: "destructive",
      });
    }
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Guide: How to Format Your Bulk Import CSV Files</span>
          </CardTitle>
          <CardDescription>
            To ensure successful data imports, please format your CSV files precisely as described below. The first row of your file must be the header row with the exact column names specified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg mb-3">1. Product Catalog Bulk Import</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Use this format to add or update multiple products in your catalog. Each row represents a single product component. If a product has three components (e.g., bottle, cap, label), it will require three rows.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium mb-2">Required Columns:</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Header Name</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-left p-2">Example</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      <tr className="border-b">
                        <td className="p-2 font-mono">product_id</td>
                        <td className="p-2">Your unique identifier (SKU) for the product. This is used to group components together.</td>
                        <td className="p-2">SKU-1025-A</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">product_name</td>
                        <td className="p-2">The common name of the product.</td>
                        <td className="p-2">16oz Natural Spring Water</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">component_name</td>
                        <td className="p-2">The name of this specific component of the product.</td>
                        <td className="p-2">Bottle, Cap, Label</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">material_type</td>
                        <td className="p-2">The material this component is made from. Must match materials in your Material Catalog.</td>
                        <td className="p-2">PET, HDPE, Paper</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">component_weight_grams</td>
                        <td className="p-2">The weight of this component in grams. Numbers only, no units.</td>
                        <td className="p-2">25.5</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">recyclable</td>
                        <td className="p-2">Whether this component is recyclable in most municipal programs. Use "true" or "false".</td>
                        <td className="p-2">true</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono">pcr_content_percent</td>
                        <td className="p-2">The percentage of post-consumer recycled content. Numbers only, 0-100.</td>
                        <td className="p-2">25</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">2. Material Catalog Bulk Import</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Use this format to add or update materials in your catalog. Each row represents a single material type.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium mb-2">Required Columns:</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Header Name</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-left p-2">Example</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs">
                      <tr className="border-b">
                        <td className="p-2 font-mono">material_name</td>
                        <td className="p-2">The name of the material.</td>
                        <td className="p-2">PET Plastic</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">material_category</td>
                        <td className="p-2">The broad category this material belongs to.</td>
                        <td className="p-2">Plastic, Paper, Glass, Metal</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">material_subcategory</td>
                        <td className="p-2">The specific subcategory or type.</td>
                        <td className="p-2">Rigid Plastic, Flexible Film</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">recyclable</td>
                        <td className="p-2">Whether this material is generally recyclable. Use "true" or "false".</td>
                        <td className="p-2">true</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 font-mono">epr_rate_usd_per_kg</td>
                        <td className="p-2">The EPR fee rate in USD per kilogram. Numbers only.</td>
                        <td className="p-2">0.0034</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono">sustainability_score</td>
                        <td className="p-2">A score from 0-100 indicating environmental impact (higher = better). Numbers only.</td>
                        <td className="p-2">65</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2 text-blue-800">Important Notes:</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Column headers must match exactly (case-sensitive)</li>
                <li>• Do not include extra spaces in column headers</li>
                <li>• Numbers should not include units or currency symbols</li>
                <li>• Boolean values must be exactly "true" or "false" (lowercase)</li>
                <li>• Empty cells will be treated as null values</li>
                <li>• Maximum file size: 10MB</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

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
