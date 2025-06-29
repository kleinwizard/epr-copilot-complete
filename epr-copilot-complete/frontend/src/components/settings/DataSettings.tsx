
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Download, Upload, Database, FileText, Calendar, HardDrive, RefreshCw } from 'lucide-react';

export function DataSettings() {
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
              <Button variant="outline" size="sm" className="w-full">
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
              <Button variant="outline" size="sm" className="w-full">
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
              <Button variant="outline" size="sm" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Full Data Export</Label>
              <Button>
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
          <CardTitle>Data Import</CardTitle>
          <CardDescription>
            Import data from external systems or previous platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center space-y-3">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
            <div>
              <p className="font-medium">Drop files here or click to browse</p>
              <p className="text-sm text-muted-foreground">
                Supports CSV, JSON, and Excel files
              </p>
            </div>
            <Button variant="outline">Choose Files</Button>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Import Templates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Product Template
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Material Template
              </Button>
            </div>
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
              <Badge variant="outline">2.3 GB of 10 GB</Badge>
            </div>
            <Progress value={23} className="h-2" />
          </div>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-blue-600">1,247</p>
              <p className="text-sm text-muted-foreground">Products</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-green-600">156</p>
              <p className="text-sm text-muted-foreground">Materials</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-purple-600">24</p>
              <p className="text-sm text-muted-foreground">Reports</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-orange-600">8</p>
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
