
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download, Settings, FileText, CheckCircle, Clock, AlertTriangle, Users } from 'lucide-react';
import { ReportList } from './ReportList';
import { ReportGenerator } from './ReportGenerator';
import { ReportViewer } from './ReportViewer';
import { ReportBuilder } from './ReportBuilder';
import { ExportCenter } from './ExportCenter';
import { CollaborativeReports } from './CollaborativeReports';
import type { QuarterlyReport } from '@/services/reportService';

export function QuarterlyReports() {
  const [currentView, setCurrentView] = useState<'list' | 'generator' | 'viewer' | 'builder' | 'export' | 'collaboration'>('list');
  const [reports, setReports] = useState<QuarterlyReport[]>([
    {
      id: 'Q3-2023',
      quarter: 'Q3',
      year: 2023,
      status: 'Submitted',
      createdDate: '2023-09-15',
      submissionDate: '2023-10-28',
      dueDate: '2023-10-30',
      products: [],
      summary: {
        totalProducts: 0,
        totalWeight: 0,
        totalUnits: 0,
        recyclablePercentage: 0,
        materialBreakdown: {}
      },
      fees: {
        totalBaseFee: 0,
        recyclabilityDiscount: 0,
        totalDue: 0,
        paymentStatus: 'Paid'
      }
    },
    {
      id: 'Q4-2023',
      quarter: 'Q4',
      year: 2023,
      status: 'Draft',
      createdDate: '2023-12-20',
      dueDate: '2024-01-30',
      products: [],
      summary: {
        totalProducts: 0,
        totalWeight: 0,
        totalUnits: 0,
        recyclablePercentage: 0,
        materialBreakdown: {}
      },
      fees: {
        totalBaseFee: 0,
        recyclabilityDiscount: 0,
        totalDue: 0,
        paymentStatus: 'Pending'
      }
    }
  ]);
  const [selectedReport, setSelectedReport] = useState<QuarterlyReport | null>(null);

  const handleViewReport = (report: QuarterlyReport) => {
    setSelectedReport(report);
    setCurrentView('viewer');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'generator':
        return (
          <ReportGenerator
            onBack={() => setCurrentView('list')}
            onReportCreated={(report) => {
              setReports([report, ...reports]);
              setCurrentView('list');
            }}
          />
        );
      case 'viewer':
        return selectedReport ? (
          <ReportViewer
            report={selectedReport}
            onBack={() => setCurrentView('list')}
          />
        ) : null;
      case 'builder':
        return (
          <ReportBuilder
            onBack={() => setCurrentView('list')}
            onSaveReport={(report) => {
              console.log('Saving custom report:', report);
              setCurrentView('list');
            }}
          />
        );
      case 'export':
        return <ExportCenter />;
      case 'collaboration':
        return <CollaborativeReports onBack={() => setCurrentView('list')} />;
      default:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Quarterly Reports</h2>
                <p className="text-muted-foreground">Manage your EPR compliance reports</p>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setCurrentView('collaboration')}>
                  <Users className="h-4 w-4 mr-2" />
                  Collaboration
                </Button>
                <Button variant="outline" onClick={() => setCurrentView('export')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Center
                </Button>
                <Button variant="outline" onClick={() => setCurrentView('builder')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Report Builder
                </Button>
                <Button onClick={() => setCurrentView('generator')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Total Reports</p>
                      <p className="text-2xl font-bold">{reports.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Submitted</p>
                      <p className="text-2xl font-bold">{reports.filter(r => r.status === 'Submitted').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium">In Progress</p>
                      <p className="text-2xl font-bold">{reports.filter(r => r.status === 'Draft').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium">Overdue</p>
                      <p className="text-2xl font-bold">{reports.filter(r => r.status === 'Overdue').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reports List */}
            <ReportList reports={reports} onViewReport={handleViewReport} />
          </div>
        );
    }
  };

  return (
    <div>
      {renderCurrentView()}
    </div>
  );
}
