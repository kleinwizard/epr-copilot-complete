
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File,
  Calendar,
  Settings,
  Clock,
  CheckCircle,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';

interface ScheduledExport {
  id: string;
  name: string;
  format: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: 'active' | 'inactive';
}

interface ExportHistoryItem {
  id: string;
  reportName: string;
  format: string;
  size: string;
  exportedAt: string;
  exportedBy: string;
  status: 'completed' | 'failed' | 'processing';
}

const exportFormats = [
  { id: 'pdf', name: 'PDF Report', icon: FileText, description: 'Complete formatted report' },
  { id: 'excel', name: 'Excel Spreadsheet', icon: FileSpreadsheet, description: 'Detailed data tables' },
  { id: 'csv', name: 'CSV Data', icon: File, description: 'Raw data export' },
  { id: 'xml', name: 'XML Document', icon: FileText, description: 'Regulatory submission format' }
];


export function ExportCenter() {
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [selectedSections, setSelectedSections] = useState<string[]>(['summary', 'products', 'fees']);
  const [selectedDateRange, setSelectedDateRange] = useState('q3-2024');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [scheduledExports, setScheduledExports] = useState<ScheduledExport[]>([]);
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  const [isNewScheduleModalOpen, setIsNewScheduleModalOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    format: 'pdf',
    frequency: 'monthly'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadExportData();
  }, []);

  const loadExportData = async () => {
    try {
      const [schedules, history] = await Promise.all([
        apiService.get('/api/exports/scheduled'),
        apiService.get('/api/exports/history')
      ]);
      
      setScheduledExports(schedules || []);
      setExportHistory(history || []);
    } catch (error) {
      console.error('Failed to load export data:', error);
    }
  };

  const handleExport = async () => {
    if (selectedSections.length === 0) {
      toast({
        title: "No Sections Selected",
        description: "Please select at least one section to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      const exportConfig = {
        format: selectedFormat,
        sections: selectedSections,
        dateRange: selectedDateRange
      };

      // Start export process
      const exportJob = await apiService.post('/api/exports/generate', exportConfig);
      
      const pollProgress = async () => {
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 300));
          setExportProgress(i);
        }
      };

      await pollProgress();

      const blob = await apiService.get(`/api/exports/download/${exportJob.id}`);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${selectedFormat}_${Date.now()}.${selectedFormat === 'pdf' ? 'pdf' : selectedFormat === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Complete",
        description: "Your report has been exported and downloaded successfully.",
      });

      loadExportData(); // Refresh history
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleCreateSchedule = async () => {
    if (!newSchedule.name) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for the scheduled export.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiService.post('/api/exports/schedule', newSchedule);
      
      toast({
        title: "Schedule Created",
        description: "Your export schedule has been created successfully.",
      });
      
      setNewSchedule({ name: '', format: 'pdf', frequency: 'monthly' });
      setIsNewScheduleModalOpen(false);
      loadExportData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create schedule. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadHistoryItem = async (itemId: string) => {
    try {
      const blob = await apiService.get(`/api/exports/download/${itemId}`);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${itemId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download Started",
        description: "Your export download has started.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download export. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleScheduleSettings = (scheduleId: string) => {
    console.log('Opening settings for schedule:', scheduleId);
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
                  <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="q3-2024">Q3 2024</SelectItem>
                      <SelectItem value="q2-2024">Q2 2024</SelectItem>
                      <SelectItem value="q1-2024">Q1 2024</SelectItem>
                      <SelectItem value="all-2024">All of 2024</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
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
            <Dialog open={isNewScheduleModalOpen} onOpenChange={setIsNewScheduleModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Export Schedule</DialogTitle>
                  <DialogDescription>
                    Set up an automated export schedule for regular report generation.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule-name">Schedule Name</Label>
                    <Input
                      id="schedule-name"
                      placeholder="e.g., Monthly Compliance Report"
                      value={newSchedule.name}
                      onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Export Format</Label>
                    <Select value={newSchedule.format} onValueChange={(value) => setNewSchedule(prev => ({ ...prev, format: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Report</SelectItem>
                        <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                        <SelectItem value="csv">CSV Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select value={newSchedule.frequency} onValueChange={(value) => setNewSchedule(prev => ({ ...prev, frequency: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewScheduleModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSchedule}>
                    Create Schedule
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {scheduledExports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No scheduled exports yet. Create your first schedule above.
              </div>
            ) : (
              scheduledExports.map((schedule) => (
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
                        <Badge variant="outline" className={schedule.status === 'active' ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}>
                          {schedule.status}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => handleScheduleSettings(schedule.id)}>
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
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
            {exportHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No export history yet. Generate your first export above.
              </div>
            ) : (
              exportHistory.map((export_) => (
                <Card key={export_.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className={`h-5 w-5 ${export_.status === 'completed' ? 'text-green-500' : export_.status === 'failed' ? 'text-red-500' : 'text-yellow-500'}`} />
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
                      {export_.status === 'completed' && (
                        <Button variant="outline" size="sm" onClick={() => handleDownloadHistoryItem(export_.id)}>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
