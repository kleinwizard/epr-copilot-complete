
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Download, Upload, Database, FileText, Calendar, HardDrive, RefreshCw } from 'lucide-react';
import { authService } from '@/services/authService';
import { exportEnhancedReport, downloadBlob } from '@/services/reportExportService';
import { dataService } from '@/services/dataService';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

export function DataSettings() {
  const [storageData, setStorageData] = useState({
    used: 0,
    total: 10,
    percentage: 0,
    products: 0,
    materials: 0,
    reports: 0,
    teamMembers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [exporting, setExporting] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        setIsLoading(true);
        
        const [teamResponse] = await Promise.all([
          fetch('/api/team/members', {
            headers: {
              'Authorization': `Bearer ${authService.getAccessToken()}`,
              'Content-Type': 'application/json',
            },
          })
        ]);
        
        const teamMembers = teamResponse.ok ? await teamResponse.json() : [];
        
        setStorageData({
          used: 0,
          total: 10,
          percentage: 0,
          products: 0,
          materials: 0,
          reports: 0,
          teamMembers: teamMembers.length || 0
        });
      } catch (error) {
        console.error('Failed to load storage data:', error);
        setStorageData({
          used: 0,
          total: 10,
          percentage: 0,
          products: 0,
          materials: 0,
          reports: 0,
          teamMembers: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const handleExport = async (dataType: string, format: string) => {
    const exportingKey = `${dataType}-${format}`;
    setExporting(prev => ({ ...prev, [exportingKey]: true }));
    
    try {
      let data: any;
      let filename: string;
      
      switch (dataType) {
        case 'products':
          const products = await dataService.getProducts();
          if (format === 'CSV') {
            data = convertProductsToCSV(products);
            filename = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
          } else {
            data = JSON.stringify(products, null, 2);
            filename = `products_export_${new Date().toISOString().split('T')[0]}.json`;
          }
          break;
          
        case 'materials':
          const materials = await dataService.getMaterials();
          data = JSON.stringify(materials, null, 2);
          filename = `materials_export_${new Date().toISOString().split('T')[0]}.json`;
          break;
          
        case 'reports':
          const reports = await apiService.get('/api/reports');
          if (reports && reports.length > 0) {
            const latestReport = reports[0];
            const blob = exportEnhancedReport(latestReport, 'pdf');
            downloadBlob(blob, `reports_export_${new Date().toISOString().split('T')[0]}.pdf`);
            
            toast({
              title: "Export Complete",
              description: "Your reports have been exported successfully.",
            });
            return;
          } else {
            throw new Error('No reports available to export');
          }
          
        case 'full-data':
          toast({
            title: "Full Export Started",
            description: "Preparing your complete data export. This may take a few minutes.",
          });
          
          const fullExport = {
            exportDate: new Date().toISOString(),
            products: await dataService.getProducts(),
            materials: await dataService.getMaterials(),
            company: await dataService.getCompanyInfo(),
            version: '1.0'
          };
          
          data = JSON.stringify(fullExport, null, 2);
          filename = `epr_full_export_${new Date().toISOString().split('T')[0]}.json`;
          break;
          
        default:
          throw new Error('Unknown export type');
      }
      
      const blob = new Blob([data], { 
        type: format === 'CSV' ? 'text/csv' : 'application/json' 
      });
      downloadBlob(blob, filename);
      
      toast({
        title: "Export Complete",
        description: `Your ${dataType} data has been exported successfully.`,
      });
      
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExporting(prev => ({ ...prev, [exportingKey]: false }));
    }
  };

  const convertProductsToCSV = (products: any[]): string => {
    const headers = ['Product ID', 'Name', 'Category', 'Brand Owner', 'Units Sold', 'Status'];
    const rows = [headers.join(',')];
    
    products.forEach(product => {
      const row = [
        product.productId || product.id,
        `"${product.name}"`,
        product.category,
        `"${product.brandOwner || ''}"`,
        product.unitsSold || 0,
        product.status || 'active'
      ];
      rows.push(row.join(','));
    });
    
    return rows.join('\n');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
          <CardDescription>
            Export your data for backup or migration purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Product Data</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Export all product and packaging information
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleExport('products', 'CSV')}
                disabled={exporting['products-CSV']}
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting['products-CSV'] ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Material Library</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Export material definitions and properties
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleExport('materials', 'JSON')}
                disabled={exporting['materials-JSON']}
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting['materials-JSON'] ? 'Exporting...' : 'Export JSON'}
              </Button>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h4 className="font-medium">Reports</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Export submitted compliance reports
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleExport('reports', 'PDF')}
                disabled={exporting['reports-PDF']}
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting['reports-PDF'] ? 'Exporting...' : 'Export PDF'}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Full Data Export</Label>
              <Button 
                onClick={() => handleExport('full-data', 'ZIP')}
                disabled={exporting['full-data-ZIP']}
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting['full-data-ZIP'] ? 'Exporting...' : 'Request Export'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Generate a complete export of all your data. This may take a few minutes.
            </p>
          </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle>Storage & Usage</CardTitle>
          <CardDescription>
            Monitor your data usage and storage limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Storage Used</span>
              </div>
              <Badge variant="outline">
                {isLoading ? 'Loading...' : `${storageData.used} GB of ${storageData.total} GB`}
              </Badge>
            </div>
            <Progress value={storageData.percentage} className="h-2" />
          </div>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-600">
                {isLoading ? 'Loading...' : storageData.products.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Products</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-green-600">
                {isLoading ? 'Loading...' : storageData.materials.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Materials</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-purple-600">
                {isLoading ? 'Loading...' : storageData.reports.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Reports</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-orange-600">
                {isLoading ? 'Loading...' : storageData.teamMembers.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Team Members</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
          <CardDescription>
            Configure how long data is stored in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Report Archive Period</Label>
                <p className="text-sm text-muted-foreground">
                  How long to keep submitted reports
                </p>
              </div>
              <select className="w-32 h-10 px-3 py-2 text-sm bg-background border border-input rounded-md">
                <option>7 years</option>
                <option>5 years</option>
                <option>3 years</option>
                <option>Forever</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Audit Log Retention</Label>
                <p className="text-sm text-muted-foreground">
                  How long to keep activity logs
                </p>
              </div>
              <select className="w-32 h-10 px-3 py-2 text-sm bg-background border border-input rounded-md">
                <option>2 years</option>
                <option>1 year</option>
                <option>6 months</option>
                <option>3 months</option>
              </select>
            </div>
          </div>

          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Apply Retention Policy
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
