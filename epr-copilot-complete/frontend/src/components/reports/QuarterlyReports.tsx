
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Download, Settings, FileText, CheckCircle, Clock, AlertTriangle, Users, Info, X } from 'lucide-react';
import { ReportList } from './ReportList';
import { ReportGenerator } from './ReportGenerator';
import { ReportViewer } from './ReportViewer';
import { ReportBuilder } from './ReportBuilder';
import { ExportCenter } from './ExportCenter';
import { CollaborativeReports } from './CollaborativeReports';
import type { QuarterlyReport } from '@/services/reportService';

export function QuarterlyReports() {
  const [currentView, setCurrentView] = useState<'list' | 'generator' | 'viewer' | 'builder' | 'export' | 'collaboration'>('list');
  const [reports, setReports] = useState<QuarterlyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<QuarterlyReport | null>(null);
  const [showGuidanceModal, setShowGuidanceModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [showGuidanceBanner, setShowGuidanceBanner] = useState(true);

  useEffect(() => {
    const hasSeenGuidance = localStorage.getItem('reports-guidance-dismissed');
    if (!hasSeenGuidance) {
      setShowGuidanceModal(true);
    } else {
      setShowGuidanceBanner(false);
    }
  }, []);

  useEffect(() => {
    const handleTutorialNestedNavigation = (event: CustomEvent) => {
      const { subPage, section } = event.detail;
      
      if (subPage === 'reports') {
        if (section === 'builder') {
          setCurrentView('builder');
        } else if (section === 'export') {
          setCurrentView('export');
        }
      }
    };

    window.addEventListener('tutorialNestedNavigation', handleTutorialNestedNavigation as EventListener);
    
    return () => {
      window.removeEventListener('tutorialNestedNavigation', handleTutorialNestedNavigation as EventListener);
    };
  }, []);

  const handleCloseGuidance = () => {
    if (dontShowAgain) {
      localStorage.setItem('reports-guidance-dismissed', 'true');
      setShowGuidanceBanner(false);
    }
    setShowGuidanceModal(false);
  };

  const dismissBanner = () => {
    setShowGuidanceBanner(false);
  };

  const handleViewReport = (report: QuarterlyReport) => {
    setSelectedReport(report);
    setCurrentView('viewer');
  };

  const GuidanceContent = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Generating Your Compliance Reports</h3>
      <p className="text-sm text-muted-foreground">
        Before exporting, ensure your settings are correct for the intended jurisdiction.
      </p>
      <ul className="space-y-2 text-sm">
        <li>
          <strong>For California (SB 54):</strong> Generate a full material breakdown report. Ensure your sales data is complete for the entire calendar year.
        </li>
        <li>
          <strong>For Oregon (RMA):</strong> Your report should include detailed weights for all packaging components. Oregon's PRO requires highly granular data.
        </li>
        <li>
          <strong>For Municipal Reimbursement (e.g., Maine LD 1541):</strong> Focus on generating reports that clearly delineate material types and weights, as this data is used to calculate reimbursement rates.
        </li>
      </ul>
      <p className="text-sm text-muted-foreground">
        Check your data in the Product and Material catalogs for accuracy before generating a final report.
      </p>
    </div>
  );

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
            {/* Guidance Modal */}
            <Dialog open={showGuidanceModal} onOpenChange={setShowGuidanceModal}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Report Generation Guidance</DialogTitle>
                  <DialogDescription>
                    Important information for generating accurate compliance reports
                  </DialogDescription>
                </DialogHeader>
                <GuidanceContent />
                <DialogFooter className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dont-show-again"
                      checked={dontShowAgain}
                      onCheckedChange={(checked) => setDontShowAgain(checked === true)}
                    />
                    <label htmlFor="dont-show-again" className="text-sm">
                      Don't show this again
                    </label>
                  </div>
                  <Button onClick={handleCloseGuidance}>
                    Got it
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Guidance Banner */}
            {showGuidanceBanner && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <GuidanceContent />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={dismissBanner}
                      className="ml-4 h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Quarterly Reports</h2>
                <p className="text-muted-foreground">Manage your EPR compliance reports</p>
              </div>
              
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Info className="h-4 w-4 mr-2" />
                      Guidance
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96">
                    <GuidanceContent />
                  </PopoverContent>
                </Popover>
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
