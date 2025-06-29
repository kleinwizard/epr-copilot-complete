
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Calendar, 
  Clock, 
  Mail, 
  Users, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  Plus
} from 'lucide-react';

interface ScheduledReport {
  id: string;
  name: string;
  reportType: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  nextRun: string;
  recipients: string[];
  isActive: boolean;
  lastRun?: string;
  createdDate: string;
}

export function ReportScheduler() {
  const [scheduledReports] = useState<ScheduledReport[]>([
    {
      id: 'schedule-1',
      name: 'Quarterly EPR Compliance Report',
      reportType: 'Oregon EPR Quarterly',
      frequency: 'quarterly',
      nextRun: '2024-07-01',
      recipients: ['compliance@company.com', 'ceo@company.com'],
      isActive: true,
      lastRun: '2024-04-01',
      createdDate: '2024-01-15'
    },
    {
      id: 'schedule-2',
      name: 'Monthly Material Analysis',
      reportType: 'Material Breakdown Report',
      frequency: 'monthly',
      nextRun: '2024-06-01',
      recipients: ['operations@company.com'],
      isActive: true,
      lastRun: '2024-05-01',
      createdDate: '2024-02-10'
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    reportType: '',
    frequency: '',
    recipients: '',
    startDate: ''
  });

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'bg-blue-100 text-blue-800';
      case 'monthly': return 'bg-green-100 text-green-800';
      case 'quarterly': return 'bg-purple-100 text-purple-800';
      case 'annually': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNextRun = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Report Scheduler</h2>
          <p className="text-muted-foreground">Automate report generation and delivery</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Active Schedules</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {scheduledReports.filter(r => r.isActive).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Next Report</span>
            </div>
            <div className="text-2xl font-bold mt-1">Today</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Reports Sent</span>
            </div>
            <div className="text-2xl font-bold mt-1">24</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Recipients</span>
            </div>
            <div className="text-2xl font-bold mt-1">8</div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledReports.map(schedule => (
              <div key={schedule.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch checked={schedule.isActive} />
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    
                    <div>
                      <h4 className="font-medium">{schedule.name}</h4>
                      <p className="text-sm text-gray-600">{schedule.reportType}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Badge className={`text-xs ${getFrequencyColor(schedule.frequency)}`}>
                        {schedule.frequency}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        Next: {formatNextRun(schedule.nextRun)}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-3 w-3" />
                    <span>{schedule.recipients.length} recipients</span>
                  </div>
                  {schedule.lastRun && (
                    <span>Last run: {new Date(schedule.lastRun).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Schedule Form */}
      {showCreateForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>Schedule New Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Schedule Name</Label>
                <Input
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule({...newSchedule, name: e.target.value})}
                  placeholder="Enter schedule name"
                />
              </div>

              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select 
                  value={newSchedule.reportType}
                  onValueChange={(value) => setNewSchedule({...newSchedule, reportType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quarterly">Oregon EPR Quarterly</SelectItem>
                    <SelectItem value="material">Material Breakdown</SelectItem>
                    <SelectItem value="compliance">Compliance Summary</SelectItem>
                    <SelectItem value="custom">Custom Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select 
                  value={newSchedule.frequency}
                  onValueChange={(value) => setNewSchedule({...newSchedule, frequency: value})}
                >
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

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newSchedule.startDate}
                  onChange={(e) => setNewSchedule({...newSchedule, startDate: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Recipients (comma-separated emails)</Label>
              <Input
                value={newSchedule.recipients}
                onChange={(e) => setNewSchedule({...newSchedule, recipients: e.target.value})}
                placeholder="email1@company.com, email2@company.com"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={() => setShowCreateForm(false)}>
                Create Schedule
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
