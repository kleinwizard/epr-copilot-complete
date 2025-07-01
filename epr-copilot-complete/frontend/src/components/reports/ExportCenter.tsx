
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File,
  Calendar,
  Settings,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const exportFormats = [
  { id: 'pdf', name: 'PDF Report', icon: FileText, description: 'Complete formatted report' },
  { id: 'excel', name: 'Excel Spreadsheet', icon: FileSpreadsheet, description: 'Detailed data tables' },
  { id: 'csv', name: 'CSV Data', icon: File, description: 'Raw data export' },
  { id: 'xml', name: 'XML Document', icon: FileText, description: 'Regulatory submission format' }
];

const scheduledExports = [
  {
    id: '1',
    name: 'Monthly Compliance Summary',
    format: 'PDF',
    schedule: 'Every month on the 1st',
    lastRun: '2024-01-01',
    nextRun: '2024-02-01',
    status: 'Active'
  },
  {
    id: '2',
    name: 'Quarterly Data Export',
    format: 'Excel',
    schedule: 'Every quarter',
    lastRun: '2024-01-01',
    nextRun: '2024-04-01',
    status: 'Active'
  }
];

const exportHistory = [
  {
    id: '1',
    reportName: 'Q3 2024 Compliance Report',
    format: 'PDF',
    size: '2.4 MB',
    exportedAt: '2024-01-22T10:30:00Z',
    exportedBy: 'Sarah Johnson',
    status: 'Completed'
  },
  {
    id: '2',
    reportName: 'Material Analysis Report',
    format: 'Excel',
    size: '1.8 MB',
    exportedAt: '2024-01-21T14:15:00Z',
    exportedBy: 'Mike Chen',
    status: 'Completed'
  }
];

export function ExportCenter() {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedSections, setSelectedSections] = useState<string[]>(['summary', 'products', 'fees']);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate export process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setExportProgress(i);
    }

    setIsExporting(false);
    toast({
      title: "Export Complete",
      description: "Your report has been exported successfully",
    });
  };

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Export Center</h2>
          <p className="text-muted-foreground">Export reports in various formats and manage scheduled exports</p>
        </div>
        <Button variant="outline" onClick={() => window.location.href = '/reports'}>
          ← Back to Reports
        </Button>
      </div>

      <Tabs defaultValue="export" className="space-y-4">
        <TabsList>
          <TabsTrigger value="export">Export Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Exports</TabsTrigger>
          <TabsTrigger value="history">Export History</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Export Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {exportFormats.map((format) => (
                      <button
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        className={`p-3 border rounded-lg text-left hover:bg-gray-50 transition-colors ${
                          selectedFormat === format.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <format.icon className="h-4 w-4" />
                          <span className="font-medium text-sm">{format.name}</span>
                        </div>
                        <p className="text-xs text-gray-600">{format.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Sections</label>
                  <div className="space-y-2">
                    {[
                      { id: 'summary', name: 'Executive Summary' },
                      { id: 'products', name: 'Product Details' },
                      { id: 'materials', name: 'Material Breakdown' },
                      { id: 'fees', name: 'Fee Calculations' },
                      { id: 'compliance', name: 'Compliance Metrics' },
                      { id: 'recommendations', name: 'Recommendations' }
                    ].map((section) => (
                      <div key={section.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={section.id}
                          checked={selectedSections.includes(section.id)}
                          onCheckedChange={() => handleSectionToggle(section.id)}
                        />
                        <label htmlFor={section.id} className="text-sm">{section.name}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <Select defaultValue="q3-2024">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="q3-2024">Q3 2024</SelectItem>
                      <SelectItem value="q2-2024">Q2 2024</SelectItem>
                      <SelectItem value="q1-2024">Q1 2024</SelectItem>
                      <SelectItem value="all-2024">All of 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Format</span>
                    <span className="capitalize">{selectedFormat}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Sections</span>
                    <span>{selectedSections.length} selected</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Estimated Size</span>
                    <span>2.4 MB</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Processing Time</span>
                    <span>~30 seconds</span>
                  </div>
                </div>

                {isExporting && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Exporting...</span>
                      <span className="text-sm">{exportProgress}%</span>
                    </div>
                    <Progress value={exportProgress} className="w-full" />
                  </div>
                )}

                <Button 
                  onClick={handleExport} 
                  disabled={isExporting || selectedSections.length === 0}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export Report'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Scheduled Exports</h3>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              New Schedule
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {scheduledExports.map((schedule) => (
              <Card key={schedule.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{schedule.name}</h4>
                      <p className="text-sm text-gray-600">{schedule.schedule}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Format: {schedule.format}</span>
                        <span>Last run: {new Date(schedule.lastRun).toLocaleDateString()}</span>
                        <span>Next run: {new Date(schedule.nextRun).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {schedule.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Export History</h3>
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exports</SelectItem>
                <SelectItem value="pdf">PDF Only</SelectItem>
                <SelectItem value="excel">Excel Only</SelectItem>
                <SelectItem value="csv">CSV Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {exportHistory.map((export_) => (
              <Card key={export_.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <h4 className="font-medium">{export_.reportName}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{export_.format} • {export_.size}</span>
                          <span>Exported by {export_.exportedBy}</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(export_.exportedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
