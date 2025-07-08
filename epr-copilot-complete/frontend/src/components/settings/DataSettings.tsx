
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Download, Upload, Database, FileText, Calendar, HardDrive, RefreshCw } from 'lucide-react';

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

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        setIsLoading(true);
        
        const [teamResponse] = await Promise.all([
          fetch('/api/team/members', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
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

  const handleExport = async (type: string, format: string) => {
    try {
      console.log(`Exporting ${type} data in ${format} format`);
      
      const blob = new Blob(['Sample export data'], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${type}_export.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
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
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
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
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
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
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Full Data Export</Label>
              <Button onClick={() => handleExport('full-data', 'ZIP')}>
                <Download className="h-4 w-4 mr-2" />
                Request Export
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
